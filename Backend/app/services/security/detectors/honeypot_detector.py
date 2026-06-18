"""Honeypot detector - identifies reconnaissance attempts by detecting access to decoy endpoints."""

import json
from pathlib import Path


RULES_DIR = Path(__file__).resolve().parent.parent / "rules"
HONEYPOT_RULE_PATH = RULES_DIR / "honeypot_paths.json"


def _load_honeypot_rules() -> dict:
    """Load honeypot paths from JSON configuration."""
    try:
        with open(HONEYPOT_RULE_PATH, encoding="utf-8") as f:
            rules = json.load(f)
            if isinstance(rules, dict):
                return rules
    except Exception:
        pass
    return {}


HONEYPOT_RULES = _load_honeypot_rules()


def detect_honeypot(path: str) -> dict | None:
    """
    Detect access to honeypot (decoy) endpoints.
    
    Honeypots are fake endpoints that a legitimate user would never access,
    but automated scanners/bots will try immediately. Examples:
    - /.env, /.git/config, /.aws/credentials
    - /wp-admin, /phpmyadmin, /admin/backup.sql
    - Actuator endpoints, GraphQL, API docs
    
    Returns a security event dict if the path matches a honeypot, None otherwise.
    The event is marked as CRITICAL because honeypot hits indicate active
    reconnaissance, not accidental discovery.
    """
    if not path:
        return None

    rules = HONEYPOT_RULES
    if not rules:
        return None

    enabled = rules.get("enabled", True)
    if isinstance(enabled, str):
        enabled = enabled.lower() not in ("false", "0", "no")
    if not enabled:
        return None

    honeypot_paths = rules.get("paths", [])
    
    # genauer path match (case-insensitive)
    normalized_path = path.lower()
    if normalized_path in [hp.lower() for hp in honeypot_paths]:
        return {
            "event_type": "honeypot_triggered",
            "severity": rules.get("alert_threshold", {}).get("severity", "critical"),
            "path": path,
            "reason": "suspicious_decoy_endpoint",
        }
    
    return None
