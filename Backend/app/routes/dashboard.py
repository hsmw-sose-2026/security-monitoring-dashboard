# Dashboard Endpoints.
# Liefern dem Frontend die Daten zum Anzeigen: einzelne Events, Alerts,
# gruppierte Angriffe und ein paar allgemeine Zahlen.

from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from app.database import get_session
from app.models import SecurityEvent, Alert
from app.services.detection import group_events_into_attacks

# prefix sorgt dafuer dass alle Endpoints unter /dashboard/... erreichbar sind
router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/events")
def list_events(session: Session = Depends(get_session), limit: int = 100):
    # Neueste Events zuerst, standardmaessig die letzten 100
    statement = select(SecurityEvent).order_by(SecurityEvent.timestamp.desc()).limit(limit)
    events = session.exec(statement).all()
    return events


@router.get("/alerts")
def list_alerts(session: Session = Depends(get_session), limit: int = 100):
    # Alerts sind die "Schlussfolgerungen" aus mehreren Events (z.B. Brute Force)
    statement = select(Alert).order_by(Alert.timestamp.desc()).limit(limit)
    alerts = session.exec(statement).all()
    return alerts


@router.get("/attacks")
def list_attacks(session: Session = Depends(get_session)):
    # Events zu Angriffen gruppiert, das eigentliche "Herzstueck" fuers Dashboard
    return group_events_into_attacks(session)


@router.get("/stats")
def get_stats(session: Session = Depends(get_session)):
    # Einfache Kennzahlen fuer die Uebersichtsseite
    total_events = len(session.exec(select(SecurityEvent)).all())
    total_alerts = len(session.exec(select(Alert)).all())
    return {
        "total_events": total_events,
        "total_alerts": total_alerts,
    }
