from datetime import date

from app.database import SessionLocal
from app.agent.intent import IntentMandate
from app.agent.buyer import discover_products


db = SessionLocal()

mandate = IntentMandate(
    category="running_shoes",
    budget_max=3000,
    size="9",
    delivery_by=date(2026, 8, 28),
    max_retries=2,
)
print("\n=== MANDATE ===")
print(mandate.model_dump())

result = discover_products(
    db=db,
    mandate=mandate,
)

print("\n=== BUYER AGENT TEST ===\n")

print("Products considered:")
print(result["total_products_considered"])

print("\nMatching products:")
print(result["matching_products"])

print("\n=== RANKING ===\n")

for index, candidate in enumerate(
    result["ranked_candidates"],
    start=1
):
    print(
        f"{index}. {candidate['title']}"
    )

    print(
        f"   Merchant: {candidate['merchant']}"
    )

    print(
        f"   Price: ₹{candidate['price']:.0f}"
    )

    print(
        f"   Rating: {candidate['merchant_rating']}"
    )

    print(
        f"   Delivery: {candidate['delivery_eta']}"
    )

    print(
        f"   Score: {candidate['score']}"
    )

    print()

print("=== SELECTED ===")

best = result["best_candidate"]

if best:
    print(best["title"])
    print(best["explanation"])
else:
    print("No matching product found.")

db.close()