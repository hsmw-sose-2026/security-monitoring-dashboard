"""Database access for contact messages."""

from sqlite3 import IntegrityError

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

    # Bei einem DB Fehler wird eine RuntimeError mit einer Fehlermeldung geworfen, die im Endpoint abgefangen und als HTTP 500 Fehler zurueckgegeben wird.
    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        raise RuntimeError("Kontaktnachricht konnte nicht gespeichert werden.")

    # Objekt aktualisieren damit die vergebene ID verfuegbar ist
    session.refresh(message)

    return message