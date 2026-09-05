import os
import re
import json
from datetime import date, timedelta

from dotenv import load_dotenv
from groq import Groq
from pydantic import BaseModel, Field

load_dotenv()


class IntentMandate(BaseModel):
    """
    Trusted structured representation of the user's
    shopping authorization.
    """
    category: str = Field(
        default="Running",
        description="Product category requested by the user"
    )
    categoryLabel: str = Field(
        default="running shoes",
        description="User-friendly category label"
    )
    budget_max: float | None = Field(
        default=3000.0,
        description="Maximum amount the user is willing to spend in INR"
    )
    size: str | None = Field(
        default=None,
        description="Requested product size"
    )
    delivery_deadline: str = Field(
        default="Friday (2026-08-29)",
        description="Delivery deadline requirement"
    )
    max_retries: int = Field(
        default=2,
        ge=0,
        description="Maximum number of retries allowed"
    )
    is_greeting: bool = Field(
        default=False,
        description="Whether message was purely conversational"
    )
    conversational_reply: str | None = Field(
        default=None,
        description="Conversational response if user did not request a purchase"
    )


def fallback_deterministic_parse(user_message: str) -> IntentMandate:
    """
    Resilient fallback parser when LLM is unavailable or offline.
    """
    text = user_message.lower().strip()

    is_greeting = bool(re.match(r"^(hi|hello|hey|greetings|hola|help|what can you do|who are you|hi there)[!.]*$", text))
    if is_greeting:
        return IntentMandate(
            is_greeting=True,
            conversational_reply=(
                "👋 Hello! I am your Autonomous AI Buyer Agent on Meridian.\n\n"
                "Tell me what you'd like to buy and your constraints, for example:\n"
                "• *'running shoes under ₹3000, size 9'*\n"
                "• *'smartwatch under ₹3000 by tomorrow'*\n"
                "• *'wireless audio headphones under ₹2500'*\n"
                "• *'commuter tech backpack under ₹2500'*\n\n"
                "I will find matching products across merchant catalogs, enforce your budget mandate bounds, and execute payment with single-invoice cryptographic proof!"
            )
        )

    # Budget extraction
    budget_max = 3000.0
    k_match = re.search(r"(\d+(?:\.\d+)?)\s*k\b", text)
    if k_match:
        budget_max = float(k_match.group(1)) * 1000.0
    else:
        num_match = re.search(r"(?:under|below|max|rs\.?|₹|\bless\s+than\b)\s*(\d+[\d,]*)", text) or re.search(r"(\d+[\d,]*)", text)
        if num_match:
            parsed_val = float(num_match.group(1).replace(",", ""))
            if parsed_val > 50:
                budget_max = parsed_val

    # Category extraction
    if any(w in text for w in ["smartwatch", "smart watch", "watch", "watches", "fitness tracker", "noise", "fire-boltt", "amazfit", "chronos"]):
        category = "Watches"
        category_label = "smartwatches"
    elif any(w in text for w in ["audio", "headphone", "headphones", "earbuds", "earphone", "tws", "speaker", "boat", "sony", "jbl", "soundcore"]):
        category = "Audio"
        category_label = "wireless audio"
    elif any(w in text for w in ["bag", "backpack", "pack", "duffel", "sling", "hydration"]):
        category = "Bags"
        category_label = "travel & athletic bags"
    elif any(w in text for w in ["sneaker", "sneakers", "streetwear", "casual shoe", "kicks"]):
        category = "Sneakers"
        category_label = "sneakers"
    else:
        category = "Running"
        category_label = "running shoes"

    # Delivery deadline
    if any(w in text for w in ["tomo", "tomorrow", "1 day", "urgent"]):
        eta = "Tomorrow"
    elif any(w in text for w in ["2 day", "two day", "weekend"]):
        eta = "in 2 days"
    else:
        eta = "Friday (2026-08-29)"

    # Size extraction
    size = None
    size_match = re.search(r"(?:size|sz|uk)\s*(\d+)", text)
    if size_match:
        size = size_match.group(1)
    elif category in ["Running", "Sneakers"]:
        size = "9"

    return IntentMandate(
        category=category,
        categoryLabel=category_label,
        budget_max=budget_max,
        size=size,
        delivery_deadline=eta,
        max_retries=2,
        is_greeting=False
    )


def parse_intent(user_message: str) -> IntentMandate:
    """
    Convert natural-language shopping intent into a trusted IntentMandate using Groq LLM (Llama 3.3 70B),
    with automatic deterministic fallback.
    """
    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        return fallback_deterministic_parse(user_message)

    try:
        client = Groq(api_key=api_key)

        prompt = (
            "You are the intent parser for Meridian AI Buyer Agent.\n"
            "Analyze the user's message and extract their shopping mandate.\n"
            "Available categories: 'Running', 'Sneakers', 'Audio', 'Watches', 'Bags'.\n\n"
            "Output strictly valid JSON with keys:\n"
            "- is_greeting: bool (true if user just said hi/hello/help)\n"
            "- conversational_reply: string or null\n"
            "- category: string (one of 'Running', 'Sneakers', 'Audio', 'Watches', 'Bags')\n"
            "- categoryLabel: string (e.g. 'running shoes', 'smartwatches', 'wireless audio')\n"
            "- budget_max: float or null (in INR, e.g. 3000, 1000)\n"
            "- size: string or null (e.g. '9', '44mm', 'Universal')\n"
            "- delivery_deadline: string (e.g. 'Tomorrow', 'Friday (2026-08-29)', 'in 2 days')\n"
            "- max_retries: int (default 2)"
        )

        completion = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": user_message}
            ],
            response_format={"type": "json_object"},
            temperature=0.1
        )

        content = completion.choices[0].message.content
        if not content:
            return fallback_deterministic_parse(user_message)

        data = json.loads(content)
        return IntentMandate(
            category=data.get("category") or "Running",
            categoryLabel=data.get("categoryLabel") or "running shoes",
            budget_max=float(data.get("budget_max")) if data.get("budget_max") is not None else 3000.0,
            size=str(data.get("size")) if data.get("size") else ("9" if data.get("category") in ["Running", "Sneakers"] else None),
            delivery_deadline=data.get("delivery_deadline") or "Friday (2026-08-29)",
            max_retries=int(data.get("max_retries", 2)),
            is_greeting=bool(data.get("is_greeting", False)),
            conversational_reply=data.get("conversational_reply")
        )

    except Exception as e:
        print(f"Groq parsing notice (using fallback): {e}")
        return fallback_deterministic_parse(user_message)