# Security Middleware.
# Die Datei schaut sich jeden Request an der reinkommt und checkt auf offensichtige Muster.
# Also z.B. SQL Injection, XSS, Path Traversal oder gefaehrliche Uploads.
# Wenn was auffaellig ist, wird daraus ein Event das spaeter im Dashboard auftauchen kann.

from fastapi import Request
from sqlmodel import Session

from app.database import engine
from app.models import SecurityEvent
from app.services.detection import correlate
from app.services.security.registry import run_all_detectors
from app.services.security.request_context import build_context
from app.services.security.rule_loader import get_rules
from app.services.security.detectors.pattern_detector import run_pattern_detection


def log_security_event(event_type: str, source_ip: str, path: str, detail: str, severity: str):
    # speichert Event in DB
    with Session(engine) as session:
        event = SecurityEvent(
            event_type=event_type,
            source_ip=source_ip,
            path=path,
            detail=detail,
            severity=severity,
        )
        session.add(event)
        session.commit()
        correlate(session, event.source_ip)


async def security_middleware(request: Request, call_next):
    # wird von FastAPI bei jedem Request aufgerufen und checkt Request nach Angriffsmuster
    path = request.url.path
    context = await build_context(request)

    # Alle Spezialdetektoren über Registry aufrufen ====================
    detection_results = run_all_detectors(context)
    # ===============================================================

    # JSON-basierte Pattern-Erkennung für SQLi, XSS und Path Traversal
    pattern_events: dict[str, dict] = {}

    for rule_name in ("sqli", "xss", "path_traversal"):
        rules = get_rules(rule_name)
        findings = run_pattern_detection(rules, context)
        if not findings:
            continue

        first_finding = findings[0]
        pattern_events[first_finding["event_type"]] = first_finding

    if "sql_injection" in pattern_events:
        finding = pattern_events["sql_injection"]
        log_security_event(
            event_type="sql_injection",
            source_ip=context.source_ip,
            path=path,
            detail=f"Muster '{finding['name']}' in {finding['where']} erkannt: {finding['matched_text']}",
            severity=finding["severity"],
        )

    if "path_traversal" in pattern_events:
        finding = pattern_events["path_traversal"]
        log_security_event(
            event_type="path_traversal",
            source_ip=context.source_ip,
            path=path,
            detail=f"Pattern '{finding['name']}' in {finding['where']} erkannt: {finding['matched_text']}",
            severity=finding["severity"],
        )

    if "xss" in pattern_events:
        finding = pattern_events["xss"]
        log_security_event(
            event_type="xss",
            source_ip=context.source_ip,
            path=path,
            detail=f"Pattern '{finding['name']}' in {finding['where']} erkannt: {finding['matched_text']}",
            severity=finding["severity"],
        )

    # Honeypot-Detection
    if detection_results.get("honeypot"):
        finding = detection_results["honeypot"]
        log_security_event(
            event_type=finding["event_type"],
            source_ip=context.source_ip,
            path=path,
            detail=f"Honeypot endpoint accessed: {finding['path']}",
            severity=finding["severity"],
        )
    # Honeypot requests werden nicht geblock, werden nur gespeichert.
    # Anfrage läuft normal weiter -> 404

    # Der Rate-Limit-Detektor loggt bei Trigger bereits selbst ein Event.
    # Hier lassen wir das Ergebnis nur zur möglichen Erweiterung übrig.

    response = await call_next(request)
    return response

