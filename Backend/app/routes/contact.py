# Kontakt Endpoint.
# Hier landen Name, E-Mail und Nachricht aus dem Kontaktformular.
# Fuer den Prototyp reicht es wenn das erstmal in der DB gespeichert wird.
# Die eigentliche Datenbankoperation kapselt das Repository.

from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from app.database import get_session
from app.repositories.contact_repository import create_contact_message
from app.schemas.contact import ContactCreate, ContactResponse

router = APIRouter(prefix="/contact", tags=["contact"])


@router.post("", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
def send_contact_message(data: ContactCreate, session: Session = Depends(get_session)):
    # Nachricht ueber das Repository in der Datenbank ablegen
    saved = create_contact_message(session=session, data=data)

    # ContactResponse aus dem gespeicherten Objekt zusammenbauen
    return ContactResponse(
        id=saved.id,
        name=saved.name,
        email=saved.email,
        status="Nachricht wurde gespeichert.",
    )
