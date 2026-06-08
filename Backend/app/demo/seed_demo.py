"""Demo-Daten fuer Contact- und Upload-Funktionen seeden.

Das Skript schreibt direkt ueber Repositories in die Datenbank.
Es ist fuer Kevins Backend-Demo gedacht und erzeugt nur Daten,
wenn die jeweiligen Tabellen noch leer sind.
"""

from pathlib import Path

from sqlmodel import Session, select

from app.database import engine
from app.models import ContactMessage, UploadedFile
from app.repositories.contact_repository import create_contact_message
from app.repositories.upload_repository import save_upload_metadata
from app.schemas.contact import ContactCreate


DEMO_UPLOAD_DIR = Path("uploads")


def seed_contacts(session: Session) -> None:
    existing = session.exec(select(ContactMessage)).first()
    if existing:
        print("Contact-Demo-Daten existieren bereits.")
        return

    demo_contacts = [
        ContactCreate(
            name="Max Mustermann",
            email="max@example.com",
            message="Ich habe eine Frage zum Produktangebot.",
        ),
        ContactCreate(
            name="Erika Musterfrau",
            email="erika@example.com",
            message="Bitte senden Sie mir weitere Informationen zu.",
        ),
        ContactCreate(
            name="XSS Demo",
            email="xss@example.com",
            message='<script>alert("Kontakt-XSS")</script>',
        ),
    ]

    for contact in demo_contacts:
        create_contact_message(session=session, data=contact)

    print(f"{len(demo_contacts)} Contact-Demo-Daten angelegt.")


def write_demo_file(path: Path, content: bytes) -> int:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(content)
    return len(content)


def seed_uploads(session: Session) -> None:
    existing = session.exec(select(UploadedFile)).first()
    if existing:
        print("Upload-Demo-Daten existieren bereits.")
        return

    safe_pdf = DEMO_UPLOAD_DIR / "demo-report.pdf"
    safe_txt = DEMO_UPLOAD_DIR / "readme-demo.txt"
    rejected_exe = DEMO_UPLOAD_DIR / "quarantine" / "demo-attack.exe"

    pdf_size = write_demo_file(
        safe_pdf,
        b"%PDF-1.4\n% Demo PDF fuer Upload-Metadaten\n",
    )
    txt_size = write_demo_file(
        safe_txt,
        b"Demo-Textdatei fuer Upload-Metadaten.\n",
    )
    exe_size = write_demo_file(
        rejected_exe,
        b"MZ demo executable payload",
    )

    save_upload_metadata(
        session=session,
        original_filename="demo-report.pdf",
        stored_filename=safe_pdf.name,
        file_extension=".pdf",
        client_ip="127.0.0.1",
        status="uploaded",
        content_type="application/pdf",
        file_size=pdf_size,
    )

    save_upload_metadata(
        session=session,
        original_filename="readme-demo.txt",
        stored_filename=safe_txt.name,
        file_extension=".txt",
        client_ip="127.0.0.1",
        status="uploaded",
        content_type="text/plain",
        file_size=txt_size,
    )

    save_upload_metadata(
        session=session,
        original_filename="demo-attack.exe",
        stored_filename=rejected_exe.name,
        file_extension=".exe",
        client_ip="127.0.0.1",
        status="rejected",
        content_type="application/octet-stream",
        file_size=exe_size,
    )

    print("3 Upload-Demo-Daten angelegt.")


def main() -> None:
    with Session(engine) as session:
        seed_contacts(session)
        seed_uploads(session)


if __name__ == "__main__":
    main()