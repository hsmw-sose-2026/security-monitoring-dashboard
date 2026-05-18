"""Run all configured security detectors for a request."""

# TODO(Jannis): Registry auf Spezialdetektoren reduzieren.
# SQLi, XSS und Path Traversal laufen kuenftig NICHT mehr ueber diese Datei,
# sondern ueber JSON-Regeln in services/security/rules/*.json:
# rule_loader -> pattern_detector -> middleware -> event_logger.
#
# In registry.py bleiben nur Detektoren mit eigener Logik, die nicht nur Regex
# ueber Request-Text sind, z.B.:
# - rate_limit: braucht Zaehler pro source_ip und Zeitfenster
# - bad_upload: kommt wieder hier rein, wenn Upload-Dateiname/Extension geprueft wird
#
# Also:
# 1. SQL_INJECTION_PATTERNS und detect_sql_injection entfernen.
# 2. In run_all_detectors die Eintraege sql_injection, xss und path_traversal entfernen.
# 3. Die Imports/Aufrufe von xss.py und path_traversal.py entfernen.
# 4. rate_limit funktionsfaehig mit context.source_ip anbinden.
# 5. bad_upload auch hier lösen

import re
from typing import Any
from urllib.parse import unquote

print("[REGISTRY] geladen")

# SQL Injection Patterns
SQL_INJECTION_PATTERNS = [
    re.compile(r"'\s*or\s*'?\d+'?\s*=\s*'?\d+", re.IGNORECASE),    # ' OR 1=1, ' OR '1'='1
    re.compile(r"union\s+select", re.IGNORECASE),                  # UNION SELECT
    re.compile(r"drop\s+table", re.IGNORECASE),                    # DROP TABLE
    re.compile(r";\s*delete\s+from", re.IGNORECASE),               # ; DELETE FROM
    re.compile(r"'\s*--", re.IGNORECASE),                          # ' --
]

def detect_sql_injection(text: str) -> str | None:
    """Detektiert SQL-Injection-Muster"""
    if not text:
        return None
    for pattern in SQL_INJECTION_PATTERNS:
        match = pattern.search(text)
        if match:
            return match.group(0)
    return None


def run_all_detectors(context):
    """Ruft alle Detektoren auf und gibt Ergebnisse zurück"""

    # Ergebnis-Dict für alle Detection-Ergebnisse.
    # verschiedene Ergebnisformate: None, str oder dict.
    detection_results: dict[str, Any] = {
        "sql_injection": None,
        "path_traversal": None,
        "xss": None,
        "rate_limit": None,
        "bad_upload": None,      # Platzhalter
        "brute_force": None,     # Platzhalter
    }

    print(f"[REGISTRY] Request geprüft: {getattr(context, 'path', 'unknown')}")

    # SQL Injection Detector
    # URL-Dekodierung, erkennung kodierter Payloads (%27 OR %271%27%3D%271)
    full_url = unquote(str(getattr(context, 'url', '')))
    sql_hit = detect_sql_injection(full_url)
    if sql_hit:
        print(f"[SQL Injection] TREFFER erkannt: {sql_hit}")
        detection_results["sql_injection"] = sql_hit

    # Path Traversal Detector
    # dynamischer import lässt registry unabhängig von detektoren starten
    try:
        from app.services.security.detectors.path_traversal import detect_path_traversal
        path_hit = detect_path_traversal(context)
        if path_hit:
            print(f"[Path Traversal] TREFFER erkannt: {path_hit}")
            detection_results["path_traversal"] = path_hit
    except Exception as e:
        print(f"[REGISTRY] Fehler beim Path Traversal Detector: {e}")

    # XSS Detector
    try:
        from app.services.security.detectors.xss import detect_xss
        xss_hit = detect_xss(context)
        if xss_hit:
            print(f"[XSS] TREFFER erkannt: {xss_hit}")
            detection_results["xss"] = xss_hit
    except Exception as e:
        print(f"[REGISTRY] Fehler beim XSS Detector: {e}")

    # Rate Limit Detector
    try:
        from app.services.security.detectors.rate_limit import detect_rate_limit
        rate_limit_hit = detect_rate_limit(context)
        if rate_limit_hit:
            print(f"[Rate Limit] TREFFER erkannt: {rate_limit_hit['count']} Requests")
            detection_results["rate_limit"] = rate_limit_hit
    except Exception as e:
        print(f"[REGISTRY] Fehler beim Rate Limit Detector: {e}")

    # Bad Upload Detector (noch nicht implementiert)
    # beispiel
    # try:
    #     from app.services.security.detectors.bad_upload import detect_bad_upload
    #     bad_upload_hit = detect_bad_upload(context)
    #     if bad_upload_hit:
    #         detection_results["bad_upload"] = bad_upload_hit
    # except Exception as e:
    #     pass

    # Brute Force Detector (noch nicht implementiert)
    # beispiel
    # try:
    #     from app.services.security.detectors.brute_force import detect_brute_force
    #     brute_force_hit = detect_brute_force(context)
    #     if brute_force_hit:
    #         detection_results["brute_force"] = brute_force_hit
    # except Exception as e:
    #     pass

    print("[REGISTRY] Prüfung abgeschlossen\n")

    return detection_results