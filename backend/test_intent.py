from app.agent.intent import parse_intent


message = (
    "Buy me running shoes under ₹3000, "
    "size 9, that can arrive by Friday"
)

mandate = parse_intent(message)

print("\n=== USER REQUEST ===")
print(message)

print("\n=== PARSED INTENT ===")
print(mandate.model_dump())
