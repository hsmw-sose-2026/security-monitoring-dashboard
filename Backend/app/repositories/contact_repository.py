"""Database access for contact messages."""

from sqlmodel import Session, select

from app.models import ContactMessage
from app.schemas.contact import ContactCreate

from datetime import datetime, timezone

def create_contact_message(session: Session, data: ContactCreate) -> ContactMessage:
    # Neues Datenbankobjekt aus den validierten Schema-Daten anlegen
    message = ContactMessage(
        name=data.name,
        email=data.email,
        message=data.message,
    )

    # Datensatz in die Datenbank schreiben und persistieren
    session.add(message)
    session.commit()

    # Objekt aktualisieren damit die vergebene ID verfuegbar ist
    session.refresh(message)

    return message


def count_contacts_today(session: Session) -> int:
    now = datetime.now(timezone.utc)
    start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
    statement = select(ContactMessage).where(ContactMessage.submitted_at >= start_of_day)
    return len(session.exec(statement).all())