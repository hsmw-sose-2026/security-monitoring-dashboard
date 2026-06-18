# Dashboard Endpoints.
# Liefern dem Frontend die Daten zum Anzeigen: einzelne Events, Alerts,
# gruppierte Angriffe und ein paar allgemeine Zahlen.

import json

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select

from app.database import get_session

from app.models import SecurityEvent

from app.repositories.event_repository import list_recent_events
from app.repositories.alert_repository import list_recent_alerts
from app.services.dashboard_service import build_dashboard_stats
from app.services.detection import group_events_into_attacks
from app.services.security.incident_narrative import generate_narrative
from app.auth_utils import require_admin
from app.schemas.dashboard import StatsResponse, EventResponse, AlertResponse, AttackResponse, ForensicResponse

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


@router.get("/attacks/{source_ip}/report", response_model=str)
def get_attack_report(source_ip: str, session: Session = Depends(get_session)):
    clusters = group_events_into_attacks(session)

    # Ersten Treffer nehmen – Liste ist nach start_time desc sortiert, juengster zuerst
    cluster = next((c for c in clusters if c["source_ip"] == source_ip), None)

    if cluster is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Kein Angriffs-Cluster fuer IP {source_ip} gefunden.",
        )

    return generate_narrative(cluster)


@router.get("/stats", response_model=StatsResponse)
def get_stats(session: Session = Depends(get_session)) -> StatsResponse:
    # Einfache Kennzahlen fuer die Uebersichtsseite
    return build_dashboard_stats(session)

@router.get("/forensic", response_model=list[ForensicResponse])
def list_forensic_events(session: Session = Depends(get_session), limit: int = Query(50, ge=1, le=200)):
    events = session.exec(
        select(SecurityEvent)
        .where(SecurityEvent.event_type == "ml_detected_attack")
        .order_by(SecurityEvent.timestamp.desc())
        .limit(limit)
    ).all()
    results = []
    for event in events:
        try:
            report = json.loads(event.detail)
            report["event_id"] = event.id
            report["timestamp"] = event.timestamp
            report["source_ip"] = event.source_ip
            results.append(report)
        except json.JSONDecodeError:
            continue  # alte Events ohne Forensic-JSON überspringen
    return results