"""Contact form request and response schemas."""

from pydantic import BaseModel

# Request-Schema fuer die Kontaktanfrage, um die Daten aus dem Frontend zu validieren.
class ContactCreate(BaseModel):
    name: str
    email: str
    message: str

# Response-Schema fuer die Kontaktanfrage, um dem Frontend zu bestaetigen dass die Nachricht gespeichert wurde.
class ContactResponse(BaseModel):
    id: int
    name: str
    email: str
    status: str