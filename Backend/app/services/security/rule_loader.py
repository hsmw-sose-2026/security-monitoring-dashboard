"""Load JSON based security detection rules."""

import json
from pathlib import Path


# Ordner mit allen Regel-Dateien (relativ zur aktuellen Datei)
RULES_DIR = Path(__file__).parent / "rules"


def _validate_rule(rule_name: str, data: dict) -> None:
    """Prueft eine geladene Regel auf Pflichtfelder und korrekte Typen.
    Wirft RuntimeError mit verstaendlicher Meldung bei Problemen.
    upload_extensions wird uebersprungen, weil es ein abweichendes Schema hat."""
    
    # Sonderfall: upload_extensions hat blocked_extensions statt patterns
    if rule_name == "upload_extensions":
        return
    
    # Sonderfall: honeypot_paths wird vom honeypot_detector direkt gelesen,
    # hat ein voellig anderes Schema (paths/responses/alert_threshold)
    if rule_name == "honeypot_paths":
        return
    
    # Pflichtfelder pruefen
    required = ["event_type", "severity", "patterns"]
    for field in required:
        if field not in data:
            raise RuntimeError(
                f"Regel '{rule_name}': Pflichtfeld '{field}' fehlt."
            )
    
    # enabled muss bool sein, Default true wenn fehlt
    if "enabled" not in data:
        data["enabled"] = True
    elif not isinstance(data["enabled"], bool):
        raise RuntimeError(
            f"Regel '{rule_name}': 'enabled' muss true/false sein, "
            f"nicht {type(data['enabled']).__name__} ({data['enabled']!r})."
        )
    
    # patterns muss Liste sein
    if not isinstance(data["patterns"], list):
        raise RuntimeError(
            f"Regel '{rule_name}': 'patterns' muss eine Liste sein."
        )
    
    # Jedes Pattern muss dict mit name/regex/description sein
    for i, pattern in enumerate(data["patterns"]):
        if not isinstance(pattern, dict):
            raise RuntimeError(
                f"Regel '{rule_name}', Pattern #{i}: muss ein Objekt sein, "
                f"nicht {type(pattern).__name__}."
            )
        for field in ["name", "regex", "description"]:
            if field not in pattern:
                raise RuntimeError(
                    f"Regel '{rule_name}', Pattern #{i}: Feld '{field}' fehlt."
                )


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
            _validate_rule(rule_name, rules[rule_name])
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


def reload_rules() -> None:
    """Laedt alle Regeldateien neu in den In-Memory-Cache.
    Wird nach Aenderungen ueber die Rules-API aufgerufen."""
    ALL_RULES.clear()
    ALL_RULES.update(load_all_rules())


def get_rules(name: str) -> dict:
    """Gibt die Regeln fuer einen bestimmten Bereich zurueck.
    Beispiel: get_rules('sqli') gibt das geladene Dict aus sqli.json zurueck."""
    if name not in ALL_RULES:
        raise KeyError(
            f"Keine Regeln fuer '{name}' geladen. "
            f"Verfuegbar: {', '.join(ALL_RULES.keys())}"
        )
    return ALL_RULES[name]

def get_enabled_rules() -> dict[str, dict]:
    """Gibt nur die Regeln zurueck, deren 'enabled' auf True steht.
    Wird vom pattern_detector benutzt, damit deaktivierte Regeln uebersprungen werden.
    Sonderfall: Regeln ohne 'enabled'-Feld (z.B. upload_extensions) werden ausgeschlossen,
    weil sie keine Pattern-Regeln im Standardformat sind."""
    return {
        name: data
        for name, data in ALL_RULES.items()
        if data.get("enabled") is True
    }

