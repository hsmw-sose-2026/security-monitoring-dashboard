# Hier wird die FastAPI App erstellt und alles zusammengeführt.
# Also z.B. Router einbinden, Middleware registrieren und CORS setzen.

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

from uuid import uuid4

from app.database import create_db_and_tables, engine
from app.models import User
from app.auth_utils import hash_password
from app.api.router import register_routers
from app.middleware.security import security_middleware as security_logic

from app.services.security.ml.ml_detector import lade_modell



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

    try:
        lade_modell()
        print("ML-Modell geladen.")
    except FileNotFoundError as e:
        print(f"Warnung: ML-Modell nicht geladen: {e}")
    yield       # Das "yield" hier markiert den Punkt, an dem die Anwendung bereit ist, Anfragen zu verarbeiten. Alles vor "yield" wird beim Starten der Anwendung ausgeführt, und alles nach "yield" wird beim Stoppen der Anwendung ausgeführt. In diesem Fall haben wir nichts, was beim Stoppen der Anwendung ausgeführt werden muss, daher ist es leer.

app = FastAPI(
    title="Security Monitoring Dashboard API",
    description="API für das Security Monitoring Dashboard, um Sicherheitsereignisse zu verwalten und zu analysieren",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,     # CORS (Cross-Origin Resource Sharing) Middleware, die es ermöglicht, dass die Frontend-Anwendung (die wahrscheinlich auf einem anderen Port läuft) Anfragen an die API stellen kann. Hier erlauben wir Anfragen von "http://localhost:3000", was der Standardport für React-Entwicklungsserver ist.
    allow_origins=[
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    ],
    allow_credentials=True,     # Cookies etc. erlauben
    allow_methods=["*"],        # Alle HTTP-Methoden erlauben (GET, POST, PUT, DELETE etc.) 
    allow_headers=["*"]         # Alle Header erlauben, damit die Frontend-Anwendung die notwendigen Informationen in den Anfragen senden kann (z.B. Content-Type, Authorization etc.)
)

@app.middleware("http")
async def security_middleware(request: Request, call_next):
    request_id = str(uuid4())
    request.state.request_id = request_id

    print(f"[Request] {request_id} {request.method} {request.url.path}")

    response = await security_logic(request, call_next)
    response.headers["X-Request-ID"] = request_id

    return response

@app.get("/health")     # einfacher Endpoint, um zu überprüfen, ob der Server läuft. Gibt einfach ein JSON mit "status": "ok" zurück
def health_check():
    return {"status": "ok"} 

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "detail": "Invalid request",
            "error_code": "validation_error",
        },
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "error_code": f"http_{exc.status_code}",
        },
    )


register_routers(app)
