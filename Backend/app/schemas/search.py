"""Search request and response schemas."""

from pydantic import BaseModel

# Request-Schema fuer die Suchanfrage, um die Daten aus dem Frontend zu validieren.
class SearchResult(BaseModel):
    name: str
    description: str | None = None
<<<<<<< HEAD
=======
    url: str | None = None
    category: str | None = None
>>>>>>> origin/integration-test

# Response-Schema fuer die Suchanfrage, um die Suchergebnisse strukturiert an das Frontend zu uebermitteln.
class SearchResponse(BaseModel):
    query: str
    total: int
    results: list[SearchResult]