# Hier wird die FastAPI App erstellt und alles zusammengeführt.
# Also z.B. Router einbinden, Middleware registrieren und CORS setzen.
# Sinnvoll waere auch ein kleiner /health Endpoint damit man direkt sieht ob der Server laeuft.

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

from app.database import create_db_and_tables, engine
from app.models import User
from app.auth_utils import hash_password
from app.routes import auth as auth_routes

def seed_text_user():
    with Session(engine) as session:
        existing = session.exec(select(User)).first()   # select(User) erstellt eine SQL-Abfrage, um alle Benutzer in der Datenbank zu holen. Mit .first() wird nur der erste Benutzer zurückgegeben, oder None, wenn es keine Benutzer gibt. Das ist eine einfache Möglichkeit zu überprüfen, ob bereits Benutzer in der Datenbank existieren, bevor wir Test-User anlegen.
        if existing:
            return  # Funktion verlassen, wenn bereits Benutzer existieren, um doppelte Test-User zu vermeiden
        
        test_users = [
            User(username="admin", hashed_password=hash_password("admin123"), role="admin"),    # Passwörter im Code sind natürlich nur für Testzwecke und sollten in einer echten Anwendung niemals so hartkodiert werden.
            User(username="user1", hashed_password=hash_password("user123"), role="user")]
        session.add_all(test_users)
        session.commit()
        print("Test-User angelegt: admin / user 1")

@asynccontextmanager
async def lifespan(app: FastAPI):       # FastAPI unterstützt die Definition von Lebenszyklusereignissen, die beim Starten und Stoppen der Anwendung ausgeführt werden. Hier verwenden wir einen asynchronen Kontextmanager, um sicherzustellen, dass die Datenbanktabellen erstellt werden, bevor die Anwendung Anfragen verarbeitet.
    create_db_and_tables()  # Beim Starten der Anwendung werden die Tabellen in der Datenbank angelegt, falls sie noch nicht existieren. 
    seed_text_user()       # Außerdem legen wir hier Test-User an
    yield       # Das "yield" hier markiert den Punkt, an dem die Anwendung bereit ist, Anfragen zu verarbeiten. Alles vor "yield" wird beim Starten der Anwendung ausgeführt, und alles nach "yield" wird beim Stoppen der Anwendung ausgeführt. In diesem Fall haben wir nichts, was beim Stoppen der Anwendung ausgeführt werden muss, daher ist es leer.

app = FastAPI(
    title="Security Monitoring Dashboard API",
    description="API für das Security Monitoring Dashboard, um Sicherheitsereignisse zu verwalten und zu analysieren",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,     # CORS (Cross-Origin Resource Sharing) Middleware, die es ermöglicht, dass die Frontend-Anwendung (die wahrscheinlich auf einem anderen Port läuft) Anfragen an die API stellen kann. Hier erlauben wir Anfragen von "http://localhost:3000", was der Standardport für React-Entwicklungsserver ist.
    allow_origins=["http://localhost:3000"],    # Port für Frontend erlauben
    allow_credentials=True,     # Cookies etc. erlauben
    allow_methods=["*"],        # Alle HTTP-Methoden erlauben (GET, POST, PUT, DELETE etc.) 
    allow_headers=["*"]         # Alle Header erlauben, damit die Frontend-Anwendung die notwendigen Informationen in den Anfragen senden kann (z.B. Content-Type, Authorization etc.)
)

@app.get("/health")     # einfacher Endpoint, um zu überprüfen, ob der Server läuft. Gibt einfach ein JSON mit "status": "ok" zurück
def health_check():
    return {"status": "ok"} 


app.include_router(auth_routes.router)    # Hier binden wir den Authentifizierungs-Router ein, damit die Endpunkte aus auth.py verfügbar sind. Das "router" ist das Objekt, das wir in auth.py mit APIRouter erstellt haben. Alle Endpunkte, die in diesem Router definiert sind, werden jetzt unter dem Präfix "/auth" verfügbar sein (z.B. "/auth/login").