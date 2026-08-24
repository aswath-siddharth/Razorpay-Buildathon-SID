from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..agent.intent import IntentMandate
from ..agent.buyer import discover_products


router = APIRouter(
    prefix="/buyer",
    tags=["Buyer Agent"]
)


class BuyerRequest:
    pass