"""Cross-site scripting detector."""

# TODO(Jannis): XSS-Erkennung aus xss.json anbinden.
# Ziel: Muster wie <script>, javascript: und onerror= in Kontaktformular, Suche und
# anderen Eingabefeldern erkennen.
# Fertig, wenn ein Kontaktformular mit <script>alert(1)</script> ein xss-Event erzeugt.

import re
import json
from pathlib import Path

print("[XSS] Detector geladen")

# Lade XSS-Patterns aus xss.json
def _load_xss_patterns():
    """Lade Patterns aus xss.json"""
    # Regeln aus rules-Verzeichnis laden, Erkennungsmuster bleiben getrennt
    config_path = Path(__file__).parent.parent / "rules" / "xss.json"
    try:
        with open(config_path, 'r') as f:
            config = json.load(f)
            patterns = config.get("patterns", [])
            # kompiliere search pattern sofort für schnellere Ausführung später.
            return [re.compile(p, re.IGNORECASE) for p in patterns]
    except Exception as e:
        print(f"[XSS] Fehler beim Laden von xss.json: {e}")
        return []

XSS_PATTERNS = _load_xss_patterns()


def detect_xss(context) -> str | None:
    # xss check, sucht nach xss mustern in query und path
    # gibt erkanntes Muster oder none zurück
    query = str(getattr(context, 'query', ''))
    path = str(getattr(context, 'path', ''))
    # Query-Parameter werden zuerst geprüft (oft payload-gefährdet)
    
    for pattern in XSS_PATTERNS:
        match = pattern.search(query)
        if match:
            return match.group(0)
        match = pattern.search(path)
        if match:
            return match.group(0)
    return None