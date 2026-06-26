"""Run all specialized security detectors for a request."""

import json
from pathlib import Path
from typing import Any

RULES_DIR = Path(__file__).resolve().parent / "rules"
BAD_UPLOAD_RULE_PATH = RULES_DIR / "upload_extensions.json"


def _load_bad_upload_rules() -> dict:
    try:
        with open(BAD_UPLOAD_RULE_PATH, encoding="utf-8") as f:
            rules = json.load(f)
            if isinstance(rules, dict):
                return rules
    except Exception:
        pass
    return {}


BAD_UPLOAD_RULES = _load_bad_upload_rules()


def detect_bad_upload(filename: str) -> dict | None:
    """Prueft eine hochgeladene Datei anhand der upload_extensions.json."""
    if not filename:
        return None

    rules = BAD_UPLOAD_RULES
    if not rules:
        return None

    enabled = rules.get("enabled", True)
    if isinstance(enabled, str):
        enabled = enabled.lower() not in ("false", "0", "no")
    if not enabled:
        return None

    allowed_extensions = [ext.lower() for ext in rules.get("allowed_extensions", []) if isinstance(ext, str)]
    blocked_extensions = [ext.lower() for ext in rules.get("blocked_extensions", []) if isinstance(ext, str)]
    extension = Path(filename).suffix.lower()

    if blocked_extensions and extension in blocked_extensions:
        return {
            "event_type": "bad_upload",
            "severity": rules.get("severity", "medium"),
            "filename": filename,
            "extension": extension,
            "reason": "blocked_extension",
            "detail": f"Blockierte Dateiendung: {extension}",
        }

    if allowed_extensions:
        if not extension or extension not in allowed_extensions:
            return {
                "event_type": "bad_upload",
                "severity": rules.get("severity", "medium"),
                "filename": filename,
                "extension": extension,
                "reason": "not_allowed_extension",
                "detail": f"Erweiterung nicht erlaubt: {extension}",
            }

    return None


def run_all_detectors(context):
    """Ruft die spezialisierten Detektoren auf und gibt ihre Ergebnisse zurueck."""
    detection_results: dict[str, Any] = {
        "rate_limit": None,
        "bad_upload": None,
        "honeypot": None,
    }

    try:
        from app.services.security.detectors.rate_limit import detect_rate_limit
        detection_results["rate_limit"] = detect_rate_limit(context)
    except Exception:
        detection_results["rate_limit"] = None

    filename = getattr(context, "uploaded_filename", None) or getattr(context, "file_name", None)
    if filename:
        detection_results["bad_upload"] = detect_bad_upload(filename)

    # Honeypot detection
    try:
        from app.services.security.detectors.honeypot_detector import detect_honeypot

        path = getattr(context, "path", "")
        detection_results["honeypot"] = detect_honeypot(path)
    except Exception:
        detection_results["honeypot"] = None

    return detection_results
