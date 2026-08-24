from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import get_db
from ..agent.intent import parse_intent
from ..agent.buyer import discover_products


router = APIRouter(
    prefix="/buyer",
    tags=["Buyer Agent"]
)


class BuyerRequest(BaseModel):
    message: str


@router.post("/run")
def run_buyer_agent(
    request: BuyerRequest,
    db: Session = Depends(get_db),
):
    # --------------------------------------------------
    # STEP 1: Convert natural language into a mandate
    # --------------------------------------------------

    mandate = parse_intent(
        request.message
    )

    # --------------------------------------------------
    # STEP 2: Run deterministic buyer engine
    # --------------------------------------------------

    result = discover_products(
        db=db,
        mandate=mandate,
    )

    # --------------------------------------------------
    # STEP 3: Return complete audit-friendly response
    # --------------------------------------------------

    return {
        "request": request.message,
        "mandate": mandate.model_dump(mode="json"),
        "result": result,
    }