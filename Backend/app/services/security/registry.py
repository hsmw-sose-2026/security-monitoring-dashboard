"""Run specialized security detectors for a request."""

from typing import Any

import json
from pathlib import Path

UPLOAD_RULE_PATH = Path(__file__).parent / "rules" / "upload_extensions.json"


def detect_bad_upload(filename: str) -> dict | None:
    extension = Path(filename).suffix.lower()

    if not extension:
        return None

    with UPLOAD_RULE_PATH.open(encoding="utf-8") as file:
        rules = json.load(file)

    if not rules.get("enabled", True):
        return None

    blocked_extensions = rules.get("blocked_extensions", [])

    if extension not in blocked_extensions:
        return None

    return {
        "event_type": rules.get("event_type", "bad_upload"),
        "severity": rules.get("severity", "medium"),
        "blocked_extension": extension,
        "detail": f"Blockierte Dateiendung: {extension}",
        "reason": "extension_blocked",
    }


def run_all_detectors(context):
    """Ruft Spezialdetektoren auf.
    Regex-Detektoren wie SQLi, XSS und Path Traversal laufen ueber
    rule_loader -> pattern_detector -> middleware."""

    detection_results: dict[str, Any] = {
        "rate_limit": None,
        "bad_upload": None,
    }

    try:
        from app.services.security.detectors.rate_limit import detect_rate_limit
        rate_limit_hit = detect_rate_limit(context)
        detection_results["rate_limit"] = rate_limit_hit
    except Exception:
        detection_results["rate_limit"] = None

    return detection_results