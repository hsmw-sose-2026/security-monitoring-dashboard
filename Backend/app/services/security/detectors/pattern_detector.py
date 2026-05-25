"""Generic detector for JSON regex pattern rules."""

import re

from app.services.security.request_context import RequestContext
from app.services.security.rule_loader import get_enabled_rules


def run_pattern_detection(rules: dict, context: RequestContext) -> list[dict]:
    """Prueft alle Patterns aus einer Regel-Definition gegen die durchsuchbaren
    Felder des RequestContext (URL, Body, Form-Felder).
    Gibt eine Liste von Findings zurueck. Leere Liste = nichts gefunden."""
    
    event_type = rules.get("event_type", "unknown")
    severity = rules.get("severity", "medium")
    patterns = rules.get("patterns", [])
    
    fields_to_check = []
    # Query-Parameter zuerst pruefen, damit "query:q" als spezifischeres
    # Feld vor "url" matcht und das where-Label aussagekraeftiger wird.
    for field_name, field_value in context.query_params.items():
        fields_to_check.append((f"query:{field_name}", str(field_value)))
    # Form-Felder einzeln, damit wir bei einem Treffer wissen wo er war
    for field_name, field_value in context.form_fields.items():
        fields_to_check.append((f"form:{field_name}", str(field_value)))
    # Generische Felder als Fallback fuer alles, was nicht in einem speziellen Feld liegt
    fields_to_check.append(("url", context.full_url))
    fields_to_check.append(("body", context.body_text))
    
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

def run_all_pattern_rules(context: RequestContext) -> list[dict]:
    """Laeuft alle aktiven Pattern-Regelsaetze gegen den RequestContext.
    Holt die Regelsaetze ueber get_enabled_rules() und ruft fuer jeden
    run_pattern_detection() auf. Alle Findings werden zu einer flachen Liste
    zusammengefuehrt.
    Wird von der Middleware aufgerufen, damit dort kein Regelset mehr
    hardcoded steht."""
    
    all_findings = []
    
    for rule_name, rules in get_enabled_rules().items():
        # upload_extensions hat ein abweichendes Schema (keine patterns), 
        # wird durch get_enabled_rules() ausgefiltert, aber zur Sicherheit:
        if "patterns" not in rules:
            continue
        
        findings = run_pattern_detection(rules, context)
        all_findings.extend(findings)
    
    return all_findings