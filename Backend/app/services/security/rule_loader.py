"""Load JSON based security detection rules."""

import json
from pathlib import Path


# Ordner mit allen Regel-Dateien (relativ zur aktuellen Datei)
RULES_DIR = Path(__file__).parent / "rules"


def load_all_rules() -> dict:
    """Laedt alle JSON-Regel-Dateien aus dem rules/-Ordner.
    Gibt ein Dict zurueck, indiziert nach Datei-Namen ohne .json-Endung.
    Beispiel: load_all_rules()["sqli"] enthaelt die SQLi-Regeln.
    Wirft RuntimeError mit verstaendlicher Meldung bei kaputten JSON-Dateien."""
    rules = {}
    
    for json_file in RULES_DIR.glob("*.json"):
        rule_name = json_file.stem  # "sqli.json" -> "sqli"
        try:
            with open(json_file, encoding="utf-8") as f:
                rules[rule_name] = json.load(f)
        except json.JSONDecodeError as e:
            raise RuntimeError(
                f"Fehler beim Laden von {json_file.name}: ungueltiges JSON. "
                f"Zeile {e.lineno}, Spalte {e.colno}: {e.msg}"
            )
        except OSError as e:
            raise RuntimeError(
                f"Fehler beim Oeffnen von {json_file.name}: {e}"
            )
    
    print(f"[RuleLoader] {len(rules)} Regeldateien geladen: {', '.join(rules.keys())}")
    return rules


# Beim Import einmal laden
ALL_RULES = load_all_rules()


def get_rules(name: str) -> dict:
    """Gibt die Regeln fuer einen bestimmten Bereich zurueck.
    Beispiel: get_rules('sqli') gibt das geladene Dict aus sqli.json zurueck."""
    if name not in ALL_RULES:
        raise KeyError(
            f"Keine Regeln fuer '{name}' geladen. "
            f"Verfuegbar: {', '.join(ALL_RULES.keys())}"
        )
    return ALL_RULES[name]