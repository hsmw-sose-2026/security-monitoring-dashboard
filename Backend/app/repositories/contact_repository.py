"""Database access for contact messages."""

from sqlmodel import Session

from app.models import ContactMessage
from app.schemas.contact import ContactCreate

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