import os
from datetime import date

from dotenv import load_dotenv
from groq import Groq
from pydantic import BaseModel, Field

load_dotenv()


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
    a structured IntentMandate using Groq.
    """

    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        raise RuntimeError(
            "GROQ_API_KEY is not configured"
        )

    client = Groq(api_key=api_key)

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
                    "Convert relative delivery dates into "
                    "absolute YYYY-MM-DD dates. "
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

    return IntentMandate.model_validate_json(content)