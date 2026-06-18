"""Database access for uploaded file metadata."""

<<<<<<< HEAD
from sqlmodel import Session

from app.models import UploadedFile

=======
from sqlmodel import Session, select

from app.models import UploadedFile

from datetime import datetime, timezone

>>>>>>> origin/integration-test
def save_upload_metadata(
    session: Session,
    original_filename: str,
    stored_filename: str,
    file_extension: str,
    client_ip: str | None = None,
<<<<<<< HEAD
=======
    status: str = "uploaded",
    content_type: str | None = None,
    file_size: int | None = None,
>>>>>>> origin/integration-test
) -> UploadedFile:

    # Ein neues UploadedFile-Objekt wird erstellt
    upload_record = UploadedFile(
        original_filename=original_filename,
        stored_filename=stored_filename,
        file_extension=file_extension,
        client_ip=client_ip,
<<<<<<< HEAD
=======
        status=status,
        content_type=content_type,
        file_size=file_size,
>>>>>>> origin/integration-test
    )

    # das neue Objekt wird der Session hinzugefuegt und in die Datenbank geschrieben
    session.add(upload_record)
    session.commit()

    # refreshen damit die automatisch generierten Felder (z.B. id, uploaded_at) im Objekt verfuegbar sind
    session.refresh(upload_record)

<<<<<<< HEAD
    return upload_record
=======
    return upload_record


def count_uploads_today(session: Session) -> int:
    now = datetime.now(timezone.utc)
    start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
    statement = select(UploadedFile).where(UploadedFile.uploaded_at >= start_of_day)
    return len(session.exec(statement).all())


def list_uploads(
    session: Session,
    limit: int = 20,
    offset: int = 0,
) -> list[UploadedFile]:
    statement = (
        select(UploadedFile)
        .order_by(UploadedFile.uploaded_at.desc())
        .offset(offset)
        .limit(limit)
    )
    return session.exec(statement).all()
>>>>>>> origin/integration-test
