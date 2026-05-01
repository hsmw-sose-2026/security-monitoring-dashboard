# Such Endpoint.
# Nimmt einen Suchbegriff an und sucht in einer kleinen fest definierten Liste.
# Reicht fuer den Anfang voellig, spaeter kann man das immer noch erweitern.

from fastapi import APIRouter, Query

router = APIRouter(prefix="/search", tags=["search"])

list = ["Datei1.txt", "Datei2.txt", "Dokument.pdf", "Bild.jpg"] # vordefinierte Liste von Dateien, in der gesucht werden soll.

# Der Endpoint zum Suchen von Dateien
@router.get("/search")
async def search(q: str = Query(...)): # q: str = Query(...) definiert einen Parameter, der einen Suchbegriff erwartet. Query(...) gibt an, dass dieser Parameter erforderlich ist und von FastAPI als Query-Parameter behandelt werden soll.

    results = [] # Eine leere Liste wird erstellt, um die Suchergebnisse zu speichern.

    for item in list: ## Durch Liste iterieren

        if q.lower() in item.lower(): # Wenn der Suchbegriff (q) in der Liste (item) gefunden wird, wird die Liste zu den Ergebnissen hinzugefügt. Hier wird die lower()-Methode verwendet, damit Groß- und Kleinschreibung ignoriert wird.

            results.append(item) # Wenn der Suchbegriff in der Liste gefunden wird, wird die Liste zu den Ergebnissen hinzugefügt.

    return results # Die Suchergebnisse werden als JSON-Antwort zurückgegeben. FastAPI konvertiert die Python-Liste automatisch in JSON, wenn sie zurückgegeben wird.