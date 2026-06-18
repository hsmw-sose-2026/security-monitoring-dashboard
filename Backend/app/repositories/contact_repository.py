"""Database access for contact messages."""

<<<<<<< HEAD
from sqlmodel import Session
=======
from sqlmodel import Session, select
from sqlalchemy.exc import SQLAlchemyError
>>>>>>> origin/integration-test

from app.models import ContactMessage
from app.schemas.contact import ContactCreate

<<<<<<< HEAD
def create_contact_message(session: Session, data: ContactCreate) -> ContactMessage:
    # Neues Datenbankobjekt aus den validierten Schema-Daten anlegen
=======
from datetime import datetime, timezone

def create_contact_message(session: Session, data: ContactCreate) -> ContactMessage:
>>>>>>> origin/integration-test
    message = ContactMessage(
        name=data.name,
        email=data.email,
        message=data.message,
    )

<<<<<<< HEAD
    # Datensatz in die Datenbank schreiben und persistieren
    session.add(message)
    session.commit()

    # Objekt aktualisieren damit die vergebene ID verfuegbar ist
    session.refresh(message)

    return message
=======
    try:
        session.add(message)
        session.commit()
        session.refresh(message)
    except SQLAlchemyError as exc:
        session.rollback()
        raise RuntimeError("Kontaktanfrage konnte nicht gespeichert werden") from exc

    return message

def count_contacts_today(session: Session) -> int:
    now = datetime.now(timezone.utc)
    start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
    statement = select(ContactMessage).where(ContactMessage.submitted_at >= start_of_day)
    return len(session.exec(statement).all())


def list_contact_messages(
    session: Session,
    limit: int = 20,
    offset: int = 0,
) -> list[ContactMessage]:
    statement = (
        select(ContactMessage)
        .order_by(ContactMessage.submitted_at.desc())
        .offset(offset)
        .limit(limit)
    )
    return session.exec(statement).all()
>>>>>>> origin/integration-test
