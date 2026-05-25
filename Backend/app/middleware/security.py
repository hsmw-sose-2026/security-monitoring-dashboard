# Security Middleware.
# Holt Patterns ueber den rule_loader, baut den RequestContext, ruft den
# pattern_detector auf und schreibt Findings als SecurityEvents in die DB.

from fastapi import Request
from sqlmodel import Session

from app.database import engine
from app.services.security.event_logger import log_security_event
from app.services.security.request_context import build_context
from app.services.security.detectors.pattern_detector import run_all_pattern_rules
from app.services.security import registry


def log_finding(finding: dict, source_ip: str, path: str):
    """Schreibt einen einzelnen Finding als SecurityEvent in die DB."""
    detail = f"{finding['description']}: {finding['matched_text']} in {finding['where']} erkannt"

    with Session(engine) as session:
        log_security_event(
            session=session,
            event_type=finding["event_type"],
            source_ip=source_ip,
            path=path,
            detail=detail,
            severity=finding["severity"],
        )

def log_special_finding(detector_name: str, result: dict, source_ip: str, path: str):
    """Schreibt einen Spezialdetektor-Treffer als SecurityEvent in die DB.
    Spezialdetektoren returnen heterogene Dicts (Rate Limit: count/window,
    Bad Upload: extension/filename). Wir extrahieren das Wesentliche und
    fallen auf sinnvolle Defaults zurueck."""
    
    severity = result.get("severity", "medium")
    detail = result.get("detail") or str(result)
    
    with Session(engine) as session:
        log_security_event(
            session=session,
            event_type=detector_name,
            source_ip=source_ip,
            path=path,
            detail=detail,
            severity=severity,
        )

async def security_middleware(request: Request, call_next):
    """Wird von FastAPI bei jedem Request aufgerufen.
    Baut einen RequestContext, laesst alle aktiven Pattern-Detektoren und
    Spezialdetektoren (Rate Limit, Bad Upload) drueberlaufen und schreibt
    gefundene Treffer als SecurityEvents in die DB."""

    # 1. Kontext aus dem Request bauen
    context = await build_context(request)

    # 2. Alle Pattern-Regeln (SQLi, XSS, Path Traversal) durchlaufen
    pattern_findings = run_all_pattern_rules(context)

    # 3. Spezialdetektoren (Rate Limit, Bad Upload) ueber Registry laufen lassen
    registry_results = registry.run_all_detectors(context) or {}

    # 4. Pattern-Findings loggen
    for finding in pattern_findings:
        print(f"[Middleware] {finding['event_type']} erkannt ({finding['name']}): {finding['matched_text']} in {finding['where']}")
        log_finding(finding, context.source_ip, context.path)

    # 5. Spezialdetektor-Treffer loggen
    # Spezialdetektoren returnen entweder None oder ein dict mit eigenen Feldern.
    # Pattern-Detektor-Treffer aus Registry (sql_injection, xss, path_traversal)
    # ignorieren wir bewusst - die laufen schon ueber pattern_findings.
    for detector_name, result in registry_results.items():
        if result is None:
            continue
        if detector_name in ("sql_injection", "xss", "path_traversal"):
            continue  # Doppelt - laeuft schon ueber Pattern-Detector
        log_special_finding(detector_name, result, context.source_ip, context.path)

    # 6. Request normal weiterleiten
    response = await call_next(request)
    return response

