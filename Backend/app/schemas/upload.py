"""Upload request and response schemas."""

from pydantic import BaseModel

# Response-Schema fuer die Upload-Antwort, um dem Frontend die Details zum hochgeladenen File strukturiert zu uebermitteln.
class UploadResponse(BaseModel):
    original_filename: str
    stored_filename: str
    file_extension: str
    status: str