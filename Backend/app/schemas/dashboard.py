"""Dashboard API response schemas."""

from pydantic import BaseModel

from datetime import datetime

# StatsResponse wird von /dashboard/stats benutzt, feldnamen sollten wir auch im frontend sauber halten

class StatsResponse(BaseModel):
    events_per_hour: dict[str, int]
    average_events: float
    events_today: int
    events_by_type: dict[str, int]
    critical_alerts: int
    alerts_today: int
    total_alerts: int
    contact_messages_today: int
    uploads_today: int

class EventResponse(BaseModel):
    id: int
    timestamp: datetime
    event_type: str
    source_ip: str
    path: str
    detail: str
    severity: str

class AttackResponse(BaseModel):
    source_ip: str
    start_time: datetime
    end_time: datetime
    event_count: int
    event_types: list[str]
    severity: str
    classification: str
    risk_score: int
    events: list[EventResponse]

class AlertResponse(BaseModel):
    id: int
    timestamp: datetime
    alert_type: str
    source_ip: str
    message: str
    severity: str
