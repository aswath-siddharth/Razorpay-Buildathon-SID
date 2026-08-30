from datetime import datetime, timezone
from typing import Any
from sqlalchemy.orm import Session

from ..models import AuditEvent


def log_audit_event(
    db: Session,
    session_id: str,
    actor: str,
    action: str,
    status: str,
    reasoning: str,
    input_data: Any = None,
    output_data: Any = None,
    mandate_ref: str | None = None,
) -> AuditEvent:
    """
    Append-only audit event logger.
    Logs decisions, evaluations, retries, and mandate writes.
    Enforces the rule: log before executing critical money actions.
    """
    timestamp = datetime.now(timezone.utc).isoformat()

    event = AuditEvent(
        session_id=session_id,
        timestamp=timestamp,
        actor=actor,
        action=action,
        status=status,
        mandate_ref=mandate_ref,
        reasoning=reasoning,
        input_data=input_data,
        output_data=output_data,
    )

    db.add(event)
    db.commit()
    db.refresh(event)

    return event


def get_audit_events_by_session(
    db: Session,
    session_id: str,
) -> list[AuditEvent]:
    """
    Retrieve all audit events for a session in chronological order.
    """
    return (
        db.query(AuditEvent)
        .filter(AuditEvent.session_id == session_id)
        .order_by(AuditEvent.id.asc())
        .all()
    )


def get_recent_audit_sessions(
    db: Session,
    limit: int = 20,
) -> list[dict]:
    """
    Retrieve a list of recent sessions with event count and latest action.
    """
    events = (
        db.query(AuditEvent)
        .order_by(AuditEvent.id.desc())
        .limit(limit * 10)
        .all()
    )

    sessions_map: dict[str, dict] = {}
    for ev in events:
        if ev.session_id not in sessions_map:
            sessions_map[ev.session_id] = {
                "session_id": ev.session_id,
                "latest_timestamp": ev.timestamp,
                "latest_action": ev.action,
                "latest_status": ev.status,
                "event_count": 0,
            }
        sessions_map[ev.session_id]["event_count"] += 1

    return list(sessions_map.values())[:limit]
