"""Database access for alerts."""

from sqlmodel import Session, select

from datetime import datetime, timezone

from app.models import Alert

def create_alert(
    session: Session,
    *,
    alert_type: str,
    source_ip: str,
    message: str,
    severity: str = "low",
) -> Alert:
    alert = Alert(
        alert_type=alert_type,
        source_ip=source_ip,
        message=message,
        severity=severity,
    )

    session.add(alert)
    session.commit()
    session.refresh(alert)
    return alert


def list_recent_alerts(session: Session, limit: int = 100) -> list[Alert]:
    statement = select(Alert).order_by(Alert.timestamp.desc()).limit(limit)
    return session.exec(statement).all()


def count_critical_alerts(session: Session) -> int:
    statement = select(Alert).where(Alert.severity == "critical")
    return len(session.exec(statement).all())


def count_total_alerts(session: Session) -> int:
    return len(session.exec(select(Alert)).all())


def count_alerts_today(session: Session) -> int:
    now = datetime.now(timezone.utc) #jetzige zeit holen
    start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0) #zeit auf 0 uhr setzen, also anfang des tages
    statement = select(Alert).where(Alert.timestamp >= start_of_day)
    #sql statement bauen, jeden Alert selecten welches groeßeren Timestamp
    #als 0 Uhr hat
    return len(session.exec(statement).all()) #sql statement ausführen und returnen