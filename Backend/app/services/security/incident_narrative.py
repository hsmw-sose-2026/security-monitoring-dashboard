"""Regelbasierte Generierung von lesbaren Vorfallberichten aus Attack-Clustern."""

from datetime import datetime


# Reihenfolge in der Event-Typen im Bericht erwaehnt werden.
# Bildet einen narrativ sinnvollen Ablauf: Reconnaissance -> Injection -> Eskalation.
PHASE_ORDER = [
    "honeypot_triggered",
    "path_traversal",
    "bad_upload",
    "xss",
    "sql_injection",
    "rate_limit",
    "failed_login",
    "brute_force",
    "multi_vector",
    "ml_detected_attack",
]

# Lesbare Beschreibung pro Event-Typ
PHASE_DESCRIPTIONS = {
    "honeypot_triggered": "Reconnaissance über Honeypot-Pfad",
    "path_traversal":     "Path-Traversal-Versuch im Dateisystem",
    "bad_upload":         "Upload einer blockierten Datei",
    "xss":                "Cross-Site-Scripting-Versuch",
    "sql_injection":      "SQL-Injection im Eingabefeld",
    "rate_limit":         "Auffaellig hohe Requestrate (Rate-Limit ausgeloest)",
    "failed_login":       "Fehlgeschlagene Login-Versuche",
    "brute_force":        "Brute-Force-Angriff auf Login",
    "multi_vector":       "Mehrstufiger Multi-Vector-Angriff",
    "ml_detected_attack": "Anomalie durch ML-Detektor erkannt",
}


def _format_time(dt: datetime) -> str:
    # Gibt die Uhrzeit als lesbaren String zurueck (HH:MM)
    return dt.strftime("%H:%M")

    # Gibt Datum und Uhrzeit zurueck (DD.MM.YYYY HH:MM)
def _format_date(dt: datetime) -> str:
    return dt.strftime("%d.%m.%Y %H:%M")

    # Sortiert die vorhandenen Event-Typen nach PHASE_ORDER und gibt lesbare Beschreibungen zurueck. Unbekannte Typen werden generisch angehaengt
def _build_phase_list(event_types: list[str]) -> list[str]:    
    known = [t for t in PHASE_ORDER if t in event_types]
    unknown = [t for t in event_types if t not in PHASE_ORDER]

    ordered = known + unknown
    return [PHASE_DESCRIPTIONS.get(t, f"Unbekanntes Event ({t})") for t in ordered]

    # Generiert einen lesbaren Vorfallbericht aus einem Attack-Cluster-Dict.
    # Erwartet die Felder die group_events_into_attacks() zurueckgibt:
    # source_ip, start_time, end_time, event_types, classification,
    # severity, risk_score, event_count.
    # Gibt einen Plaintext-Bericht zurueck.
def generate_narrative(cluster: dict) -> str:
    ip            = cluster["source_ip"]
    start         = cluster["start_time"]
    end           = cluster["end_time"]
    event_types   = cluster["event_types"]
    classification = cluster["classification"]
    severity      = cluster["severity"]
    risk_score    = cluster["risk_score"]
    event_count   = cluster["event_count"]

    # Einleitung: Zeitraum und IP
    same_day = start.date() == end.date()
    if same_day:
        time_range = f"Zwischen {_format_time(start)} und {_format_time(end)} Uhr am {_format_date(start).split()[0]}"
    else:
        time_range = f"Zwischen {_format_date(start)} und {_format_date(end)}"

    intro = f"{time_range} führte {ip} einen Angriff durch ({event_count} Events)."

    # Angriffsphasen als geordnete Liste aufbauen
    phases = _build_phase_list(event_types)
    if len(phases) == 1:
        phases_text = f"Erkannte Angriffsphase: {phases[0]}."
    else:
        # Erste Phase als Start, letzte als Eskalation kennzeichnen
        steps = ", dann ".join(phases[:-1])
        phases_text = f"Ablauf: zuerst {steps}, eskaliert zu {phases[-1]}."

    # Klassifikation und Severity
    meta = f"Klassifikation: {classification} – Severity: {severity}."

    # Abschluss: Risiko-Score
    score_text = f"Risiko-Score: {risk_score}/100."

    return "\n".join([intro, phases_text, meta, score_text])
