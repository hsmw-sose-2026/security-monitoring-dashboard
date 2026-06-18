"""Create SecurityEvent rows from detector findings."""

from sqlmodel import Session

from app.repositories.event_repository import create_event
from app.services.security.correlation import correlate

def log_security_event(
    session: Session,
    event_type: str,
    source_ip: str,
    path: str,
    detail: str = "",
    severity: str = "low",
) -> dict:

    event = create_event(
        session,
        event_type=event_type,
        source_ip=source_ip,
        path=path,
        detail=detail,
        severity=severity,
    )
    alerts = correlate(session, source_ip)
    return {"event": event, "alerts": alerts}