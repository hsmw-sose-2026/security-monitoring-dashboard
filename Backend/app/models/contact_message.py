"""Planned database model for contact form submissions."""

from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel

class ContactMessage(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str
    message: str
    submitted_at: datetime = Field(default_factory=datetime.utcnow)