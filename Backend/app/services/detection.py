# Erkennungslogik ueber mehrere Requests hinweg.
# Die Middleware sieht nur den aktuellen Request und schreibt Events in die DB,
# hier werden die Events dann zu Angriffen zusammengefuehrt und korreliert.
# Erstmal nur Gruppierung und Brute-Force, mehr kommt spaeter.


from datetime import datetime, timedelta, timezone
from sqlmodel import Session, select

from app.models import SecurityEvent, Alert


# Alle Schwellenwerte oben gebuendelt. Wenn wir tunen wollen, nur hier aendern.
ATTACK_GAP_MINUTES = 15        # Pause zwischen zwei Events, ab der wir einen neuen Angriff zaehlen
BRUTE_FORCE_WINDOW = 60        # Sekunden: Zeitfenster fuer Brute-Force-Erkennung
BRUTE_FORCE_THRESHOLD = 5      # Anzahl failed logins im Fenster bis wir Alarm schlagen


# --- Events zu Angriffen gruppieren ---
# Ein "Angriff" = mehrere Events der gleichen IP, zeitlich nah beieinander.

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


# --- Korrelations-Regeln ---
# Werden von der Middleware nach jedem neuen Event aufgerufen.
# Jede Regel gibt entweder einen Alert-dict zurueck oder None.

def detect_brute_force(session: Session, source_ip: str) -> dict | None:
    # Nur Events anschauen die neuer sind als der Cutoff
    cutoff = datetime.now(timezone.utc) - timedelta(seconds=BRUTE_FORCE_WINDOW)
    statement = select(SecurityEvent).where(
        SecurityEvent.source_ip == source_ip,
        SecurityEvent.event_type == "failed_login",
        SecurityEvent.timestamp >= cutoff,
    )
    fails = session.exec(statement).all()

    if len(fails) >= BRUTE_FORCE_THRESHOLD:
        return {
            "alert_type": "brute_force",
            "severity": "high",
            "source_ip": source_ip,
            "message": f"{len(fails)} failed logins von {source_ip} in {BRUTE_FORCE_WINDOW}s",
        }
    return None


# Neue Regel dazu = Funktion schreiben und hier eintragen.
CORRELATION_RULES = [
    detect_brute_force,
]


def correlate(session: Session, source_ip: str) -> list[Alert]:
    created = []

    for rule in CORRELATION_RULES:
        result = rule(session, source_ip)
        if result is None:
            continue  # Regel hat nix gefunden, naechste

        # Duplicate-Check: gleichen Alert nicht mehrfach in 5 Min speichern,
        # sonst spammt das bei jedem neuen Event denselben Alarm.
        cutoff = datetime.now(timezone.utc) - timedelta(minutes=5)
        existing = session.exec(
            select(Alert).where(
                Alert.source_ip == result["source_ip"],
                Alert.alert_type == result["alert_type"],
                Alert.timestamp >= cutoff,
            )
        ).first()
        if existing:
            continue

        # Neuen Alert in die DB schreiben
        alert = Alert(
            alert_type=result["alert_type"],
            source_ip=result["source_ip"],
            message=result["message"],
            severity=result["severity"],
        )
        session.add(alert)       # in die Session legen
        session.commit()         # tatsaechlich in die DB schreiben
        session.refresh(alert)   # von der DB vergebene ID zurueck ins Objekt lesen
        created.append(alert)

    return created
