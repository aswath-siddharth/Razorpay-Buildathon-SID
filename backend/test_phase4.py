import os
import sys
from datetime import date

# Set UTF-8 encoding for Windows terminal output
os.environ["PYTHONIOENCODING"] = "utf-8"
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

from app.database import SessionLocal
from app.models import Product
from app.agent.intent import IntentMandate
from app.agent.orchestrator import run_buyer_orchestration


def print_section(title: str):
    print("\n" + "=" * 70)
    print(f"  {title}")
    print("=" * 70)


def test_happy_path():
    print_section("TEST 1: HAPPY PATH (END-TO-END SUCCESS)")
    db = SessionLocal()
    try:
        # Pre-constructed mandate to avoid external LLM rate limits/delays in automated tests
        mandate = IntentMandate(
            category="running_shoes",
            budget_max=3000.0,
            size="9",
            delivery_by=date(2026, 8, 28),
            max_retries=2,
        )

        result = run_buyer_orchestration(
            db=db,
            user_message="Buy me running shoes under ₹3000, size 9, that can arrive by Friday",
            simulate_failure=None,
            mandate_override=mandate,
        )

        print(f"Status:          {result['status']}")
        print(f"Session ID:      {result['session_id']}")
        print(f"Selected Item:   {result['selected_product']['title']} (₹{result['selected_product']['price']:.0f})")
        print(f"Merchant:        {result['selected_product']['merchant_name']}")
        print(f"Mandate Amount:  ₹{result['payment_mandate']['amount']:.0f} (Order Ref: {result['payment_mandate']['order_ref']})")
        print(f"Razorpay Order:  {result['payment_mandate']['razorpay_order_id']}")
        print(f"Payment Link:    {result['payment_link']}")
        print(f"Retries Used:    {result['retries_used']} / {result['max_retries']}")
        print(f"Audit Events:    {len(result['audit_trail'])} logged")

        assert result["status"] == "PAYMENT_READY", "Status must be PAYMENT_READY"
        assert result["selected_product"] is not None, "Product must be selected"
        assert result["payment_mandate"]["amount"] <= 3000.0, "Amount must be within budget ceiling"
        assert result["payment_link"] is not None, "Payment link must be generated"
        assert result["retries_used"] == 0, "No retries should be used on happy path"

        print("\n>>> TEST 1 PASSED: Happy path executed flawlessly with full audit trail.")
    finally:
        db.close()


def test_failure_handling_out_of_stock_recovery():
    print_section("TEST 2: FAILURE HANDLING - MID-FLOW STOCKOUT & BOUNDED RECOVERY")
    db = SessionLocal()
    try:
        mandate = IntentMandate(
            category="running_shoes",
            budget_max=3000.0,
            size="9",
            delivery_by=date(2026, 8, 28),
            max_retries=2,
        )

        result = run_buyer_orchestration(
            db=db,
            user_message="Buy me running shoes under ₹3000, size 9, that can arrive by Friday",
            simulate_failure="out_of_stock",
            mandate_override=mandate,
        )

        print(f"Status:          {result['status']}")
        print(f"Session ID:      {result['session_id']}")
        print(f"Retries Used:    {result['retries_used']} of {result['max_retries']}")
        print(f"\n--- Failure Details Handled Gracefully ---")
        fh = result["failure_handled"]
        print(f"Failure Mode:    {fh['mode']}")
        print(f"Failed Item:     {fh['failed_candidate']['title']} (Price: ₹{fh['failed_candidate']['price']:.0f})")
        print(f"Reason:          {fh['reason']}")
        print(f"Fallback To:     {fh['fallback_to']['title']} (Price: ₹{fh['fallback_to']['price']:.0f}, Score: {fh['fallback_to']['score']})")

        print(f"\n--- Final Selected Product After Recovery ---")
        print(f"Product:         {result['selected_product']['title']} (₹{result['selected_product']['price']:.0f})")
        print(f"Merchant:        {result['selected_product']['merchant_name']}")
        print(f"Payment Link:    {result['payment_link']}")

        print(f"\n--- Audit Trail Timeline ---")
        for ev in result["audit_trail"]:
            print(f"  [{ev['status']:<8}] {ev['actor']:<12} {ev['action']:<25} -> {ev['reasoning']}")

        assert result["status"] == "PAYMENT_READY", "Should recover and reach PAYMENT_READY"
        assert result["retries_used"] == 1, "Must use exactly 1 retry"
        assert fh is not None, "Failure handled details must be populated"
        assert fh["failed_candidate"]["title"] != result["selected_product"]["title"], "Fallback must be a different candidate"
        assert any(e["action"] == "FAILURE_DETECTED" for e in result["audit_trail"]), "Audit trail must record FAILURE_DETECTED"
        assert any(e["action"] == "BOUNDED_RETRY" for e in result["audit_trail"]), "Audit trail must record BOUNDED_RETRY"

        print("\n>>> TEST 2 PASSED: Mid-flow stockout detected, bounded retry triggered, fallback succeeded.")
    finally:
        db.close()


def test_failure_handling_retries_exhausted():
    print_section("TEST 3: FAILURE HANDLING - RETRIES EXHAUSTED (GRACEFUL ABORT)")
    db = SessionLocal()
    try:
        mandate = IntentMandate(
            category="running_shoes",
            budget_max=3000.0,
            size="9",
            delivery_by=date(2026, 8, 28),
            max_retries=0,  # 0 retries allowed
        )

        result = run_buyer_orchestration(
            db=db,
            user_message="Buy me running shoes under ₹3000, size 9, that can arrive by Friday",
            simulate_failure="out_of_stock",
            mandate_override=mandate,
        )

        print(f"Status:          {result['status']}")
        print(f"Session ID:      {result['session_id']}")
        print(f"Message:         {result['message']}")
        print(f"Retries Used:    {result['retries_used']} / {result['max_retries']}")
        print(f"Selected Item:   {result['selected_product']}")
        print(f"Payment Mandate: {result['payment_mandate']}")

        assert result["status"] == "RETRIES_EXHAUSTED", "Status must be RETRIES_EXHAUSTED"
        assert result["selected_product"] is None, "No product must be selected"
        assert result["payment_mandate"] is None, "No payment mandate must be created"
        assert result["payment_link"] is None, "No payment link must be generated"
        assert any(e["action"] == "PURCHASE_ABORTED" for e in result["audit_trail"]), "Audit trail must record PURCHASE_ABORTED"

        print("\n>>> TEST 3 PASSED: Zero money spent, purchase aborted gracefully when retries exhausted.")
    finally:
        db.close()


def test_real_db_stock_failure_and_recovery():
    print_section("TEST 4: LIVE DB STOCK ZEROING & AUTOMATIC CANDIDATE FALLBACK")
    db = SessionLocal()
    top_prod = None
    original_stock = 2
    try:
        mandate = IntentMandate(
            category="running_shoes",
            budget_max=3000.0,
            size="9",
            delivery_by=date(2026, 8, 28),
            max_retries=2,
        )

        def deplete_candidate_mid_flow(candidates, session_db):
            nonlocal top_prod, original_stock
            first_id = candidates[0]["product_id"]
            top_prod = session_db.query(Product).filter(Product.id == first_id).first()
            original_stock = top_prod.stock
            print(f"\n[Mid-flow Event] Product '{top_prod.title}' was in stock ({original_stock}) during discovery,")
            print(f"                 simulating concurrent depletion to 0 right before checkout reservation...")
            top_prod.stock = 0
            session_db.commit()

        result = run_buyer_orchestration(
            db=db,
            user_message="Buy me running shoes under ₹3000, size 9, that can arrive by Friday",
            simulate_failure=None,
            mandate_override=mandate,
            on_discovery_complete=deplete_candidate_mid_flow,
        )

        print(f"\nExecution Result:")
        print(f"Status:        {result['status']}")
        print(f"Retries Used:  {result['retries_used']} of {result['max_retries']}")
        print(f"Chosen Item:   {result['selected_product']['title']} (Price: ₹{result['selected_product']['price']:.0f})")
        print(f"Payment Link:  {result['payment_link']}")

        assert result["status"] == "PAYMENT_READY"
        assert result["retries_used"] == 1
        assert result["selected_product"]["title"] == "Nike Downshifter 12", "Must have fallen back to candidate #2"

        print("\n>>> TEST 4 PASSED: Real database inventory depletion triggered automatic graceful fallback.")
    finally:
        if top_prod:
            top_prod.stock = original_stock
            db.commit()
            print(f"Cleaned up: Restored stock of '{top_prod.title}' back to {original_stock}.")
        db.close()



if __name__ == "__main__":
    print("\n======================================================================")
    print("        AI BUYER PHASE 4 VERIFICATION SUITE: FAILURE HANDLING         ")
    print("======================================================================")
    test_happy_path()
    test_failure_handling_out_of_stock_recovery()
    test_failure_handling_retries_exhausted()
    test_real_db_stock_failure_and_recovery()
    print_section("ALL PHASE 4 AUTOMATED TESTS PASSED SUCCESSFULLY!")
