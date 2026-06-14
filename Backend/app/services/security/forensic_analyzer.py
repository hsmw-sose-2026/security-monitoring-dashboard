import json
from app.services.security.detectors.payload_normalizer import normalize_payload


LABEL_EXPLANATIONS = {
    "xss": "Cross-Site-Scripting - typisch Cookie-Diebstahl oder Session-Hijacking.",
    "sqli": "SQL-Injection - Versuch, Datenbank zu manipulieren.",
    "path_traversal": "Path Traversal - Versuch, auf Dateien ausserhalb des Webrooots zuzugreifen.",
    "cmd_injection": "Command Injection - Versuch, Systembefehle auszufuehren.",
}


def _detect_obfuscation(steps: list[dict], original: str) -> str:
    hints = []
    url_changes = sum(1 for s in steps if s["layer"].startswith("url_decode") and s["changed"])

    if url_changes >= 2:
        hints.append("Doppelt URL-kodiert")
    elif url_changes == 1:
        hints.append("URL-Kodiert")
    
    if any(s["layer"] == "html_entities" and s["changed"] for s in steps):
        hints.append("HTML-Entities")
    
    if any(s["layer"] == "hex_escape" and s["changed"] for s in steps):
        hints.append("Hex-Escapes")
    
    return ", ".join(hints) if hints else "Keine gaengige Obfuscation erkannt."


def build_forensic_report(
    *,
    original_payload: str,
    ml_label: str,
    ml_confidence: float,
    p_malicious: float,
    regex_match: bool,
    event_id: int | None = None,
    timestamp: str | None = None,
    source_ip: str | None = None,
    severity: str = "medium",
) -> dict:

    normalized = normalize_payload(original_payload)

    obfuscation = _detect_obfuscation(normalized["steps"], normalized["original"])
    base = LABEL_EXPLANATIONS.get(ml_label, "Verdaechtiger Payload.")
    explanation = f"{obfuscation.capitalize()}: {base}" if obfuscation != "Keine gaengige Obfuscation erkannt." else base

    return {
        "event_id": event_id,
        "timestamp": timestamp,
        "source_ip": source_ip,
        "event_type": "ml_detected_attack",
        "severity": severity,
        "original_payload": normalized["original"],
        "decode_steps": normalized["steps"],
        "final_decoded": normalized["final"],
        "ml_label": ml_label,
        "ml_confidence": ml_confidence,
        "p_malicious": p_malicious,
        "regex_match": regex_match,
        "explanation": explanation,
    }


def forensic_detail_json(report: dict) -> str:
    return json.dumps(report, ensure_ascii=False)