# Hilfsfunktionen fuer das Hashen und Pruefen von Passwoertern.
# Passwoerter werden NIE im Klartext in der DB gespeichert, nur als bcrypt-Hash.

import bcrypt

def hash_password(plain_password: str) -> str:      # Erzeugt ein bcrypt-Hash aus einem Klartext-Passwort
    password_bytes = plain_password.encode('utf-8')  # bcrypt erwartet Bytes, daher müssen wir den String in Bytes umwandeln
    hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt()) # 2 Hashes vom gleichen Passwort werden unterschiedlich sein, da bcrypt einen zufälligen Salt verwendet. Das erhöht die Sicherheit, da es Angreifern erschwert, vorgehashte Passwörter zu verwenden.
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:      # Verifiziert ein Klartext-Passwort gegen einen bcrypt-Hash# Prueft ob Klartext-Passwort zum gespeicherten Hash passt
    password_bytes = plain_password.encode('utf-8')  # Klartext-Passwort in Bytes umwandeln
    hashed_bytes = hashed_password.encode('utf-8')  # Hash aus der DB ebenfalls in Bytes umwandeln
    return bcrypt.checkpw(password_bytes, hashed_bytes)