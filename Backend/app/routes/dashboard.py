# Dashboard Endpoints.
# Liefern dem Frontend die Daten zum Anzeigen: einzelne Events, Alerts,
# gruppierte Angriffe und ein paar allgemeine Zahlen.

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.database import get_session

from app.repositories.event_repository import list_recent_events
from app.repositories.alert_repository import list_recent_alerts
from app.services.dashboard_service import build_dashboard_stats
from app.services.detection import group_events_into_attacks
from app.auth_utils import require_admin
from app.schemas.dashboard import StatsResponse, EventResponse, AlertResponse, AttackResponse

# Alle Endpoints in diesem Router sind durch require_admin geschuetzt.
# Wer einen oeffentlichen Endpoint braucht, muss einen separaten Router anlegen.
router = APIRouter(
    prefix="/dashboard",
    tags=["dashboard"],
    dependencies=[Depends(require_admin)],  # Nur Admins duerfen aufs Dashboard
)

@router.get("/events", response_model=list[EventResponse])
def list_events(
    session: Session = Depends(get_session),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
):
    # Neueste Events zuerst, standardmaessig die letzten 100
    return list_recent_events(session, limit, offset)


@router.get("/alerts", response_model=list[AlertResponse])
def list_alerts(
    session: Session = Depends(get_session),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
):
    # Alerts sind die "Schlussfolgerungen" aus mehreren Events (z.B. Brute Force)
    return list_recent_alerts(session, limit, offset)


@router.get("/attacks", response_model=list[AttackResponse])
def list_attacks(session: Session = Depends(get_session)):
    # Events zu Angriffen gruppiert, das eigentliche "Herzstueck" fuers Dashboard
    return group_events_into_attacks(session)


@router.get("/stats", response_model=StatsResponse)
def get_stats(session: Session = Depends(get_session)) -> StatsResponse:
    # Einfache Kennzahlen fuer die Uebersichtsseite
    return build_dashboard_stats(session)
