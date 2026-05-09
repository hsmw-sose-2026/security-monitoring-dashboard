"""Database access for security events."""


from collections import Counter
from datetime import datetime, timezone, timedelta

from sqlmodel import Session, select

from app.models import SecurityEvent


def create_event(
    session: Session,
    *,
    event_type: str,
    source_ip: str,
    path: str,
    detail: str = "",
    severity: str = "low",
) -> SecurityEvent:
    event = SecurityEvent(
        event_type=event_type,
        source_ip=source_ip,
        path=path,
        detail=detail,
        severity=severity,
    )

    session.add(event)
    session.commit()
    session.refresh(event)
    return event

def list_recent_events(session: Session, limit: int = 100) -> list[SecurityEvent]:
    statement = select(SecurityEvent).order_by(SecurityEvent.timestamp.desc()).limit(limit) #die letzten 100 security events aus der datenbank selektieren
    return session.exec(statement).all() #sql select ausführen und die events returnen

def count_events_today(session: Session) -> int:
    now = datetime.now(timezone.utc) #jetzige zeit holen
    start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0) #zeit auf 0 uhr setzen, also anfang des tages
    statement = select(SecurityEvent).where(SecurityEvent.timestamp >= start_of_day)
    #sql statement bauen, jedes SecurityEvent selecten welches groeßeren Timestamp
    #als 0 Uhr hat
    return len(session.exec(statement).all()) #sql statement ausführen und returnen

def count_events_by_type(session: Session) -> dict[str, int]:
    events = session.exec(select(SecurityEvent)).all() #jedes SecurityEvent aus der Datenbank selektieren und sql request ausführen
    counter = Counter(event.event_type for event in events) #mithilfe von counter Events anhand von typen zählen und in dictionary speichern
    return dict(counter) #dictionary returnen

def count_events_per_hour(session: Session, hours: int = 24) -> dict[str, int]:
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(hours=hours)
    statement = select(SecurityEvent).where(SecurityEvent.timestamp >= cutoff)
    events = session.exec(statement).all()
    counts = {}

    for event in events:
        bucket = event.timestamp.replace(minute=0, second=0, microsecond=0)
        key = bucket.isoformat()
        counts[key] = counts.get(key, 0) + 1
    
    sorted_counts = dict(sorted(counts.items()))
    return sorted_counts


def average_events_per_hour(session: Session, hours: int = 24) -> float:
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(hours=hours)
    statement = select(SecurityEvent).where(SecurityEvent.timestamp >= cutoff)
    events = len(session.exec(statement).all())

    if hours <= 0:
        return 0.0
        
    average = events / hours
    return average