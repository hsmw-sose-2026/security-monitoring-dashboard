"""Normalized request data for security detectors."""

import json
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
        for value in self.query_params.values():   
            parts.append(str(value))
        return " ".join(parts)


async def build_context(request: Request) -> RequestContext:
    """Baut aus einem FastAPI-Request einen normalisierten RequestContext.
    Liest dabei auch den Body aus, damit Detektoren ihn pruefen koennen."""
    
    # IP-Adresse ermitteln, mit Fallback ueber Proxy-Header.
    # x-forwarded-for: "client, proxy1, proxy2" - der erste Wert ist die Original-IP.
    source_ip = "unknown"
    if request.client:
        source_ip = request.client.host
    else:
        forwarded_for = request.headers.get("x-forwarded-for")
        real_ip = request.headers.get("x-real-ip")
        if forwarded_for:
            source_ip = forwarded_for.split(",")[0].strip()
        elif real_ip:
            source_ip = real_ip
    method = request.method
    path = request.url.path
    full_url = unquote(str(request.url))
    
    # Query-Parameter als dict
    query_params = dict(request.query_params)
    
    # Headers als dict (alle Werte als Strings)
    headers = dict(request.headers)
    
    # Body nur bei POST/PUT/PATCH/DELETE lesen
    body_text = ""
    form_fields = {}
    
    if method in ("POST", "PUT", "PATCH", "DELETE"):
        body_bytes = await request.body()
        body_text = unquote(body_bytes.decode("utf-8", errors="ignore"))
        
        # Body als Form-Daten oder JSON parsen
        content_type = headers.get("content-type", "")
        if "application/x-www-form-urlencoded" in content_type:
            parsed = parse_qs(body_text)
            # parse_qs liefert Listen-Values, wir nehmen den ersten Wert pro Key
            form_fields = {k: v[0] if v else "" for k, v in parsed.items()}
        elif "application/json" in content_type:
            # JSON-Body parsen, Top-Level-Felder uebernehmen.
            # Verschachtelte Werte stringifizieren, damit der Pattern-Detector
            # auch in Sub-Strukturen Treffer finden kann.
            try:
                parsed_json = json.loads(body_text)
                if isinstance(parsed_json, dict):
                    form_fields = {k: str(v) for k, v in parsed_json.items()}
            except json.JSONDecodeError:
                # Defektes JSON ignorieren - der Body bleibt in body_text und
                # wird so vom Pattern-Detector trotzdem durchsucht.
                pass
    
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

