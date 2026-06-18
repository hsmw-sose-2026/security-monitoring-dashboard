"""Central place to include API routers after the modular split."""

from fastapi import FastAPI

from app.routes import auth as auth_routes
from app.routes import contact as contact_routes
from app.routes import dashboard as dashboard_routes
from app.routes import rules as rules_routes
from app.routes import search as search_routes
from app.routes import upload as upload_routes

def register_routers(app: FastAPI) -> None:
    app.include_router(auth_routes.router)
    app.include_router(dashboard_routes.router)
    app.include_router(contact_routes.router)
    app.include_router(search_routes.router)
    app.include_router(upload_routes.router)
    app.include_router(rules_routes.router)
    app.include_router(contact_routes.router)
    app.include_router(search_routes.router)
    app.include_router(upload_routes.router)


# Router hier zentral registrieren, sobald die Module stabil genug fuer integration-test sind.
