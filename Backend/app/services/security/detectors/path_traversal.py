"""Path traversal detector."""

# TODO(Jannis): Path-Traversal-Erkennung umsetzen.
# Path-Traversal-Erkennung umsetzen.
# Ziel: Muster wie ../, ..\, /etc/passwd oder /etc/shadow in Pfad, Query und Dateinamen erkennen.
# Fertig, wenn ein Request mit ../etc/passwd ein path_traversal-Event mit severity high erzeugt.

import re
import json
from pathlib import Path

print("[PATH TRAVERSAL] Detector geladen")

# load Path-Traversal-Patterns aus path_traversal.json
def _load_path_traversal_patterns():
    """Lade Patterns aus path_traversal.json"""
    # Regeln liegen im rules-Verzeichnis
    config_path = Path(__file__).parent.parent / "rules" / "path_traversal.json"
    try:
        with open(config_path, 'r') as f:
            config = json.load(f)
            patterns = config.get("patterns", [])
            # Kompiliere Patterns einmal beim Laden für effiziente Suche
            return [re.compile(p, re.IGNORECASE) for p in patterns]
    except Exception as e:
        print(f"[PATH TRAVERSAL] Fehler beim Laden von path_traversal.json: {e}")
        return []

PATTERNS = _load_path_traversal_patterns()


def detect_path_traversal(context) -> str | None:
    """Path Traversal Check - gibt erkanntes Muster zurück oder None"""
    query = str(getattr(context, 'query', ''))
    path = str(getattr(context, 'path', ''))
    
    for pattern in PATTERNS:
        # Prüfe zuerst Query, dann Path. 
        # Query-Parameter können gezielt zum Upload der Schwachstelle genutzt werden.
        match = pattern.search(query)
        if match:
            return match.group(0)
        match = pattern.search(path)
        if match:
            return match.group(0)
    return None