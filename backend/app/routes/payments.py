from datetime import datetime, timedelta, timezone
from uuid import uuid4
import os

import razorpay
from dotenv import load_dotenv
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Header,
    Request,
)
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import PaymentMandate, Product
from ..schemas import (
    PaymentMandateCreate,
    PaymentMandateResponse,
    RazorpayOrderCreate,
    RazorpayOrderResponse,
    PaymentLinkCreate,
    PaymentLinkResponse,
)


# ---------------------------------------------------------
# Router
# ---------------------------------------------------------

router = APIRouter(
    prefix="/payments",
    tags=["payments"]
)


# ---------------------------------------------------------
# Environment
# ---------------------------------------------------------

load_dotenv()

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")
RAZORPAY_WEBHOOK_SECRET = os.getenv("RAZORPAY_WEBHOOK_SECRET")


if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
    raise RuntimeError(
        "Razorpay credentials are not configured"
    )


if not RAZORPAY_WEBHOOK_SECRET:
    raise RuntimeError(
        "Razorpay webhook secret is not configured"
    )


# ---------------------------------------------------------
# Razorpay client
# ---------------------------------------------------------

razorpay_client = razorpay.Client(
    auth=(
        RAZORPAY_KEY_ID,
        RAZORPAY_KEY_SECRET
    )
)


# =========================================================
# PAYMENT MANDATE
# =========================================================

@router.post(
    "/mandates",
    response_model=PaymentMandateResponse
)
def create_payment_mandate(
    request: PaymentMandateCreate,
    db: Session = Depends(get_db)
):
    # Find selected product
    product = (
        db.query(Product)
        .filter(Product.id == request.product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    # Product must be in stock
    if product.stock <= 0:
        raise HTTPException(
            status_code=400,
            detail="Product is out of stock"
        )

    # Backend determines the amount.
    # Never trust a payment amount supplied by the client.
    amount = product.price

    # Hard budget boundary
    if amount > request.budget_max:
        raise HTTPException(
            status_code=400,
            detail="Product price exceeds authorized budget"
        )

    # Mandate expires after 10 minutes
    expires_at = (
        datetime.now(timezone.utc)
        + timedelta(minutes=10)
    )

    # Unique reference for this purchase
    order_ref = f"order_{uuid4().hex}"

    mandate = PaymentMandate(
        amount=amount,
        merchant_id=product.merchant_id,
        order_ref=order_ref,
        expires_at=expires_at.isoformat(),
        single_use=True,
        used=False,
        status="active"
    )

    db.add(mandate)
    db.commit()
    db.refresh(mandate)

    return mandate


# =========================================================
# VALIDATE PAYMENT MANDATE
# =========================================================

@router.post(
    "/mandates/{mandate_id}/validate"
)
def validate_payment_mandate(
    mandate_id: int,
    db: Session = Depends(get_db)
):
    mandate = (
        db.query(PaymentMandate)
        .filter(PaymentMandate.id == mandate_id)
        .first()
    )

    if not mandate:
        print(
            f"Webhook ignored: payment mandate not found "
            f"for Razorpay order {razorpay_order_id}"
        )

        return {
            "status": "ignored",
            "reason": "Payment mandate not found"
        }

    # Single-use enforcement
    if mandate.used:
        raise HTTPException(
            status_code=400,
            detail="Payment mandate has already been used"
        )

    # Status enforcement
    if mandate.status != "active":
        raise HTTPException(
            status_code=400,
            detail=f"Payment mandate is {mandate.status}"
        )

    # Expiry enforcement
    expires_at = datetime.fromisoformat(
        mandate.expires_at
    )

    if expires_at <= datetime.now(timezone.utc):
        mandate.status = "expired"

        db.commit()

        raise HTTPException(
            status_code=400,
            detail="Payment mandate has expired"
        )

    return {
        "valid": True,
        "mandate_id": mandate.id,
        "amount": mandate.amount,
        "merchant_id": mandate.merchant_id,
        "order_ref": mandate.order_ref,
        "expires_at": mandate.expires_at,
        "single_use": mandate.single_use
    }


# =========================================================
# CREATE RAZORPAY ORDER
# =========================================================

@router.post(
    "/orders",
    response_model=RazorpayOrderResponse
)
def create_razorpay_order(
    request: RazorpayOrderCreate,
    db: Session = Depends(get_db)
):
    # Load mandate
    mandate = (
        db.query(PaymentMandate)
        .filter(
            PaymentMandate.id == request.mandate_id
        )
        .first()
    )

    if not mandate:
        raise HTTPException(
            status_code=404,
            detail="Payment mandate not found"
        )

    # Single-use enforcement
    if mandate.used:
        raise HTTPException(
            status_code=400,
            detail="Payment mandate has already been used"
        )

    # Status enforcement
    if mandate.status != "active":
        raise HTTPException(
            status_code=400,
            detail=f"Payment mandate is {mandate.status}"
        )

    # Expiry enforcement
    expires_at = datetime.fromisoformat(
        mandate.expires_at
    )

    if expires_at <= datetime.now(timezone.utc):
        mandate.status = "expired"

        db.commit()

        raise HTTPException(
            status_code=400,
            detail="Payment mandate has expired"
        )

    # Amount comes ONLY from the stored mandate
    amount_paise = int(
        round(mandate.amount * 100)
    )

    if amount_paise <= 0:
        raise HTTPException(
            status_code=400,
            detail="Invalid mandate amount"
        )

    # Create Razorpay order
    try:
        razorpay_order = razorpay_client.order.create(
            data={
                "amount": amount_paise,
                "currency": "INR",
                "receipt": mandate.order_ref,
            }
        )

    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=(
                "Razorpay order creation failed: "
                f"{str(exc)}"
            )
        )

    # Store Razorpay order ID
    mandate.razorpay_order_id = (
        razorpay_order["id"]
    )

    db.commit()
    db.refresh(mandate)

    return {
        "mandate_id": mandate.id,
        "razorpay_order_id": razorpay_order["id"],
        "amount": mandate.amount,
        "currency": "INR",
        "status": razorpay_order["status"],
    }


# =========================================================
# CREATE PAYMENT LINK
# =========================================================

@router.post(
    "/links",
    response_model=PaymentLinkResponse
)
def create_payment_link(
    request: PaymentLinkCreate,
    db: Session = Depends(get_db)
):
    # Load mandate
    mandate = (
        db.query(PaymentMandate)
        .filter(
            PaymentMandate.id == request.mandate_id
        )
        .first()
    )

    if not mandate:
        raise HTTPException(
            status_code=404,
            detail="Payment mandate not found"
        )

    # Single-use enforcement
    if mandate.used:
        raise HTTPException(
            status_code=400,
            detail="Payment mandate has already been used"
        )

    # Status enforcement
    if mandate.status != "active":
        raise HTTPException(
            status_code=400,
            detail=f"Payment mandate is {mandate.status}"
        )

    # Mandate expiry
    expires_at = datetime.fromisoformat(
        mandate.expires_at
    )

    if expires_at <= datetime.now(timezone.utc):
        mandate.status = "expired"

        db.commit()

        raise HTTPException(
            status_code=400,
            detail="Payment mandate has expired"
        )

    # Razorpay Order must already exist
    if not mandate.razorpay_order_id:
        raise HTTPException(
            status_code=400,
            detail=(
                "Razorpay order has not been "
                "created for this mandate"
            )
        )

    # Amount comes ONLY from the mandate
    amount_paise = int(
        round(mandate.amount * 100)
    )

    if amount_paise <= 0:
        raise HTTPException(
            status_code=400,
            detail="Invalid mandate amount"
        )

    # Razorpay Payment Links require an expiry
    # at least 15 minutes in the future.
    #
    # Use 20 minutes to safely clear the boundary.
    razorpay_expiry = (
        datetime.now(timezone.utc)
        + timedelta(minutes=20)
    )

    try:
        payment_link = (
            razorpay_client.payment_link.create(
                data={
                    "amount": amount_paise,
                    "currency": "INR",
                    "accept_partial": False,
                    "reference_id": mandate.order_ref,
                    "description": (
                        f"AI Buyer order "
                        f"{mandate.order_ref}"
                    ),
                    "expire_by": int(
                        razorpay_expiry.timestamp()
                    )
                }
            )
        )

    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=(
                "Razorpay payment link "
                "creation failed: "
                f"{str(exc)}"
            )
        )

    return {
        "mandate_id": mandate.id,
        "razorpay_order_id": (
            mandate.razorpay_order_id
        ),
        "payment_link_id": payment_link["id"],
        "payment_link": payment_link["short_url"],
        "amount": mandate.amount,
        "currency": "INR",
        "status": payment_link["status"]
    }


# =========================================================
# RAZORPAY WEBHOOK
# =========================================================

@router.post(
    "/webhook"
)
async def razorpay_webhook(
    request: Request,
    db: Session = Depends(get_db),
    x_razorpay_signature: str | None = Header(
        default=None,
        alias="X-Razorpay-Signature"
    )
):
    # -----------------------------------------------------
    # 1. Signature must exist
    # -----------------------------------------------------

    if not x_razorpay_signature:
        raise HTTPException(
            status_code=400,
            detail="Missing Razorpay webhook signature"
        )

    # -----------------------------------------------------
    # 2. Read RAW request body
    #
    # IMPORTANT:
    # Do NOT use request.json() before verification.
    # Razorpay signs the raw body.
    # -----------------------------------------------------

    raw_body = await request.body()

    # -----------------------------------------------------
    # 3. Verify Razorpay signature
    # -----------------------------------------------------

    try:
        razorpay_client.utility.verify_webhook_signature(
            raw_body.decode("utf-8"),
            x_razorpay_signature,
            RAZORPAY_WEBHOOK_SECRET
        )

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid Razorpay webhook signature"
        )

    # -----------------------------------------------------
    # 4. Parse payload AFTER signature verification
    # -----------------------------------------------------

    try:
        payload = await request.json()

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid webhook JSON payload"
        )

    event = payload.get("event")

    # -----------------------------------------------------
    # 5. Handle payment.captured
    # -----------------------------------------------------

    if event == "payment.captured":

        payment_entity = (
            payload
            .get("payload", {})
            .get("payment", {})
            .get("entity", {})
        )

        razorpay_payment_id = payment_entity.get(
            "id"
        )

        razorpay_order_id = payment_entity.get(
            "order_id"
        )

        payment_amount_paise = payment_entity.get(
            "amount"
        )

        payment_status = payment_entity.get(
            "status"
        )

        # Basic payload validation
        if not razorpay_payment_id:
            raise HTTPException(
                status_code=400,
                detail="Missing Razorpay payment ID"
            )

        if not razorpay_order_id:
            raise HTTPException(
                status_code=400,
                detail="Missing Razorpay order ID"
            )

        if payment_amount_paise is None:
            raise HTTPException(
                status_code=400,
                detail="Missing payment amount"
            )

        # -------------------------------------------------
        # Find our mandate using Razorpay order ID
        # -------------------------------------------------

        mandate = (
            db.query(PaymentMandate)
            .filter(
                PaymentMandate.razorpay_order_id
                == razorpay_order_id
            )
            .first()
        )

        if not mandate:
            raise HTTPException(
                status_code=404,
                detail=(
                    "No payment mandate found "
                    "for Razorpay order"
                )
            )

        # -------------------------------------------------
        # Idempotency
        #
        # If the webhook is delivered again after the
        # mandate was already processed, do not process
        # the payment again.
        # -------------------------------------------------

        if mandate.used:
            return {
                "status": "already_processed",
                "mandate_id": mandate.id,
                "payment_id": razorpay_payment_id
            }

        # -------------------------------------------------
        # Mandate must still be active
        # -------------------------------------------------

        if mandate.status != "active":
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Payment mandate is "
                    f"{mandate.status}"
                )
            )

        # -------------------------------------------------
        # Check mandate expiry
        # -------------------------------------------------

        expires_at = datetime.fromisoformat(
            mandate.expires_at
        )

        if expires_at <= datetime.now(timezone.utc):
            mandate.status = "expired"

            db.commit()

            raise HTTPException(
                status_code=400,
                detail="Payment mandate has expired"
            )

        # -------------------------------------------------
        # CRITICAL SECURITY CHECK:
        #
        # Payment amount must exactly match the amount
        # authorized by the mandate.
        # -------------------------------------------------

        expected_amount_paise = int(
            round(mandate.amount * 100)
        )

        if payment_amount_paise != expected_amount_paise:

            mandate.status = "payment_mismatch"

            db.commit()

            raise HTTPException(
                status_code=400,
                detail=(
                    "Payment amount does not "
                    "match payment mandate"
                )
            )

        # -------------------------------------------------
        # Payment must actually be captured
        # -------------------------------------------------

        if payment_status != "captured":
            raise HTTPException(
                status_code=400,
                detail=(
                    "Payment is not in captured state"
                )
            )

        # -------------------------------------------------
        # Payment is authentic and matches our mandate
        # -------------------------------------------------

        mandate.used = True
        mandate.status = "paid"

        db.commit()
        db.refresh(mandate)

        return {
            "status": "payment_confirmed",
            "mandate_id": mandate.id,
            "razorpay_order_id": (
                mandate.razorpay_order_id
            ),
            "razorpay_payment_id": (
                razorpay_payment_id
            ),
            "amount": mandate.amount,
            "currency": "INR"
        }

    # -----------------------------------------------------
    # Handle payment.failed
    # -----------------------------------------------------

    if event == "payment.failed":

        payment_entity = (
            payload
            .get("payload", {})
            .get("payment", {})
            .get("entity", {})
        )

        razorpay_payment_id = payment_entity.get(
            "id"
        )

        razorpay_order_id = payment_entity.get(
            "order_id"
        )

        mandate = None

        if razorpay_order_id:
            mandate = (
                db.query(PaymentMandate)
                .filter(
                    PaymentMandate.razorpay_order_id
                    == razorpay_order_id
                )
                .first()
            )

        if mandate:
            # Do not mark an already-paid mandate as failed.
            if mandate.status != "paid":
                mandate.status = "payment_failed"

                db.commit()

        return {
            "status": "payment_failed",
            "mandate_id": (
                mandate.id
                if mandate
                else None
            ),
            "razorpay_payment_id": (
                razorpay_payment_id
            ),
            "razorpay_order_id": (
                razorpay_order_id
            )
        }

    # -----------------------------------------------------
    # Other Razorpay events
    # -----------------------------------------------------

    return {
        "status": "ignored",
        "event": event
    }