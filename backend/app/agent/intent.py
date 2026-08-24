import os
from datetime import date

from openai import OpenAI
from pydantic import BaseModel, Field


class IntentMandate(BaseModel):
    """
    Structured representation of what the user authorized
    the buyer agent to search for.
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


def parse_intent(user_message: str) -> IntentMandate:
    """
    Convert natural-language shopping intent into
    a structured IntentMandate.
    """

    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        raise RuntimeError(
            "OPENAI_API_KEY is not configured"
        )

    client = OpenAI(api_key=api_key)

    today = date.today().isoformat()

    response = client.responses.parse(
        model="gpt-4o-mini",
        input=[
            {
                "role": "system",
                "content": (
                    "You are the intent parser for an AI buyer. "
                    "Extract only constraints explicitly requested "
                    "or clearly implied by the user. "
                    f"Today's date is {today}. "
                    "Convert relative delivery dates such as "
                    "'Friday' into an absolute date. "
                    "Use category names compatible with a product "
                    "catalog, such as 'running_shoes'. "
                    "Do not invent a budget, size, brand, or deadline."
                ),
            },
            {
                "role": "user",
                "content": user_message,
            },
        ],
        text_format=IntentMandate,
    )

    mandate = response.output_parsed

    if mandate is None:
        raise ValueError(
            "Could not parse shopping intent"
        )

    return mandate