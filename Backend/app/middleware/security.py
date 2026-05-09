# Security Middleware.
# Holt Patterns ueber den rule_loader, baut den RequestContext, ruft den
# pattern_detector auf und schreibt Findings als SecurityEvents in die DB.

from fastapi import Request
from sqlmodel import Session

from app.database import engine
from app.services.security.event_logger import log_security_event
from app.services.security.rule_loader import get_rules
from app.services.security.request_context import build_context
from app.services.security.detectors.pattern_detector import run_pattern_detection


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

async def security_middleware(request: Request, call_next):
    """Wird von FastAPI bei jedem Request aufgerufen.
    Baut einen RequestContext, prueft alle SQLi-Patterns dagegen und schreibt
    Findings als SecurityEvents in die DB."""

    # 1. Kontext aus dem Request bauen
    context = await build_context(request)

    # 2. SQLi-Regeln laden und durchsuchen
    # TODO: Sobald registry.py von Jannis da ist, hier auf registry.run_all() umstellen,
    # dann werden automatisch alle Detektoren (SQLi, XSS, Path Traversal, ...) ausgefuehrt.
    sqli_rules = get_rules("sqli")
    findings = run_pattern_detection(sqli_rules, context)

    # 3. Findings als Events loggen
    for finding in findings:
        print(f"[Middleware] {finding['event_type']} erkannt ({finding['name']}): {finding['matched_text']} in {finding['where']}")
        log_finding(finding, context.source_ip, context.path)

    # 4. Request normal weiterleiten
    response = await call_next(request)
    return response