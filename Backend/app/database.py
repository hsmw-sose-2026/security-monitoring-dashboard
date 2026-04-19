# SQLite Verbindung und Session-Handling.
# Hier wird die DB-Engine gebaut und beim Start koennen die Tabellen angelegt werden.

from sqlmodel import SQLModel, Session, create_engine

DATABASE_URL = "sqlite:///./database.db"    # Adresse der Datenbank (sqlite = SQLite, /./database.db = Pfad zur Datenbankdatei)

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},  # SQLite erlaubt standardmäßig nicht, dass mehrere Threads gleichzeitig auf die Datenbank zugreifen. Mit check_same_thread=False erlauben wir das, was für die meisten Webanwendungen notwendig ist.
    echo=False,     # SQLModel muss nicht jedes SQL-Statement in der Konsole ausgeben
)

def create_db_and_tables():     # legt alle Tabellen in der Datenbank an, die in module.py defniert sind
    from app import models      # noqa: F401  # Importieren der Modelle, damit SQLModel sie kennt und die entsprechenden Tabellen erstellen kann. Das "noqa: F401" sagt dem Linter, dass dieser Import absichtlich nicht verwendet wird, um Fehler zu vermeiden.
    SQLModel.metadata.create_all(engine)

def get_session():      # Funktion die von FastAPI-Routen aufgerufen wird wenn sie mit der Datenbank arbeiten wollen
    with Session(engine) as session:    # Session ist eine Kontextmanager-Klasse, die eine Verbindung zur Datenbank herstellt und sicherstellt, dass sie ordnungsgemäß geschlossen wird, auch wenn Fehler auftreten. Mit "with" wird die Session automatisch geschlossen, wenn der Block verlassen wird.
        yield session

