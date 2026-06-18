# Hilfsfunktionen fuer das Hashen und Pruefen von Passwoertern.
# Passwoerter werden NIE im Klartext in der DB gespeichert, nur als bcrypt-Hash.

import bcrypt
import jwt
from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# JWT-Konfiguration
# WICHTIG: SECRET_KEY ist hartcodiert nur fuer den Prototyp.
# In Produktion gehoert das in eine .env-Datei, nicht ins Repo!
SECRET_KEY = "dev-secret-change-me-in-production-please-32chars-min"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

def hash_password(plain_password: str) -> str:      # Erzeugt ein bcrypt-Hash aus einem Klartext-Passwort
    password_bytes = plain_password.encode('utf-8')  # bcrypt erwartet Bytes, daher müssen wir den String in Bytes umwandeln
    hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt()) # 2 Hashes vom gleichen Passwort werden unterschiedlich sein, da bcrypt einen zufälligen Salt verwendet. Das erhöht die Sicherheit, da es Angreifern erschwert, vorgehashte Passwörter zu verwenden.
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:      # Verifiziert ein Klartext-Passwort gegen einen bcrypt-Hash# Prueft ob Klartext-Passwort zum gespeicherten Hash passt
    password_bytes = plain_password.encode('utf-8')  # Klartext-Passwort in Bytes umwandeln
    hashed_bytes = hashed_password.encode('utf-8')  # Hash aus der DB ebenfalls in Bytes umwandeln
    return bcrypt.checkpw(password_bytes, hashed_bytes)

def create_access_token(username: str, role: str) -> str:
    """Erzeugt ein signiertes JWT fuer den angegebenen User.
    Token enthaelt Username, Rolle und Ablaufzeit.
    Gueltigkeit: ACCESS_TOKEN_EXPIRE_MINUTES Minuten ab jetzt."""
    
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    payload = {
        "sub": username,        # "subject" - wer ist das
        "role": role,           # zusaetzlich Rolle fuer einfaches Zugriffsmanagement
        "exp": expire,          # "expiration" - wann laeuft der Token ab
    }
    
    encoded_jwt = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# HTTPBearer extrahiert den Authorization-Header automatisch und parst
# "Bearer <token>" für uns. Wenn der Header fehlt, gibt FastAPI bei
# auto_error=True direkt 403 zurueck - daher auto_error=False, damit
# wir selbst sauber 401 werfen koennen.
bearer_scheme = HTTPBearer(auto_error=False)

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    """Dependency zum Pruefen von JWT-Tokens.
    Wird auf Routen angewendet, die nur fuer eingeloggte User zugaenglich sein sollen.
    Gibt das Token-Payload zurueck (z.B. {'sub': 'admin', 'role': 'admin', 'exp': ...})
    Bei Fehler: HTTPException 401."""
    
    # Kein Header oder falsches Schema
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kein Authorization-Header",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    
    # Token dekodieren und Signatur pruefen
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token abgelaufen",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Ungueltiger Token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return payload

def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    """Dependency wie get_current_user, prueft zusaetzlich Admin-Rolle.
    Wird auf Routen angewendet, die nur Admins zugaenglich sein sollen.
    Bei fehlender Admin-Rolle: HTTPException 403."""
    
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin-Rechte erforderlich",
        )
    return current_user