"""Create SecurityEvent rows from detector findings."""

# TODO(Tim/Jonas): SecurityEvent-Erstellung an einer Stelle buendeln.
# Ziel: Detektoren sollen nur melden, was gefunden wurde. Diese Datei speichert daraus
# SecurityEvent-Eintraege in der Datenbank und startet danach die Alert-Korrelation.
# Fertig, wenn Middleware, Auth und Upload nicht mehr jeweils eigene Event-Speicherlogik brauchen.

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

# (Tim) auth und middleware nutzen den logger jetzt schon, wir müssen aber noch upload und weitere detektoren umstellen auf diesen logger