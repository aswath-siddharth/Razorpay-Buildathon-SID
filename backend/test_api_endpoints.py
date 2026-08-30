import os
import sys

os.environ["PYTHONIOENCODING"] = "utf-8"
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_api_suite():
    print("\n" + "=" * 70)
    print("  FASTAPI ENDPOINTS VERIFICATION SUITE")
    print("=" * 70)

    # 1. Test POST /buyer/run with simulate_failure="out_of_stock"
    print("\n[1] Testing POST /buyer/run with simulate_failure='out_of_stock'...")
    res = client.post(
        "/buyer/run",
        json={
            "message": "Buy me running shoes under ₹3000, size 9, that can arrive by Friday",
            "simulate_failure": "out_of_stock",
            "max_retries": 2,
        },
    )
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    data = res.json()
    print(f"Status:       {data['status']}")
    print(f"Session ID:   {data['session_id']}")
    print(f"Chosen Item:  {data['selected_product']['title']}")
    print(f"Retries:      {data['retries_used']} / {data['max_retries']}")
    print(f"Payment Link: {data['payment_link']}")
    session_id = data["session_id"]
    assert data["status"] == "PAYMENT_READY"
    assert data["retries_used"] == 1
    assert data["failure_handled"]["mode"] == "out_of_stock"

    # 2. Test GET /buyer/audit/{session_id}
    print(f"\n[2] Testing GET /buyer/audit/{session_id}...")
    audit_res = client.get(f"/buyer/audit/{session_id}")
    assert audit_res.status_code == 200
    events = audit_res.json()
    print(f"Found {len(events)} audit events in session timeline:")
    for ev in events[:5]:
        print(f"  - [{ev['action']}] {ev['reasoning']}")
    print(f"  ... ({len(events) - 5} more events)")
    assert any(ev["action"] == "FAILURE_DETECTED" for ev in events)
    assert any(ev["action"] == "BOUNDED_RETRY" for ev in events)

    # 3. Test GET /buyer/audit (list sessions)
    print("\n[3] Testing GET /buyer/audit (recent sessions)...")
    sessions_res = client.get("/buyer/audit")
    assert sessions_res.status_code == 200
    sessions = sessions_res.json()
    print(f"Retrieved {len(sessions)} recent sessions.")
    assert len(sessions) > 0

    # 4. Test PATCH /products/{id}/stock
    print("\n[4] Testing PATCH /products/1/stock (live stock modification)...")
    stock_res = client.patch("/products/1/stock?stock=14")
    assert stock_res.status_code == 200
    prod = stock_res.json()
    print(f"Updated product '{prod['title']}' stock to {prod['stock']}.")
    assert prod["stock"] == 14

    # Restore stock
    client.patch("/products/1/stock?stock=12")

    # 5. Test POST /buyer/run with simulate_failure="price_mismatch"
    print("\n[5] Testing POST /buyer/run with simulate_failure='price_mismatch'...")
    res_pm = client.post(
        "/buyer/run",
        json={
            "message": "Buy me running shoes under ₹3000, size 9, that can arrive by Friday",
            "simulate_failure": "price_mismatch",
            "max_retries": 2,
        },
    )
    assert res_pm.status_code == 200
    pm_data = res_pm.json()
    print(f"Status:       {pm_data['status']}")
    print(f"Chosen Item:  {pm_data['selected_product']['title']}")
    print(f"Retries:      {pm_data['retries_used']} / {pm_data['max_retries']}")
    print(f"Failure Mode: {pm_data['failure_handled']['mode']}")
    assert pm_data["status"] == "PAYMENT_READY"
    assert pm_data["failure_handled"]["mode"] == "price_mismatch"

    print("\n" + "=" * 70)
    print("  ALL API ENDPOINT TESTS PASSED SUCCESSFULLY!")
    print("=" * 70)


if __name__ == "__main__":
    test_api_suite()
