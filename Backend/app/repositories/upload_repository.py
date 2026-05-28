"""Database access for uploaded file metadata."""

from sqlmodel import Session

from app.models import UploadedFile

def save_upload_metadata(
    session: Session,
    original_filename: str,
    stored_filename: str,
    file_extension: str,
    client_ip: str | None = None,
    content_type: str | None = None,
    file_size: int | None = None,
) -> UploadedFile:

    # Ein neues UploadedFile-Objekt wird erstellt
    upload_record = UploadedFile(
        original_filename=original_filename,
        stored_filename=stored_filename,
        file_extension=file_extension,
        client_ip=client_ip,
        content_type=content_type,
        file_size=file_size,
    )

    # das neue Objekt wird der Session hinzugefuegt und in die Datenbank geschrieben
    session.add(upload_record)
    session.commit()

    # refreshen damit die automatisch generierten Felder (z.B. id, uploaded_at) im Objekt verfuegbar sind
    session.refresh(upload_record)

    return upload_record