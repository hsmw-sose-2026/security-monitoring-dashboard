"""Upload validation and storage logic."""

import uuid
from pathlib import Path

from fastapi import UploadFile
from sqlmodel import Session

from app.repositories.upload_repository import save_upload_metadata
from app.schemas.upload import UploadResponse

# Zielordner fuer hochgeladene Dateien
UPLOAD_DIR = Path("uploads")

# Funktion die alle Schritte des Uploads durchfuehrt und ein UploadResponse-Objekt zurueckgibt
async def process_upload(file: UploadFile, session: Session, client_ip: str | None = None) -> UploadResponse:

    # file.filename gibt den urspruenglichen Dateinamen vom Nutzer zurueck
    # Falls kein Dateiname vorhanden ist, wird "unknown" verwendet
    original_filename = file.filename or "unknown"
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

    # der Zielpfad wird aus dem Upload-Verzeichnis und dem gespeicherten Dateinamen zusammengesetzt
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    destination = UPLOAD_DIR / stored_filename

    # die Datei wird in Chunks gelesen und schreibend im Zielordner abgelegt
    with destination.open("wb") as output:
        while chunk := await file.read(1024 * 1024):  # 1 MB pro Chunk
            output.write(chunk)

    # die funktion save_upload_metadata aus dem repository speichert die Metadaten des Uploads in der Datenbank und gibt das gespeicherte UploadedFile Model zurueck
    save_upload_metadata(
        session=session,
        original_filename=original_filename,
        stored_filename=stored_filename,
        file_extension=file_extension,
        client_ip=client_ip,
    )

    # es wird ein UploadResponse Objekt aus dem schema mit den relevanten Informationen zum Upload erstellt und zurueckgegeben
    return UploadResponse(
        original_filename=original_filename,
        stored_filename=stored_filename,
        file_extension=file_extension,
        status="uploaded",
    )