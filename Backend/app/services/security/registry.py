<<<<<<< HEAD
﻿"""Run all specialized security detectors for a request."""

import json
from pathlib import Path
from typing import Any

RULES_DIR = Path(__file__).resolve().parent.parent / "rules"
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
    """Prüft eine hochgeladene Datei anhand der upload_extensions.json."""
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
        }

    if allowed_extensions:
        if not extension or extension not in allowed_extensions:
            return {
                "event_type": "bad_upload",
                "severity": rules.get("severity", "medium"),
                "filename": filename,
                "extension": extension,
                "reason": "not_allowed_extension",
            }

    return None


def run_all_detectors(context):
    """Ruft die spezialisierten Detektoren auf und gibt ihre Ergebnisse zurück."""
    detection_results: dict[str, Any] = {
        "rate_limit": None,
        "bad_upload": None,
        "honeypot": None,
=======
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
>>>>>>> origin/integration-test
    }

    try:
        from app.services.security.detectors.rate_limit import detect_rate_limit
<<<<<<< HEAD

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
=======
        rate_limit_hit = detect_rate_limit(context)
        detection_results["rate_limit"] = rate_limit_hit
    except Exception:
        detection_results["rate_limit"] = None

    return detection_results
>>>>>>> origin/integration-test
