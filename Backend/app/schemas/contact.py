"""Contact form request and response schemas."""

from pydantic import BaseModel, EmailStr, Field

# Request-Schema fuer die Kontaktanfrage, um die Daten aus dem Frontend zu validieren.
class ContactCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    message: str = Field(min_length=1, max_length=1000)

# Response-Schema fuer die Kontaktanfrage, um dem Frontend zu bestaetigen dass die Nachricht gespeichert wurde.
class ContactResponse(BaseModel):
    id: int
    name: str
    email: str
    status: str