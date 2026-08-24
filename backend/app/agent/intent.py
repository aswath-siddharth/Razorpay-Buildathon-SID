import os
import re
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
        ...,
        description="Product category requested by the user"
    )

    budget_max: float | None = Field(
        default=None,
        description="Maximum amount the user is willing to spend"
    )

    size: str | None = Field(
        default=None,
        description="Requested product size"
    )

    delivery_by: date | None = Field(
        default=None,
        description="Latest acceptable delivery date"
    )

    max_retries: int = Field(
        default=2,
        ge=0,
        description="Maximum number of retries allowed"
    )


class RawIntent(BaseModel):
    """
    Untrusted output received from the LLM.

    We intentionally keep delivery_by as a string here because
    the LLM may return values such as 'Friday'.
    """

    category: str

    budget_max: float | None = None

    size: str | None = None

    delivery_by: str | None = None

    max_retries: int = 2


WEEKDAYS = {
    "monday": 0,
    "tuesday": 1,
    "wednesday": 2,
    "thursday": 3,
    "friday": 4,
    "saturday": 5,
    "sunday": 6,
}


def resolve_relative_delivery_date(
    user_message: str,
    today: date,
) -> date | None:
    """
    Resolve weekday references such as 'by Friday'
    deterministically.
    """

    message = user_message.lower()

    for weekday_name, weekday_number in WEEKDAYS.items():

        if re.search(
            rf"\b{weekday_name}\b",
            message
        ):
            days_ahead = (
                weekday_number - today.weekday()
            ) % 7

            return today + timedelta(
                days=days_ahead
            )

    return None


def parse_intent(
    user_message: str
) -> IntentMandate:
    """
    Convert natural-language shopping intent into
    a trusted IntentMandate using Groq.
    """

    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        raise RuntimeError(
            "GROQ_API_KEY is not configured"
        )

    client = Groq(
        api_key=api_key
    )

    today = date.today().isoformat()

    schema = {
        "type": "object",
        "properties": {
            "category": {
                "type": "string"
            },
            "budget_max": {
                "type": ["number", "null"]
            },
            "size": {
                "type": ["string", "null"]
            },
            "delivery_by": {
                "type": ["string", "null"]
            },
            "max_retries": {
                "type": "integer",
                "minimum": 0
            }
        },
        "required": [
            "category",
            "budget_max",
            "size",
            "delivery_by",
            "max_retries"
        ],
        "additionalProperties": False
    }

    completion = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are the intent parser for an AI buyer. "
                    "Extract the user's shopping constraints. "
                    f"Today's date is {today}. "
                    "Use catalog-compatible categories such as "
                    "'running_shoes'. "
                    "Do not invent constraints that the user "
                    "did not specify. "
                    "Return only JSON matching the supplied schema."
                )
            },
            {
                "role": "user",
                "content": user_message
            }
        ],
        response_format={
            "type": "json_schema",
            "json_schema": {
                "name": "intent_mandate",
                "strict": True,
                "schema": schema
            }
        },
        temperature=0
    )

    content = completion.choices[0].message.content

    if not content:
        raise ValueError(
            "Groq returned an empty response"
        )

    # --------------------------------------------------
    # STEP 1: Parse untrusted LLM output
    # --------------------------------------------------

    raw_intent = RawIntent.model_validate_json(
        content
    )

    # --------------------------------------------------
    # STEP 2: Resolve delivery date ourselves
    # --------------------------------------------------

    resolved_delivery_date = (
        resolve_relative_delivery_date(
            user_message=user_message,
            today=date.today(),
        )
    )

    if resolved_delivery_date is not None:

        delivery_by = resolved_delivery_date

    elif raw_intent.delivery_by:

        try:

            delivery_by = date.fromisoformat(
                raw_intent.delivery_by
            )

        except ValueError:

            delivery_by = None

    else:

        delivery_by = None

    # --------------------------------------------------
    # STEP 3: Application-controlled authorization
    # --------------------------------------------------

    max_retries = 2

    # --------------------------------------------------
    # STEP 4: Construct trusted IntentMandate
    # --------------------------------------------------

    mandate = IntentMandate(
        category=raw_intent.category,
        budget_max=raw_intent.budget_max,
        size=raw_intent.size,
        delivery_by=delivery_by,
        max_retries=max_retries,
    )

    return mandate