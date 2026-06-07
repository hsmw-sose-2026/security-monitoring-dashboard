# Kontakt Endpoint.
# Hier landen Name, E-Mail und Nachricht aus dem Kontaktformular.
# Fuer den Prototyp reicht es wenn das erstmal in der DB gespeichert wird.
# Die eigentliche Datenbankoperation kapselt das Repository.

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session

from app.database import get_session
from app.repositories.contact_repository import create_contact_message, list_contact_messages
from app.schemas.contact import ContactCreate, ContactResponse, ContactMessageResponse

router = APIRouter(prefix="/contact", tags=["contact"])


@router.post("", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
def send_contact_message(data: ContactCreate, session: Session = Depends(get_session)):
    # Nachricht ueber das Repository in der Datenbank ablegen
    try:
        saved = create_contact_message(session=session, data=data)
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    # ContactResponse aus dem gespeicherten Objekt zusammenbauen
    return ContactResponse(
        id=saved.id,
        name=saved.name,
        email=saved.email,
        status="Nachricht wurde gespeichert.",
        message=saved.message,
        submitted_at=saved.submitted_at,
    )


@router.get("", response_model=list[ContactMessageResponse])
def list_contacts(
    session: Session = Depends(get_session),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    return list_contact_messages(session, limit, offset)