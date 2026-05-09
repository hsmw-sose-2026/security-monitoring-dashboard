"""Central place to include API routers after the modular split."""

# TODO(Jonas/Tim): Zentrale Router-Registrierung vorbereiten.
<<<<<<< HEAD
# Ziel: Alle app.include_router(...)-Aufrufe aus main.py hier sammeln, sobald die
# neuen Routen stabil sind.
# Fertig, wenn main.py nur noch register_routers(app) aufrufen muss.
=======

from fastapi import FastAPI

from app.routes import auth as auth_routes
from app.routes import dashboard as dashboard_routes

def register_routers(app: FastAPI) -> None:
    app.include_router(auth_routes.router)
    app.include_router(dashboard_routes.router)


# aktuell nur stabile router auth und dashboard drin
# (Tim) restliche router müssten ergänzt werden, wenn die module fertig sind
>>>>>>> origin/integration-test
