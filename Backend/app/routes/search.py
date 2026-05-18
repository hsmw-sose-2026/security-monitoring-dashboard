# Such-Endpoint.
# Nimmt einen Suchbegriff entgegen und delegiert die gesamte Suchlogik
# an den Search-Service. Die Route selbst enthaelt keine Business-Logik.

from fastapi import APIRouter, Query

from app.schemas.search import SearchResponse
from app.services.search_service import search_items

router = APIRouter(prefix="/search", tags=["search"])

@router.get("", response_model=SearchResponse)
async def search(q: str = Query(..., description="Suchbegriff – erforderlich, Gross-/Kleinschreibung wird ignoriert.")):
    # Gesamte Suchlogik und Listenverwaltung liegt im Service
    return search_items(q)