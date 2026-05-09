"""Planned split-out model for security events."""

# TODO(Jonas): SecurityEvent-Model aus Backend/app/models.py hierher verschieben.
# Ziel: Security-Events als eigenes Datenbankmodell pflegen und spaeter gezielter erweitern.
# Fertig, wenn Event-Queries und Event-Erstellung dieses Modul verwenden.
<<<<<<< HEAD
=======

from datetime import datetime, timezone
from sqlmodel import SQLModel, Field

class SecurityEvent(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))   # timestamp speichert den Zeitpunkt des aktuellen Ereignisses
    event_type: str
    source_ip: str
    path: str
    detail: str = ""
    severity: str = "low"
>>>>>>> origin/integration-test
