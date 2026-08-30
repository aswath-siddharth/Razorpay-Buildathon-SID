import os
from datetime import datetime, timedelta, timezone
from uuid import uuid4
from typing import Optional, Callable

import razorpay
from dotenv import load_dotenv
from sqlalchemy.orm import Session

from ..models import Product, PaymentMandate
from .intent import parse_intent, IntentMandate
from .buyer import discover_products
from .audit import log_audit_event, get_audit_events_by_session


load_dotenv()

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")

razorpay_client = None
if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET:
    razorpay_client = razorpay.Client(
        auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)
    )


def run_buyer_orchestration(
    db: Session,
    user_message: str,
    simulate_failure: Optional[str] = None,
    max_retries_override: Optional[int] = None,
    mandate_override: Optional[IntentMandate] = None,
    on_discovery_complete: Optional[Callable[[list[dict], Session], None]] = None,
) -> dict:

    """
    End-to-End Buyer Agent Orchestrator with State Machine and Graceful Failure Recovery.

    States:
      1. PARSE_INTENT: Natural language -> strict IntentMandate
      2. DISCOVER_PRODUCTS: Hard constraint filtering & soft multi-factor scoring
      3. EVALUATE_AND_PURCHASE: Inventory reservation with Bounded Retries & Fallback
      4. AUTHORIZE: Issue single-use amount-bound PaymentMandate (logged before write)
      5. PAY: Create Razorpay Order and hosted Payment Link
      6. CONFIRM: Format user confirmation and compile chronological audit trail
    """
    session_id = f"session_{uuid4().hex[:12]}"

    # -------------------------------------------------------------------------
    # STATE 1: PARSE_INTENT
    # -------------------------------------------------------------------------
    log_audit_event(
        db=db,
        session_id=session_id,
        actor="buyer_agent",
        action="PARSE_INTENT",
        status="INFO",
        reasoning="Parsing natural language query into trusted IntentMandate with strict bounds.",
        input_data={"user_message": user_message},
    )

    if mandate_override is not None:
        mandate = mandate_override
    else:
        mandate = parse_intent(user_message)

    if max_retries_override is not None and max_retries_override >= 0:
        mandate.max_retries = max_retries_override

    log_audit_event(
        db=db,
        session_id=session_id,
        actor="buyer_agent",
        action="INTENT_PARSED",
        status="SUCCESS",
        reasoning=(
            f"Intent extracted: Category='{mandate.category}', Budget Ceiling=₹{mandate.budget_max or 0:.0f}, "
            f"Size='{mandate.size}', Delivery By='{mandate.delivery_by}', Max Retries={mandate.max_retries}."
        ),
        output_data=mandate.model_dump(mode="json"),
    )

    # -------------------------------------------------------------------------
    # STATE 2: DISCOVER_PRODUCTS
    # -------------------------------------------------------------------------
    log_audit_event(
        db=db,
        session_id=session_id,
        actor="buyer_agent",
        action="DISCOVER_PRODUCTS",
        status="INFO",
        reasoning="Querying merchant catalogs and ranking candidates via deterministic scoring function.",
        input_data={
            "budget_max": mandate.budget_max,
            "category": mandate.category,
            "size": mandate.size,
            "delivery_by": str(mandate.delivery_by) if mandate.delivery_by else None,
        },
    )

    discovery_result = discover_products(db=db, mandate=mandate)
    ranked_candidates = discovery_result.get("ranked_candidates", [])

    log_audit_event(
        db=db,
        session_id=session_id,
        actor="buyer_agent",
        action="PRODUCTS_SCORED",
        status="SUCCESS",
        reasoning=(
            f"Evaluated {discovery_result['total_products_considered']} products. "
            f"{len(ranked_candidates)} met all hard constraints. Top candidate scored {ranked_candidates[0]['score'] if ranked_candidates else 0}."
        ),
        output_data={
            "matching_count": len(ranked_candidates),
            "top_3_candidates": [
                {
                    "title": c["title"],
                    "merchant": c["merchant"],
                    "price": c["price"],
                    "score": c["score"],
                }
                for c in ranked_candidates[:3]
            ],
        },
    )

    if not ranked_candidates:
        log_audit_event(
            db=db,
            session_id=session_id,
            actor="buyer_agent",
            action="PURCHASE_ABORTED",
            status="FAILED",
            reasoning="No products met all hard constraints (size, budget, delivery deadline, stock). Aborting.",
        )
        audit_trail = [
            ev.__dict__ for ev in get_audit_events_by_session(db, session_id)
        ]
        return {
            "session_id": session_id,
            "status": "NO_MATCH",
            "message": "No matching products found within your specified budget, size, or delivery constraints.",
            "mandate": mandate.model_dump(mode="json"),
            "retries_used": 0,
            "max_retries": mandate.max_retries,
            "failure_handled": None,
            "selected_product": None,
            "payment_mandate": None,
            "razorpay_order": None,
            "payment_link": None,
            "audit_trail": audit_trail,
        }

    # Hook for simulating live mid-flow events (e.g. concurrent race condition depletion)
    if on_discovery_complete:
        on_discovery_complete(ranked_candidates, db)

    # -------------------------------------------------------------------------
    # STATE 3: EVALUATE_AND_PURCHASE (Bounded Retries & Fallback Loop)
    # -------------------------------------------------------------------------

    max_retries = mandate.max_retries
    retries_used = 0
    candidate_index = 0
    selected_candidate = None
    selected_db_product = None
    failure_handled = None

    while candidate_index < len(ranked_candidates):
        candidate = ranked_candidates[candidate_index]
        product_id = candidate["product_id"]

        # Fetch fresh database record for candidate
        db_product = db.query(Product).filter(Product.id == product_id).first()

        log_audit_event(
            db=db,
            session_id=session_id,
            actor="buyer_agent",
            action="INVENTORY_CHECK",
            status="INFO",
            reasoning=(
                f"Attempting inventory reservation for Rank #{candidate_index + 1}: "
                f"'{candidate['title']}' from '{candidate['merchant']}' (Price: ₹{candidate['price']:.0f})."
            ),
            input_data={"product_id": product_id, "title": candidate["title"]},
        )

        # Failure detection logic:
        # 1. Primary failure mode: Out-of-Stock mid-flow (simulated or real DB stock == 0)
        # 2. Secondary failure mode: Price mismatch (simulated price jump)
        is_failure = False
        failure_mode = None
        failure_reason = ""

        if simulate_failure == "out_of_stock" and candidate_index == 0:
            is_failure = True
            failure_mode = "out_of_stock"
            failure_reason = (
                f"Mid-flow stockout: Product '{candidate['title']}' became unavailable during checkout reservation "
                f"(merchant stock depleted)."
            )
        elif simulate_failure == "price_mismatch" and candidate_index == 0:
            is_failure = True
            failure_mode = "price_mismatch"
            jumped_price = candidate["price"] + 700
            failure_reason = (
                f"Price mismatch: Merchant checkout price ₹{jumped_price:.0f} exceeds authorized "
                f"mandate budget ₹{mandate.budget_max or 0:.0f}."
            )
        elif not db_product or db_product.stock <= 0:
            is_failure = True
            failure_mode = "out_of_stock"
            failure_reason = f"Product '{candidate['title']}' is out of stock in live merchant inventory."

        if is_failure:
            # Detection logged
            log_audit_event(
                db=db,
                session_id=session_id,
                actor="buyer_agent",
                action="FAILURE_DETECTED",
                status="FAILED",
                reasoning=failure_reason,
                input_data={
                    "failed_candidate": candidate["title"],
                    "failure_mode": failure_mode,
                    "attempt_index": candidate_index + 1,
                },
            )

            # Bounded retry evaluation
            if retries_used < max_retries and (candidate_index + 1) < len(ranked_candidates):
                retries_used += 1
                next_candidate = ranked_candidates[candidate_index + 1]

                failure_handled = {
                    "mode": failure_mode,
                    "failed_candidate": {
                        "id": candidate["product_id"],
                        "title": candidate["title"],
                        "merchant": candidate["merchant"],
                        "price": candidate["price"],
                    },
                    "reason": failure_reason,
                    "fallback_to": {
                        "id": next_candidate["product_id"],
                        "title": next_candidate["title"],
                        "merchant": next_candidate["merchant"],
                        "price": next_candidate["price"],
                        "score": next_candidate["score"],
                    },
                    "retry_number": retries_used,
                    "max_retries": max_retries,
                }

                log_audit_event(
                    db=db,
                    session_id=session_id,
                    actor="buyer_agent",
                    action="BOUNDED_RETRY",
                    status="RETRYING",
                    reasoning=(
                        f"Bounded Retry {retries_used} of {max_retries}: Falling back to next-best candidate "
                        f"Rank #{candidate_index + 2}: '{next_candidate['title']}' from '{next_candidate['merchant']}' "
                        f"(Price: ₹{next_candidate['price']:.0f}, Score: {next_candidate['score']})."
                    ),
                    input_data={"retries_used": retries_used, "max_retries": max_retries},
                    output_data={"next_candidate": next_candidate["title"]},
                )

                candidate_index += 1
                continue
            else:
                # Retries exhausted or no further candidates
                log_audit_event(
                    db=db,
                    session_id=session_id,
                    actor="buyer_agent",
                    action="PURCHASE_ABORTED",
                    status="FAILED",
                    reasoning=(
                        f"All {retries_used}/{max_retries} authorized retries were exhausted or no viable candidates "
                        f"remain. Safely aborting purchase without spending user funds."
                    ),
                    input_data={"retries_used": retries_used, "max_retries": max_retries},
                )
                audit_trail = [
                    ev.__dict__ for ev in get_audit_events_by_session(db, session_id)
                ]
                return {
                    "session_id": session_id,
                    "status": "RETRIES_EXHAUSTED",
                    "message": (
                        f"Purchase aborted: {failure_reason} All {max_retries} retries permitted by your "
                        f"mandate were exhausted. Zero funds were charged."
                    ),
                    "mandate": mandate.model_dump(mode="json"),
                    "retries_used": retries_used,
                    "max_retries": max_retries,
                    "failure_handled": {
                        "mode": failure_mode,
                        "failed_candidate": candidate,
                        "reason": failure_reason,
                        "retries_exhausted": True,
                    },
                    "selected_product": None,
                    "payment_mandate": None,
                    "razorpay_order": None,
                    "payment_link": None,
                    "audit_trail": audit_trail,
                }

        # Candidate passed verification!
        selected_candidate = candidate
        selected_db_product = db_product
        log_audit_event(
            db=db,
            session_id=session_id,
            actor="buyer_agent",
            action="INVENTORY_RESERVED",
            status="SUCCESS",
            reasoning=(
                f"Successfully secured item: '{db_product.title}' at ₹{db_product.price:.0f} "
                f"from '{candidate['merchant']}' (Available stock: {db_product.stock})."
            ),
            output_data={
                "product_id": db_product.id,
                "title": db_product.title,
                "price": db_product.price,
            },
        )
        break

    # -------------------------------------------------------------------------
    # STATE 4: AUTHORIZE (Create Scoped PaymentMandate)
    # -------------------------------------------------------------------------
    order_ref = f"order_{uuid4().hex}"
    amount = selected_db_product.price

    # Structural security check: Mandate amount must never exceed budget ceiling
    if mandate.budget_max is not None and amount > mandate.budget_max:
        log_audit_event(
            db=db,
            session_id=session_id,
            actor="buyer_agent",
            action="MANDATE_REJECTED",
            status="FAILED",
            reasoning=f"Candidate price ₹{amount:.0f} violates hard budget constraint ₹{mandate.budget_max:.0f}.",
        )
        raise ValueError("Candidate price exceeds authorized budget")

    expires_at = (datetime.now(timezone.utc) + timedelta(minutes=10)).isoformat()

    # Log BEFORE writing PaymentMandate to database (Core Habit: log before act)
    log_audit_event(
        db=db,
        session_id=session_id,
        actor="buyer_agent",
        action="ISSUE_PAYMENT_MANDATE",
        status="INFO",
        mandate_ref=order_ref,
        reasoning=(
            f"Issuing single-use PaymentMandate for ₹{amount:.0f} bound to order_ref='{order_ref}'. "
            f"Strictly bounded to budget ceiling ₹{mandate.budget_max or amount:.0f}. Valid for 10 minutes."
        ),
        input_data={
            "amount": amount,
            "order_ref": order_ref,
            "merchant_id": selected_db_product.merchant_id,
            "budget_max": mandate.budget_max,
        },
    )

    payment_mandate = PaymentMandate(
        amount=amount,
        merchant_id=selected_db_product.merchant_id,
        order_ref=order_ref,
        expires_at=expires_at,
        single_use=True,
        used=False,
        status="active",
    )
    db.add(payment_mandate)
    db.commit()
    db.refresh(payment_mandate)

    log_audit_event(
        db=db,
        session_id=session_id,
        actor="buyer_agent",
        action="MANDATE_CREATED",
        status="SUCCESS",
        mandate_ref=order_ref,
        reasoning=f"PaymentMandate #{payment_mandate.id} registered and active in database.",
        output_data={"mandate_id": payment_mandate.id, "amount": payment_mandate.amount},
    )

    # -------------------------------------------------------------------------
    # STATE 5: PAY (Razorpay Order & Payment Link)
    # -------------------------------------------------------------------------
    amount_paise = int(round(payment_mandate.amount * 100))
    razorpay_order_id = None
    payment_link_url = None
    order_dict = {}

    if razorpay_client:
        # Log before calling Orders API
        log_audit_event(
            db=db,
            session_id=session_id,
            actor="buyer_agent",
            action="CREATE_RAZORPAY_ORDER",
            status="INFO",
            mandate_ref=order_ref,
            reasoning=(
                f"Calling Razorpay Orders API for exactly ₹{payment_mandate.amount:.0f} ({amount_paise} paise) "
                f"inheriting mandate amount. Receipt='{order_ref}'."
            ),
            input_data={"amount_paise": amount_paise, "currency": "INR", "receipt": order_ref},
        )

        try:
            rzp_order = razorpay_client.order.create(
                data={
                    "amount": amount_paise,
                    "currency": "INR",
                    "receipt": order_ref,
                }
            )
            razorpay_order_id = rzp_order["id"]
            payment_mandate.razorpay_order_id = razorpay_order_id
            db.commit()

            order_dict = {
                "id": razorpay_order_id,
                "amount": payment_mandate.amount,
                "currency": "INR",
                "status": rzp_order.get("status", "created"),
            }

            log_audit_event(
                db=db,
                session_id=session_id,
                actor="razorpay",
                action="ORDER_CONFIRMED",
                status="SUCCESS",
                mandate_ref=order_ref,
                reasoning=f"Razorpay order '{razorpay_order_id}' created successfully.",
                output_data=order_dict,
            )

            # Create Payment Link
            log_audit_event(
                db=db,
                session_id=session_id,
                actor="buyer_agent",
                action="CREATE_PAYMENT_LINK",
                status="INFO",
                mandate_ref=order_ref,
                reasoning=f"Creating hosted checkout payment link for Razorpay order '{razorpay_order_id}'.",
            )

            razorpay_expiry = datetime.now(timezone.utc) + timedelta(minutes=20)
            rzp_link = razorpay_client.payment_link.create(
                data={
                    "amount": amount_paise,
                    "currency": "INR",
                    "accept_partial": False,
                    "reference_id": order_ref,
                    "description": f"AI Buyer Purchase - {selected_db_product.title}",
                    "expire_by": int(razorpay_expiry.timestamp()),
                }
            )
            payment_link_url = rzp_link.get("short_url")

            log_audit_event(
                db=db,
                session_id=session_id,
                actor="razorpay",
                action="PAYMENT_LINK_GENERATED",
                status="SUCCESS",
                mandate_ref=order_ref,
                reasoning=f"Hosted checkout URL generated: {payment_link_url}",
                output_data={"payment_link": payment_link_url, "link_id": rzp_link.get("id")},
            )
        except Exception as exc:
            log_audit_event(
                db=db,
                session_id=session_id,
                actor="razorpay",
                action="PAYMENT_API_ERROR",
                status="FAILED",
                mandate_ref=order_ref,
                reasoning=f"Razorpay API call failed: {str(exc)}",
            )
            payment_link_url = None

    # -------------------------------------------------------------------------
    # STATE 6: CONFIRM
    # -------------------------------------------------------------------------
    confirmation_message = (
        f"Selected '{selected_db_product.title}' from {selected_candidate['merchant']} for ₹{selected_db_product.price:.0f}, "
        f"arriving by {selected_db_product.delivery_eta}."
    )
    if failure_handled:
        confirmation_message += (
            f" (Gracefully recovered from '{failure_handled['failed_candidate']['title']}' "
            f"{failure_handled['mode'].replace('_', ' ')} on retry {retries_used}/{max_retries})."
        )

    log_audit_event(
        db=db,
        session_id=session_id,
        actor="buyer_agent",
        action="PURCHASE_COMPLETED",
        status="SUCCESS",
        mandate_ref=order_ref,
        reasoning=confirmation_message,
        output_data={
            "product": selected_db_product.title,
            "amount": amount,
            "payment_link": payment_link_url,
        },
    )

    audit_events = get_audit_events_by_session(db, session_id)
    audit_trail = []
    for ev in audit_events:
        audit_trail.append({
            "id": ev.id,
            "timestamp": ev.timestamp,
            "actor": ev.actor,
            "action": ev.action,
            "status": ev.status,
            "mandate_ref": ev.mandate_ref,
            "reasoning": ev.reasoning,
            "input_data": ev.input_data,
            "output_data": ev.output_data,
        })

    return {
        "session_id": session_id,
        "status": "PAYMENT_READY",
        "message": confirmation_message,
        "mandate": mandate.model_dump(mode="json"),
        "retries_used": retries_used,
        "max_retries": max_retries,
        "failure_handled": failure_handled,
        "selected_product": {
            "id": selected_db_product.id,
            "merchant_id": selected_db_product.merchant_id,
            "merchant_name": selected_candidate["merchant"],
            "title": selected_db_product.title,
            "price": selected_db_product.price,
            "stock": selected_db_product.stock,
            "delivery_eta": selected_db_product.delivery_eta,
            "attributes": selected_db_product.attributes,
        },
        "payment_mandate": {
            "id": payment_mandate.id,
            "order_ref": payment_mandate.order_ref,
            "amount": payment_mandate.amount,
            "expires_at": payment_mandate.expires_at,
            "status": payment_mandate.status,
            "razorpay_order_id": payment_mandate.razorpay_order_id,
        },
        "razorpay_order": order_dict,
        "payment_link": payment_link_url,
        "audit_trail": audit_trail,
    }
