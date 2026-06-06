# Hilfsfunktionen fuer das Hashen und Pruefen von Passwoertern.
# Passwoerter werden NIE im Klartext in der DB gespeichert, nur als bcrypt-Hash.

import bcrypt
import jwt
from datetime import datetime, timedelta, timezone

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