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

class EventResponse(BaseModel):
    id: int
    timestamp: datetime
    event_type: str
    source_ip: str
    path: str
    detail: str
    severity: str

class AlertResponse(BaseModel):
    id: int
    timestamp: datetime
    alert_type: str
    source_ip: str
    message: str
    severity: str