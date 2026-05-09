"""Group security events into attacks for the dashboard."""

<<<<<<< HEAD
# TODO(Jonas): Events fuer das Dashboard zu Angriffen gruppieren.
# Ziel: Die Funktion group_events_into_attacks aus detection.py hierher verschieben und
# so aufraeumen, dass Dashboard-Routen nur noch diesen Service aufrufen.
# Fertig, wenn /dashboard/attacks weiterhin dieselben Daten liefert wie vorher.
=======

from datetime import timedelta
from sqlmodel import Session, select

from app.models import SecurityEvent


# Schwellenwert definieren

ATTACK_GAP_MINUTES = 15        # Pause zwischen zwei Events, ab der wir einen neuen Angriff 
BRUTE_FORCE_THRESHOLD = 5      # Anzahl failed logins im Fenster bis wir Alarm schlagen


def group_events_into_attacks(session: Session) -> list[dict]:
    # Alle Events holen, sortiert nach IP und dann nach Zeit.
    # So liegen Events derselben IP direkt hintereinander in der Liste.
    statement = select(SecurityEvent).order_by(SecurityEvent.source_ip, SecurityEvent.timestamp)
    events = session.exec(statement).all()

    attacks = []       # Liste der fertigen Angriffe, kommt am Ende zurueck
    current = None     # Der Angriff an dem wir gerade noch "dranbauen"

    for event in events:
        # Passt dieses Event zum aktuell laufenden Angriff?
        belongs_to_current = False
        if current is not None and current["source_ip"] == event.source_ip:
            gap = event.timestamp - current["end_time"]
            if gap <= timedelta(minutes=ATTACK_GAP_MINUTES):
                belongs_to_current = True

        if belongs_to_current:
            # Event gehoert zum laufenden Angriff -> anhaengen, Endzeit updaten
            current["events"].append(event)
            current["end_time"] = event.timestamp
        else:
            # Neuer Angriff faengt an. Den alten erst abspeichern.
            if current is not None:
                attacks.append(current)
            current = {
                "source_ip": event.source_ip,
                "start_time": event.timestamp,
                "end_time": event.timestamp,
                "events": [event],
            }

    # Am Ende der Schleife ist noch ein Angriff "in Arbeit" -> auch abspeichern
    if current is not None:
        attacks.append(current)

    # Fuer jeden Angriff Zusatzinfos berechnen
    for attack in attacks:
        attack["event_count"] = len(attack["events"])
        # Set comprehension: baut eine Menge aller vorkommenden event_types,
        # sortiert sie dann in eine Liste.
        attack["event_types"] = sorted({e.event_type for e in attack["events"]})
        attack["severity"] = worst_severity(attack["events"])
        attack["classification"] = classify_attack(attack["events"])

    # Neueste Angriffe zuerst, damit sie im Dashboard oben stehen
    attacks.sort(key=lambda a: a["start_time"], reverse=True)
    return attacks


def worst_severity(events: list[SecurityEvent]) -> str:
    # Severity-Stufen von schlimm nach harmlos durchgehen,
    # die erste die wir finden ist die schlimmste.
    for level in ["critical", "high", "medium", "low"]:
        for event in events:
            if event.severity == level:
                return level
    return "low"


def classify_attack(events: list[SecurityEvent]) -> str:
    # Fuer jetzt kennen wir nur sql_injection als "echte" Angriffsart.
    # Spaeter kommen hier xss, path_traversal usw. dazu.
    has_sql_injection = any(e.event_type == "sql_injection" for e in events)

    failed_logins = 0
    for e in events:
        if e.event_type == "failed_login":
            failed_logins += 1

    if has_sql_injection:
        return "sql_injection"
    if failed_logins >= BRUTE_FORCE_THRESHOLD:
        return "brute_force"
    if failed_logins > 0:
        return "suspicious_login_activity"
    return "reconnaissance"
>>>>>>> origin/integration-test
