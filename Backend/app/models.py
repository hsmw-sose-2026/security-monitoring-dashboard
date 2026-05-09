# Datenbank-Modelle mit SQLModel.
# Hier kommen erstmal die Tabellen fuer User, SecurityEvent und Alert rein.
# Falls wir spaeter modularer werden, koennen hier auch allgemeinere Event-Modelle dazu kommen.


from datetime import datetime, timezone         # Fuer das timestamp-Feld
from sqlmodel import SQLModel, Field    # SQLModel ist die Basis-Klasse für unsere Datenbank-Modelle, Field wird verwendet, um die Felder zu definieren und z.B. Primärschlüssel oder Standardwerte festzulegen.

class User(SQLModel, table=True):       # erbt von SQLModel und table=True bedeutet, dass es eine Tabelle in der Datenbank repräsentiert
    id: int | None = Field(default=None, primary_key=True)  # id ist der Primärschlüssel, wird automatisch generiert, daher default=None
    username: str = Field(unique=True, index=True)  # username ist ein String, muss einzigartig sein (unique=True) und wird indexiert (index=True) für schnellere Abfragen
    hashed_password: str    # Hier speichern wir das gehashte Passwort des Benutzers
    role: str = "user"      # role gibt die Rolle des Benutzers an, z.B. "admin" oder "user". Standard ist "user".

class SecurityEvent(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))   # timestamp speichert den Zeitpunkt des aktuellen Ereignisses
    event_type: str
    source_ip: str
    path: str
    detail: str = ""
    severity: str = "low"

class Alert(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    alert_type: str
    source_ip: str
    message: str
    severity: str = "low"




