"""Upload validation and storage logic."""

import uuid
from pathlib import Path

from fastapi import UploadFile, HTTPException
from sqlmodel import Session

from app.repositories.upload_repository import save_upload_metadata
from app.schemas.upload import UploadResponse

from app.services.security.registry import detect_bad_upload
from app.services.security.event_logger import log_security_event

MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10 MB

# Zielordner fuer hochgeladene Dateien
UPLOAD_DIR = Path("uploads")

# Funktion die alle Schritte des Uploads durchfuehrt und ein UploadResponse-Objekt zurueckgibt
async def process_upload(file: UploadFile, session: Session, client_ip: str | None = None) -> UploadResponse:

    # file.filename gibt den urspruenglichen Dateinamen vom Nutzer zurueck
    # Falls kein Dateiname vorhanden ist, wird "unknown" verwendet
    original_filename = file.filename or "unknown"

    if ".." in original_filename or "/" in original_filename or "\\" in original_filename:
        raise HTTPException(status_code=400, detail="Ungültiger Dateiname")

    # Path().suffix gibt die Dateiendung inklusive Punkt zurueck (z.B. ".pdf")
    file_extension = Path(original_filename).suffix.lower()

    bad_upload = detect_bad_upload(original_filename)

    status = "uploaded"
    reason = None
    target_dir = UPLOAD_DIR

    if bad_upload:
        status = "rejected"
        reason = bad_upload["reason"]
        target_dir = UPLOAD_DIR / "quarantine"

    # file.content_type gibt den Content-Type der Datei zurueck
    content_type = file.content_type or None
    # file.size gibt die Groesse der Datei in Bytes zurueck
    file_size = 0

    # Dateiname wird normalisiert
    # Alle nicht-alphanumerischen Zeichen (außer ".", "-", "_") werden durch "_" ersetzt
    safe_original = "".join(
        c if c.isalnum() or c in (".", "-", "_") else "_"
        for c in original_filename
    )

    # uuid4() generiert eine zufaellige UUID und hex gibt den hexadezimalen String zurueck
    unique_prefix = uuid.uuid4().hex[:8]
    # der gespeicherte Dateiname setzt sich zusammen aus dem eindeutigen Prefix und dem gesicherten Originalnamen
    stored_filename = f"{unique_prefix}-{safe_original}"

    # der Zielpfad wird aus dem Upload-Verzeichnis und dem gespeicherten Dateinamen zusammengesetzt
    target_dir.mkdir(parents=True, exist_ok=True)
    destination = target_dir / stored_filename

    # die Datei wird in Chunks gelesen und schreibend im Zielordner abgelegt
    with destination.open("wb") as output:
        while chunk := await file.read(1024 * 1024):  # 1 MB pro Chunk
            file_size += len(chunk)

            if file_size > MAX_UPLOAD_BYTES:
                raise HTTPException(status_code=413, detail="Datei zu groß")

            output.write(chunk)

    if bad_upload:
        log_security_event(
            session=session,
            event_type=bad_upload["event_type"],
            source_ip=client_ip or "unknown",
            path="/upload",
            detail=f"{bad_upload['detail']} ({original_filename})",
            severity=bad_upload["severity"],
        )

    # die funktion save_upload_metadata aus dem repository speichert die Metadaten des Uploads in der Datenbank und gibt das gespeicherte UploadedFile Model zurueck
    save_upload_metadata(
        session=session,
        original_filename=original_filename,
        stored_filename=stored_filename,
        file_extension=file_extension,
        client_ip=client_ip,
        status=status,
        content_type=content_type,
        file_size=file_size,
    )

    # es wird ein UploadResponse Objekt aus dem schema mit den relevanten Informationen zum Upload erstellt und zurueckgegeben
    return UploadResponse(
        original_filename=original_filename,
        stored_filename=stored_filename,
        file_extension=file_extension,
        status=status,
        reason=reason,
        content_type=content_type,
        file_size=file_size,
    )