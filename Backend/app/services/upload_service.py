"""Upload validation and storage logic."""

import uuid
from pathlib import Path

from fastapi import UploadFile, HTTPException
from sqlmodel import Session

from app.repositories.upload_repository import save_upload_metadata
from app.schemas.upload import UploadResponse
from app.services.security.registry import detect_bad_upload
from app.services.security.event_logger import log_security_event

# Maximale Dateigroesse in Bytes
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

# Zielordner fuer hochgeladene Dateien
UPLOAD_DIR = Path("uploads")

# Zielordner fuer Dateien mit blockierten Extensions
QUARANTINE_DIR = Path("quarantine")


# Funktion die alle Schritte des Uploads durchfuehrt und ein UploadResponse-Objekt zurueckgibt
async def process_upload(file: UploadFile, session: Session, client_ip: str | None = None) -> UploadResponse:

    # file.filename gibt den urspruenglichen Dateinamen vom Nutzer zurueck
    # Falls kein Dateiname vorhanden ist, wird "unknown" verwendet
    original_filename = file.filename or "unknown"

    # Path-Traversal-Pruefung: Es wird geprueft, ob der Dateiname "..", "/" oder "\" enthaelt
    if any(char in original_filename for char in ("..", "/", "\\")):
        raise HTTPException(status_code=400, detail="Ungültiger Dateiname")

    # Path().suffix gibt die Dateiendung inklusive Punkt zurueck (z.B. ".pdf")
    file_extension = Path(original_filename).suffix.lower()

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

    content_type = file.content_type

    bad_upload_hit = detect_bad_upload(original_filename)

    if bad_upload_hit:
        log_security_event(
            session,
            event_type="bad_upload",
            source_ip=client_ip,
            path="/upload",
            detail=f"Blockierter Upload: {original_filename}",
            severity="medium",
        )

        QUARANTINE_DIR.mkdir(parents=True, exist_ok=True)
        destination = QUARANTINE_DIR / stored_filename

        # die Datei wird in Chunks gelesen und schreibend im Quarantaeneordner abgelegt, um die blockierte Datei zu speichern
        # Alternativ koennte die Datei gar nicht gespeichert werden und nur das Event geloggt werden
        total_size = 0
        with destination.open("wb") as output:
            while chunk := await file.read(1024 * 1024):  # 1 MB pro Chunk
                total_size += len(chunk)
                if total_size > MAX_FILE_SIZE:
                    destination.unlink(missing_ok=True)  # unvollstaendige Datei loeschen
                    raise HTTPException(status_code=413, detail="Datei zu gross")
                output.write(chunk)

        return UploadResponse(
            original_filename=original_filename,
            stored_filename=stored_filename,
            file_extension=file_extension,
            status="rejected",
            reason="Datei blockiert aufgrund von Sicherheitsrichtlinien",
            content_type=content_type,
            file_size=total_size,
        )

    # der Zielpfad wird aus dem Upload-Verzeichnis und dem gespeicherten Dateinamen zusammengesetzt
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    destination = UPLOAD_DIR / stored_filename

    # die Datei wird in Chunks gelesen und schreibend im Zielordner abgelegt
    total_size = 0
    with destination.open("wb") as output:
        while chunk := await file.read(1024 * 1024):  # 1 MB pro Chunk
            total_size += len(chunk)
            if total_size > MAX_FILE_SIZE:
                destination.unlink(missing_ok=True)  # unvollstaendige Datei loeschen
                raise HTTPException(status_code=413, detail="Datei zu gross")
            output.write(chunk)

    # die funktion save_upload_metadata aus dem repository speichert die Metadaten des Uploads in der Datenbank und gibt das gespeicherte UploadedFile Model zurueck
    save_upload_metadata(
        session=session,
        original_filename=original_filename,
        stored_filename=stored_filename,
        file_extension=file_extension,
        client_ip=client_ip,
        content_type=content_type,
        file_size=destination.stat().st_size,
    )

    # es wird ein UploadResponse Objekt aus dem schema mit den relevanten Informationen zum Upload erstellt und zurueckgegeben
    return UploadResponse(
        original_filename=original_filename,
        stored_filename=stored_filename,
        file_extension=file_extension,
        status="uploaded",
        content_type=content_type,
        file_size=destination.stat().st_size,
    )
