# Login Endpoint.
# POST Endpoint fuer Benutzername und Passwort.
# Bei Erfolg geht es Richtung Dashboard, bei Fehler kommt einfach eine Fehlermeldung zurueck.

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlmodel import Session, select

from app.database import get_session
from app.models import User
from app.services.security.event_logger import log_security_event
from app.auth_utils import verify_password, create_access_token


router = APIRouter(prefix="/auth", tags=["auth"])   # APIRouter organisiert die Authentifizierungs-bezogenen Endpunkte.

class LoginRequest (BaseModel):     # Pydantic-Modell zur Validierung der Login-Anfrage. Es definiert die erwarteten Felder (username und password) und deren Typen. FastAPI verwendet dieses Modell automatisch, um die eingehenden JSON-Daten zu validieren und in ein Python-Objekt umzuwandeln.
    username: str
    password: str

def log_failed_login(session: Session, source_ip: str, path: str, username: str):
    log_security_event(session=session, event_type="failed_login", source_ip=source_ip, path=path, detail=f"Fehlgeschlagener Login fuer Benutzer '{username}'", severity="medium")


@router.post("/login")
def login(data: LoginRequest, request: Request, session: Session = Depends(get_session)):     # POST-Endpoint für den Login. Er erwartet ein JSON mit "username" und "password", das automatisch in ein LoginRequest-Objekt umgewandelt wird. Außerdem erhält er eine Datenbank-Session, die von der get_session-Funktion bereitgestellt wird (durch Depends(get_session)). Request-Objekt um IP des Clients zu holen.
  
    source_ip = request.client.host if request.client else "unknown"
    path = request.url.path
  
    statement = select(User).where(User.username == data.username)       # Mit select(User) erstellen wir eine SQL-Abfrage, um alle Benutzer in der Datenbank zu holen. Mit .where(User.username == data.username) fügen wir eine Bedingung hinzu, um nur den Benutzer mit dem angegebenen Benutzernamen zu finden. Das Ergebnis dieser Abfrage ist ein Statement-Objekt, das wir später mit session.exec() ausführen können, um den Benutzer zu erhalten.
    user = session.exec(statement).first()      # Mit session.exec(statement) führen wir die SQL-Abfrage aus und erhalten ein Ergebnis-Objekt. Mit .first() holen wir den ersten Eintrag aus dem Ergebnis, was entweder der Benutzer mit dem angegebenen Benutzernamen oder None ist, wenn kein solcher Benutzer existiert.

    if not user or not verify_password(data.password, user.hashed_password):        # Hier überprüfen wir, ob der Benutzer existiert (not user) und ob das eingegebene Passwort mit dem in der Datenbank gespeicherten Hash übereinstimmt (not verify_password(...)). Wenn einer dieser beiden Bedingungen wahr ist, bedeutet das, dass entweder der Benutzername falsch ist oder das Passwort nicht stimmt, und wir geben eine HTTP 401 Unauthorized Fehlermeldung zurück.
        log_failed_login(session, source_ip, path, data.username)   # Schreibt Event in die Datenbank
        raise HTTPException(status_code=401, detail="Ungültiger Benutzername oder Passwort")
    
    # Bei erfolgreichem Login: Token generieren und mitschicken
    access_token = create_access_token(username=user.username, role=user.role)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": user.username,
        "role": user.role,
    }
