"""Generic detector for JSON regex pattern rules."""

# TODO(Tim): Generischen Regex-Detektor fuer JSON-Regeln bauen.
# Ziel: Eine geladene Regeldatei nimmt mehrere Request-Felder und prueft alle Patterns.
# Fertig, wenn SQLi, XSS und Path Traversal denselben Pattern-Detector wiederverwenden koennen.


import re

from app.services.security.request_context import RequestContext


def run_pattern_detection(rules: dict, context: RequestContext) -> list[dict]:
    """Prueft alle Patterns aus einer Regel-Definition gegen die durchsuchbaren
    Felder des RequestContext (URL, Body, Form-Felder).
    Gibt eine Liste von Findings zurueck. Leere Liste = nichts gefunden."""
    
    event_type = rules.get("event_type", "unknown")
    severity = rules.get("severity", "medium")
    patterns = rules.get("patterns", [])
    
    # Alle durchsuchbaren Felder als (where, text)-Tupel
    fields_to_check = [
        ("url", context.full_url),
        ("body", context.body_text),
    ]
    # Form-Felder einzeln dazunehmen, damit wir bei einem Treffer wissen,
    # in welchem Feld er war (z.B. "form:username")
    for field_name, field_value in context.form_fields.items():
        fields_to_check.append((f"form:{field_name}", str(field_value)))
    
    findings = []
    
    for pattern_def in patterns:
        try:
            compiled = re.compile(pattern_def["regex"], re.IGNORECASE)
        except re.error as e:
            print(f"[PatternDetector] Ungueltiges Regex in Pattern '{pattern_def.get('name')}': {e}")
            continue
        
        for where, text in fields_to_check:
            if not text:
                continue
            match = compiled.search(text)
            if match:
                findings.append({
                    "name": pattern_def["name"],
                    "matched_text": match.group(0),
                    "where": where,
                    "event_type": event_type,
                    "severity": severity,
                    "description": pattern_def.get("description", ""),
                })
                break  # Pattern hat in einem Feld gematcht, naechstes Pattern
    
    return findings