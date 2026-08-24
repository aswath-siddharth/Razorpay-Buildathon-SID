from datetime import date
from typing import Optional

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

    budget_max: Optional[float] = Field(
        default=None,
        description="Maximum amount the user is willing to spend"
    )

    size: Optional[str] = Field(
        default=None,
        description="Requested product size"
    )

    delivery_by: Optional[date] = Field(
        default=None,
        description="Latest acceptable delivery date"
    )

    max_retries: int = Field(
        default=2,
        ge=0,
        description="Maximum number of retries allowed"
    )