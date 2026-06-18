"""Contact form request and response schemas."""

<<<<<<< HEAD
from pydantic import BaseModel

# Request-Schema fuer die Kontaktanfrage, um die Daten aus dem Frontend zu validieren.
class ContactCreate(BaseModel):
    name: str
    email: str
    message: str
=======
from pydantic import BaseModel, Field

from datetime import datetime

# Request-Schema fuer die Kontaktanfrage, um die Daten aus dem Frontend zu validieren.
class ContactCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: str = Field(min_length=1, max_length=255)
    message: str = Field(min_length=1, max_length=2000)
>>>>>>> origin/integration-test

# Response-Schema fuer die Kontaktanfrage, um dem Frontend zu bestaetigen dass die Nachricht gespeichert wurde.
class ContactResponse(BaseModel):
    id: int
    name: str
    email: str
<<<<<<< HEAD
    status: str
=======
    status: str
    message: str
    submitted_at: datetime

# Response-Schema fuer die Liste der Kontaktanfragen, um dem Frontend zu bestaetigen dass die Nachricht gespeichert wurde.
class ContactMessageResponse(BaseModel):
    id: int
    name: str
    email: str
    message: str
    submitted_at: datetime
>>>>>>> origin/integration-test
