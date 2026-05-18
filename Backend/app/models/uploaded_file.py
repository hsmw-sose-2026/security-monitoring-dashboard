"""Planned database model for uploaded file metadata."""

from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel

class UploadedFile(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    original_filename: str
    stored_filename: str
    file_extension: str
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
    client_ip: Optional[str] = Field(default=None)