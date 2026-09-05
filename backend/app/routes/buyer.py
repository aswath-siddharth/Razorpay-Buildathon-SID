from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas import (
    BuyerRunRequest,
    BuyerRunResponse,
    AuditEventResponse,
)
from ..agent.orchestrator import run_buyer_orchestration
from ..agent.audit import get_audit_events_by_session, get_recent_audit_sessions
from ..agent.intent import parse_intent
from ..agent.buyer import discover_products


router = APIRouter(
    prefix="/buyer",
    tags=["Buyer Agent"]
)


@router.post("/run", response_model=BuyerRunResponse)
def run_buyer_agent(
    request: BuyerRunRequest,
    db: Session = Depends(get_db),
):
    """
    Execute full end-to-end Buyer Agent pipeline:
    Intent Parsing -> Discovery & Scoring -> Inventory Check & Failure Recovery ->
    PaymentMandate Generation -> Razorpay Order & Link -> Audit Trail.
    """
    result = run_buyer_orchestration(
        db=db,
        user_message=request.message,
        simulate_failure=request.simulate_failure,
        max_retries_override=request.max_retries,
    )
    return result


@router.post("/parse-intent")
def parse_user_intent(request: BuyerRunRequest):
    """
    Parse natural language shopping intent via Groq LLM (Llama 3.3 70B).
    """
    mandate = parse_intent(request.message)
    return mandate.model_dump(mode="json")


@router.post("/discover")
def discover_only(
    request: BuyerRunRequest,
    db: Session = Depends(get_db),
):
    """
    Lightweight endpoint for constraint discovery and scoring without placing orders.
    """
    mandate = parse_intent(request.message)
    result = discover_products(db=db, mandate=mandate)
    return {
        "request": request.message,
        "mandate": mandate.model_dump(mode="json"),
        "result": result,
    }


@router.get("/audit/{session_id}", response_model=list[AuditEventResponse])
def get_session_audit_trail(
    session_id: str,
    db: Session = Depends(get_db),
):
    """
    Retrieve full chronological audit trail for a specific buyer agent session.
    """
    events = get_audit_events_by_session(db=db, session_id=session_id)
    if not events:
        raise HTTPException(
            status_code=404,
            detail=f"No audit trail found for session {session_id}"
        )
    return events


@router.get("/audit")
def list_recent_sessions(
    limit: int = 20,
    db: Session = Depends(get_db),
):
    """
    List recent buyer agent sessions with event counts and status.
    """
    return get_recent_audit_sessions(db=db, limit=limit)