"""
Phase 5 Verification Suite: Confirmation + Webhook Signature Verification + Audit Trail
"""

import sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal, Base, engine
from app.models import Product, AuditEvent, PaymentMandate
from seed import seed_database

client = TestClient(app)


def test_phase5_confirmation_and_audit():
    print("=" * 70)
    print("  PHASE 5 VERIFICATION: CONFIRMATION & AUDIT TRAIL TIMELINE")
    print("=" * 70)

    # 1. Execute buyer agent run
    request_data = {
        "message": "Buy me running shoes under ₹3000, size 9, arrive by Friday",
        "max_retries": 2,
    }
    response = client.post("/buyer/run", json=request_data)
    assert response.status_code == 200, f"Run failed: {response.text}"
    data = response.json()

    print(f"\n1. Buyer Run Response Status: {data['status']}")
    print(f"   Session ID:                {data['session_id']}")
    print(f"   Confirmation Message:      {data['message']}")
    print(f"   Product:                   {data['selected_product']['title']} (Price: ₹{data['selected_product']['price']})")
    print(f"   Merchant:                  {data['selected_product']['merchant_name']}")
    print(f"   Delivery ETA:              {data['selected_product']['delivery_eta']}")
    print(f"   Payment Mandate Ref:       {data['payment_mandate']['order_ref']}")
    print(f"   Razorpay Order ID:         {data['payment_mandate']['razorpay_order_id']}")
    print(f"   Hosted Checkout Link:      {data['payment_link']}")

    # 2. Verify Confirmation components
    assert data["selected_product"] is not None
    assert data["payment_mandate"] is not None
    assert data["payment_mandate"]["amount"] <= 3000
    assert len(data["audit_trail"]) >= 10

    # 3. Retrieve Audit Trail via Endpoint
    session_id = data["session_id"]
    audit_resp = client.get(f"/buyer/audit/{session_id}")
    assert audit_resp.status_code == 200
    events = audit_resp.json()
    print(f"\n2. Audit Trail for {session_id}: {len(events)} events logged chronologically.")

    actions_logged = [e["action"] for e in events]
    print(f"   Key Actions Logged: {', '.join(actions_logged)}")
    assert "PARSE_INTENT" in actions_logged
    assert "DISCOVER_PRODUCTS" in actions_logged
    assert "ISSUE_PAYMENT_MANDATE" in actions_logged
    assert "PURCHASE_COMPLETED" in actions_logged

    # 4. Simulate Webhook Confirmation with cryptographic signature verification
    print("\n3. Testing Cryptographic Webhook Confirmation...")
    webhook_sim_resp = client.post(
        "/payments/simulate-webhook",
        json={"session_id": session_id}
    )
    assert webhook_sim_resp.status_code == 200, f"Webhook simulation failed: {webhook_sim_resp.text}"
    webhook_data = webhook_sim_resp.json()
    print(f"   Webhook Verification: {webhook_data['status']}")
    print(f"   Signature Verified:   {webhook_data['signature_verified']}")
    print(f"   Payment ID:           {webhook_data['razorpay_payment_id']}")

    # 5. Verify updated audit trail contains PAYMENT_CONFIRMED
    updated_audit = client.get(f"/buyer/audit/{session_id}").json()
    updated_actions = [e["action"] for e in updated_audit]
    print(f"   Updated Action Count: {len(updated_actions)}")
    assert "PAYMENT_CONFIRMED" in updated_actions
    print("   >>> SUCCESS: PAYMENT_CONFIRMED event attached to session audit trail.")

    # 6. Test Tampered/Invalid Signature Rejection
    print("\n4. Testing Invalid Signature Rejection...")
    invalid_sig_resp = client.post(
        "/payments/simulate-webhook",
        json={"session_id": session_id, "simulate_invalid_signature": True}
    )
    assert invalid_sig_resp.status_code == 400
    print(f"   >>> SUCCESS: Tampered signature correctly rejected with 400 Bad Request.")

    print("\n" + "=" * 70)
    print("  ALL PHASE 5 BACKEND VERIFICATION CHECKS PASSED!")
    print("=" * 70 + "\n")


if __name__ == "__main__":
    test_phase5_confirmation_and_audit()
