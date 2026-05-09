"""Normalized request data for security detectors."""

# TODO(Tim): Eingehende Requests in eine gemeinsame Struktur umwandeln.
# Ziel: Client-IP, Pfad, Query-Parameter, Header und Body/Form-Felder so sammeln,
# dass alle Detektoren dieselben Daten pruefen koennen.
# Fertig, wenn SQLi/XSS nicht nur in der URL, sondern auch in Formularfeldern erkannt werden kann.


from dataclasses import dataclass, field
from urllib.parse import unquote, parse_qs
from fastapi import Request


@dataclass
class RequestContext:
    """Buendelt alle relevanten Request-Daten in einer einheitlichen Struktur."""
    source_ip: str
    method: str
    path: str
    full_url: str                              # dekodierte URL inkl. Query-String
    query_params: dict = field(default_factory=dict)
    headers: dict = field(default_factory=dict)
    body_text: str = ""                        # Roher Body als String
    form_fields: dict = field(default_factory=dict)
    
    @property
    def searchable_text(self) -> str:
        """Alle Text-Inhalte zusammen, die fuer Pattern-Erkennung relevant sind."""
        parts = [self.full_url, self.body_text]
        for value in self.form_fields.values():
            parts.append(str(value))
        return " ".join(parts)


async def build_context(request: Request) -> RequestContext:
    """Baut aus einem FastAPI-Request einen normalisierten RequestContext.
    Liest dabei auch den Body aus, damit Detektoren ihn pruefen koennen."""
    
    source_ip = request.client.host if request.client else "unknown"
    method = request.method
    path = request.url.path
    full_url = unquote(str(request.url))
    
    # Query-Parameter als dict
    query_params = dict(request.query_params)
    
    # Headers als dict (alle Werte als Strings)
    headers = dict(request.headers)
    
    # Body nur bei POST/PUT/PATCH lesen
    body_text = ""
    form_fields = {}
    
    if method in ("POST", "PUT", "PATCH"):
        body_bytes = await request.body()
        body_text = unquote(body_bytes.decode("utf-8", errors="ignore"))
        
        # Versuch, den Body als Form-Daten zu parsen (key=value&key2=value2)
        content_type = headers.get("content-type", "")
        if "application/x-www-form-urlencoded" in content_type:
            parsed = parse_qs(body_text)
            # parse_qs liefert Listen-Values, wir nehmen den ersten Wert pro Key
            form_fields = {k: v[0] if v else "" for k, v in parsed.items()}
    
    return RequestContext(
        source_ip=source_ip,
        method=method,
        path=path,
        full_url=full_url,
        query_params=query_params,
        headers=headers,
        body_text=body_text,
        form_fields=form_fields,
    )