# Security Middleware.
# Die Datei schaut sich jeden Request an der reinkommt und checkt auf offensichtige Muster.
# Also z.B. SQL Injection, XSS, Path Traversal oder gefaehrliche Uploads.
# Wenn was auffaellig ist, wird daraus ein Event das spaeter im Dashboard auftauchen kann.

import re
import json
from pathlib import Path
from fastapi import Request
from sqlmodel import Session
from urllib.parse import unquote

from app.database import engine
from app.models import SecurityEvent
from app.services.detection import correlate

PATTERNS_FILE = Path(__file__).parent.parent / "config" / "patterns.json"

# Alle Muster in einer JSON-Datei, die Middleware checkt gegen alle Muster und loggt entsprechend
def load_patterns():
    """Laedt die Patterns aus der JSON-Datei und kompiliert die Regexes.
    Gibt eine Liste von Pattern-Dicts zurueck."""
    with open(PATTERNS_FILE, encoding="utf-8") as f:
        raw_patterns = json.load(f)
    
    compiled = []
    for p in raw_patterns:
        compiled.append({
            "name": p["name"],
            "regex": re.compile(p["regex"], re.IGNORECASE),
            "event_type": p["event_type"],
            "severity": p["severity"],
            "description": p["description"],
        })
    
    print(f"[Patterns] {len(compiled)} Patterns geladen")
    return compiled

PATTERNS = load_patterns()

# SQL_INJECTION_PATTERNS = [
#     re.compile(r"'\s*or\s*'?\d+'?\s*=\s*'?\d+", re.IGNORECASE),    # ' OR 1=1, ' OR '1'='1
#     re.compile(r"union\s+select", re.IGNORECASE),                  # UNION SELECT
#     re.compile(r"drop\s+table", re.IGNORECASE),                    # DROP TABLE
#     re.compile(r";\s*delete\s+from", re.IGNORECASE),               # ; DELETE FROM
#     re.compile(r"'\s*--", re.IGNORECASE),                          # ' --
# ]

# def detect_sql_injection(text: str) -> str | None: 
#     # überprueft ob ein SQL-Injection-Pattern vorkommt und gibt das erste gefundene Muster als String String zurueck
#     if not text:
#         return None
#     for pattern in SQL_INJECTION_PATTERNS: 
#         match = pattern.search(text)
#         if match:
#             return match.group(0)
#     return None
    
# Modularere Variante: Alle Muster in einer JSON-Datei, die Middleware checkt gegen alle Muster und loggt entsprechend
def detect_pattern(text: str) -> dict | None:
    """Prueft text gegen alle geladenen Patterns. Gibt ein dict mit
    pattern-Infos und matched_text zurueck oder None wenn nichts gefunden."""
    if not text:
        return None
    for p in PATTERNS:
        match = p["regex"].search(text)
        if match:
            return {
                "matched_text": match.group(0),
                "name": p["name"],
                "event_type": p["event_type"],
                "severity": p["severity"],
                "description": p["description"],
            }
    return None

def log_security_event(event_type: str, source_ip: str, path: str, detail: str, severity: str): 
    # speichert Event in DB
    with Session(engine) as session:
        event = SecurityEvent(
            event_type = event_type,
            source_ip = source_ip,
            path = path,
            detail = detail,
            severity = severity,
         )
        session.add(event)
        session.commit()
        correlate(session, event.source_ip)

# async def security_middleware(request: Request, call_next):
#     # wird von FastAPI bei jedem Request aufgerufen und checkt Request nach Angriffsmuster
#     source_ip = request.client.host if request.client else "unknown"
#     path = request.url.path
    
#     full_url = unquote(str(request.url))        # unquote weil Browser URL kodiert (z.B. ' wird zu %27 )
#     sql_hit = detect_sql_injection(full_url)

#     if sql_hit:
#         print(f"[Middleware] SQL-Injection in URL erkannt: {sql_hit}")
#         log_security_event(
#             event_type = "sql_injection",
#             source_ip = source_ip,
#             path = path,
#             detail = f"Muster '{sql_hit}' in URL erkannt",
#             severity = "high",
#         )

#     response = await call_next(request)
#     return response

# für Modularität: Alle Muster in einer JSON-Datei, die Middleware checkt gegen alle Muster und loggt entsprechend
async def security_middleware(request: Request, call_next):
    # wird von FastAPI bei jedem Request aufgerufen und checkt Request nach Angriffsmuster
    source_ip = request.client.host if request.client else "unknown"
    path = request.url.path
    
    full_url = unquote(str(request.url))    # unquote weil Browser URL kodiert (z.B. ' wird zu %27)
    hit = detect_pattern(full_url)
    if hit:
        print(f"[Middleware] {hit['event_type']} erkannt ({hit['name']}): {hit['matched_text']}")
        log_security_event(
            event_type=hit["event_type"],
            source_ip=source_ip,
            path=path,
            detail=f"{hit['description']}: {hit['matched_text']} in URL erkannt",
            severity=hit["severity"],
        )
    response = await call_next(request)
    return response
