# Security Middleware.
# Die Datei schaut sich jeden Request an der reinkommt und checkt auf offensichtige Muster.
# Also z.B. SQL Injection, XSS, Path Traversal oder gefaehrliche Uploads.
# Wenn was auffaellig ist, wird daraus ein Event das spaeter im Dashboard auftauchen kann.

from fastapi import Request
from sqlmodel import Session

from app.database import engine
from app.services.security.event_logger import log_security_event
from app.services.security.request_context import build_context
from app.services.security.detectors.pattern_detector import run_all_pattern_rules
from app.services.security import registry

from app.services.security.detectors.ml_payload_detector import detect_ml_payload

from app.services.security.forensic_analyzer import build_forensic_report, forensic_detail_json


def log_finding(finding: dict, source_ip: str, path: str, request_id: str):
    """Schreibt einen einzelnen Finding als SecurityEvent in die DB."""
    detail = f"[request_id={request_id}] {finding['description']}: {finding['matched_text']} in {finding['where']} erkannt"

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

def log_special_finding(detector_name: str, result: dict, source_ip: str, path: str, request_id: str):
    """Schreibt einen Spezialdetektor-Treffer als SecurityEvent in die DB.
    Spezialdetektoren returnen heterogene Dicts (Rate Limit: count/window,
    Bad Upload: extension/filename). Wir extrahieren das Wesentliche und
    fallen auf sinnvolle Defaults zurueck."""
    
    severity = result.get("severity", "medium")
    detail = result.get("detail") or str(result)

    if not str(detail).strip().startswith("{"):
        detail = f"[request_id={request_id}] {detail}"
    
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

    if "xss" in pattern_events:
        finding = pattern_events["xss"]
        log_security_event(
            event_type="xss",
            source_ip=context.source_ip,
            path=path,
            detail=f"Pattern '{finding['name']}' in {finding['where']} erkannt: {finding['matched_text']}",
            severity=finding["severity"],
        )

    request_id = getattr(request.state, "request_id", "unknown")

    # 2. Alle Pattern-Regeln (SQLi, XSS, Path Traversal) durchlaufen
    pattern_findings = run_all_pattern_rules(context)
    
    # 3. ML-Detector laufen lassen

    ml_result = None
    if not pattern_findings:
        ml_result = detect_ml_payload(context)

    # 4. Spezialdetektoren (Rate Limit, Bad Upload) ueber Registry laufen lassen
    registry_results = registry.run_all_detectors(context) or {}

    # 5. Pattern-Findings loggen
    for finding in pattern_findings:
        print(f"[Middleware] {request_id} {finding['event_type']} erkannt ({finding['name']}): {finding['matched_text']} in {finding['where']}")
        log_finding(finding, context.source_ip, context.path, request_id)

    # 6. ML-Resultat loggen
    if ml_result:
        report = build_forensic_report(
            original_payload=context.searchable_text,
            ml_label=ml_result["ml_label"],
            ml_confidence=ml_result["confidence"],
            p_malicious=ml_result["p_malicious"],
            regex_match=False,
            source_ip=context.source_ip,
            severity=ml_result["severity"],
        )
        ml_result["detail"] = forensic_detail_json(report)
        log_special_finding("ml_detected_attack", ml_result, context.source_ip, context.path, request_id)

    # 7. Spezialdetektor-Treffer loggen
    # Spezialdetektoren returnen entweder None oder ein dict mit eigenen Feldern.
    # Pattern-Detektor-Treffer aus Registry (sql_injection, xss, path_traversal)
    # ignorieren wir bewusst - die laufen schon ueber pattern_findings.
    for detector_name, result in registry_results.items():
        if result is None:
            continue
        if detector_name in ("sql_injection", "xss", "path_traversal"):
            continue  # Doppelt - laeuft schon ueber Pattern-Detector
        print(f"[Middleware] {request_id} {detector_name} erkannt: {result}")
        log_special_finding(detector_name, result, context.source_ip, context.path, request_id)

    # 8. Request normal weiterleiten
    response = await call_next(request)
    return response

