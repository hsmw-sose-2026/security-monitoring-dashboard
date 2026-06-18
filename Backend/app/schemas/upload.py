"""Upload request and response schemas."""

from pydantic import BaseModel

<<<<<<< HEAD
=======
from datetime import datetime

>>>>>>> origin/integration-test
# Response-Schema fuer die Upload-Antwort, um dem Frontend die Details zum hochgeladenen File strukturiert zu uebermitteln.
class UploadResponse(BaseModel):
    original_filename: str
    stored_filename: str
    file_extension: str
<<<<<<< HEAD
    status: str
=======
    status: str
    content_type: str | None = None
    file_size: int | None = None
    reason: str | None = None


class UploadMetadataResponse(BaseModel):
    id: int
    original_filename: str
    stored_filename: str
    file_extension: str
    uploaded_at: datetime
    client_ip: str | None = None
    status: str
    content_type: str | None = None
    file_size: int | None = None
>>>>>>> origin/integration-test
