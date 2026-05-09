"""Planned split-out model for alerts."""

# TODO(Jonas): Alert-Model aus Backend/app/models.py hierher verschieben.
# Ziel: Alerts getrennt von rohen SecurityEvents modellieren.
# Fertig, wenn Dashboard- und Korrelationslogik dieses Modul verwenden.

from datetime import datetime, timezone
from sqlmodel import SQLModel, Field

class Alert(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    alert_type: str
    source_ip: str
    message: str
    severity: str = "low"