# Security Middleware.
# Die Datei schaut sich jeden Request an der reinkommt und checkt auf offensichtige Muster.
# Also z.B. SQL Injection, XSS, Path Traversal oder gefaehrliche Uploads.
# Wenn was auffaellig ist, wird daraus ein Event das spaeter im Dashboard auftauchen kann.

from fastapi import Request
from sqlmodel import Session

from app.database import engine
from app.models import SecurityEvent
from app.services.detection import correlate

# Import Detektor-Registry ==========================
from app.services.security.registry import run_all_detectors
# ===================================================

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

async def security_middleware(request: Request, call_next):
    # wird von FastAPI bei jedem Request aufgerufen und checkt Request nach Angriffsmuster
    source_ip = request.client.host if request.client else "unknown"
    path = request.url.path

    # Context für Detektoren ========================================
    class SimpleRequestContext:
        def __init__(self, req):
            self.path = req.url.path
            self.query = req.url.query
            self.url = str(req.url)
            self.client_ip = source_ip

    context = SimpleRequestContext(request)

    # Alle Detektoren über Registry aufrufen ========================
    detection_results = run_all_detectors(context)
    # ===============================================================

    # SQL Injection
    if detection_results["sql_injection"]:
        sql_hit = detection_results["sql_injection"]
        print(f"[Middleware] SQL-Injection in URL erkannt: {sql_hit}")
        log_security_event(
            event_type = "sql_injection",
            source_ip = source_ip,
            path = path,
            detail = f"Muster '{sql_hit}' in URL erkannt",
            severity = "high",
        )

    # Path Traversal
    if detection_results["path_traversal"]:
        path_traversal_hit = detection_results["path_traversal"]
        print(f"[Middleware] Path Traversal in URL erkannt: {path_traversal_hit}")
        log_security_event(
            event_type = "path_traversal",
            source_ip = source_ip,
            path = path,
            detail = f"Muster '{path_traversal_hit}' in URL erkannt",
            severity = "high",
        )

    # XSS
    if detection_results["xss"]:
        xss_hit = detection_results["xss"]
        print(f"[Middleware] XSS in URL erkannt: {xss_hit}")
        log_security_event(
            event_type = "xss",
            source_ip = source_ip,
            path = path,
            detail = f"Muster '{xss_hit}' in URL erkannt",
            severity = "medium",
        )

    # Rate Limit
    if detection_results["rate_limit"]:
        rate_limit_hit = detection_results["rate_limit"]
        print(f"[Middleware] Rate Limit überschritten: {rate_limit_hit['count']} Requests")
        log_security_event(
            event_type = "rate_limit",
            source_ip = source_ip,
            path = path,
            detail = f"{rate_limit_hit['count']} Requests in {rate_limit_hit['window']}s (Limit: {rate_limit_hit['threshold']})",
            severity = "medium",
        )

    response = await call_next(request)
    return response

