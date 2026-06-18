"""Search logic for the demo company website."""

from app.schemas.search import SearchResult, SearchResponse

# Vordefinierte Liste von Eintraegen – vorerst generisch.
SEARCHABLE_ITEMS: list[SearchResult] = [
    SearchResult(name="Sicheres Passwort-Management"),
    SearchResult(name="Was ist eine Firewall?"),
    SearchResult(name="SQL Injection verstehen"),
    SearchResult(name="Zwei-Faktor-Authentifizierung"),
    SearchResult(name="HTTPS vs HTTP"),
    SearchResult(name="Phishing erkennen"),
    SearchResult(name="VPN im Alltag"),
    SearchResult(name="Datenschutz im Unternehmen"),
<<<<<<< HEAD
=======
    SearchResult(name="Startseite", url="/", category="Seite"),
    SearchResult(name="Kontakt", url="/contact", category="Seite"),
    SearchResult(name="Upload", url="/upload", category="Seite"),
>>>>>>> origin/integration-test
]


def search_items(q: str) -> SearchResponse:
    # Suchbegriff in Kleinbuchstaben umwandeln für Suche
    query_lower = q.lower()

    # Nur Eintraege behalten deren Name den Suchbegriff enthaelt
    matches = [
        item for item in SEARCHABLE_ITEMS
<<<<<<< HEAD
        if query_lower in item.name.lower()
=======
        if (
            query_lower in item.name.lower()
            or query_lower in (item.description or "").lower()
            or query_lower in (item.category or "").lower(
            )
        )
>>>>>>> origin/integration-test
    ]

    return SearchResponse(
        query=q,
        total=len(matches),
        results=matches,
    )
