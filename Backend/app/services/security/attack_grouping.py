"""Group security events into attacks for the dashboard."""


from datetime import timedelta
from sqlmodel import Session, select

from app.models import SecurityEvent


# Schwellenwert definieren

ATTACK_GAP_MINUTES = 15        # Pause zwischen zwei Events, ab der wir einen neuen Angriff 
BRUTE_FORCE_THRESHOLD = 5      # Anzahl failed logins im Fenster bis wir Alarm schlagen

ATTACK_CLASSIFICATION_PRIORITY = [
    "sql_injection",
    "path_traversal",
    "bad_upload",
    "xss",
    "rate_limit",
    "ml_detected_attack",
]

SEVERITY_SCORE = {
    "low": 10,
    "medium": 35,
    "high": 65,
    "critical": 85,
}
CLASSIFICATION_BONUS = {
    "brute_force": 15,
    "multi_vector": 20,
    "sql_injection": 15,
    "path_traversal": 15,
    "bad_upload": 10,
    "xss": 10,
    "rate_limit": 5,
    "suspicious_login_activity": 5,
    "reconnaissance": 0,
    "ml_detected_attack": 12,
}

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
        severity = worst_severity(attack["events"])
        classification = classify_attack(attack["events"])

        attack["severity"] = severity
        attack["classification"] = classification
        attack["risk_score"] = calculate_risk_score(
            attack["events"],
            severity,
            classification,
        )

    # Neueste Angriffe zuerst, damit sie im Dashboard oben stehen
    attacks.sort(key=lambda a: a["start_time"], reverse=True)
    return attacks


def calculate_risk_score(
    events: list[SecurityEvent],
    severity: str,
    classification: str,
) -> int:
    base_score = SEVERITY_SCORE.get(severity, 10)
    classification_bonus = CLASSIFICATION_BONUS.get(classification, 0)
    volume_bonus = min(len(events) * 2, 15)

    return min(base_score + classification_bonus + volume_bonus, 100)


def worst_severity(events: list[SecurityEvent]) -> str:
    # Severity-Stufen von schlimm nach harmlos durchgehen,
    # die erste die wir finden ist die schlimmste.
    for level in ["critical", "high", "medium", "low"]:
        for event in events:
            if event.severity == level:
                return level
    return "low"


def classify_attack(events: list[SecurityEvent]) -> str:
    event_types = {event.event_type for event in events}

    for event_type in ATTACK_CLASSIFICATION_PRIORITY:
        if event_type in event_types:
            return event_type
    
    failed_logins = 0
    for event in events:
        if event.event_type == "failed_login":
            failed_logins += 1

    if failed_logins >= BRUTE_FORCE_THRESHOLD:
        return "brute_force"
    if failed_logins > 0:
        return "suspicious_login_activity"
    return "reconnaissance"