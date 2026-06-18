"""Correlation rules that turn multiple events into alerts."""

# TODO(Jonas): Mehrere Events zu Alerts zusammenfassen.
# Ziel: Die bisherige Brute-Force-Regel aus detection.py hierher verschieben und spaeter
# weitere Alert-Regeln ergaenzen, z.B. Rate-Limit-Alert.
# Fertig, wenn bei mehr als 5 fehlgeschlagenen Logins pro IP in 1 Minute ein critical Alert entsteht.

from datetime import datetime, timedelta, timezone
from sqlmodel import Session, select

from app.models import SecurityEvent, Alert
from app.services.notifications.webhook import send_alert_webhook

# Schwellenwerte definieren

BRUTE_FORCE_WINDOW = 60        # Sekunden: Zeitfenster fuer Brute-Force-Erkennung
BRUTE_FORCE_THRESHOLD = 5       # Failed login Anzahl um als Bruteforce zu gelten
MULTI_VECTOR_WINDOW_MINUTES = 15
MULTI_VECTOR_MIN_EVENT_TYPES = 2


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
            "severity": "critical",
            "source_ip": source_ip,
            "message": f"{len(fails)} failed logins von {source_ip} in {BRUTE_FORCE_WINDOW}s",
        }
    return None

def detect_multi_vector(session: Session, source_ip: str) -> dict | None:
    cutoff = datetime.now(timezone.utc) - timedelta(minutes=MULTI_VECTOR_WINDOW_MINUTES)

    statement = (
        select(SecurityEvent)
        .where(
            SecurityEvent.source_ip == source_ip,
            SecurityEvent.timestamp >= cutoff,
        )
        .order_by(SecurityEvent.timestamp)
    )
    events = session.exec(statement).all()

    if not events:
        return None

    event_types = {event.event_type for event in events}

    #Reine Login Fehler sind Brute Force, aber noch kein Multi Vector Angriff
    if event_types == {"failed_login"}:
        return None

    if len(event_types) < MULTI_VECTOR_MIN_EVENT_TYPES:
        return None

    sorted_event_types = sorted(event_types)
    affected_paths = sorted({event.path for event in events if event.path})[:3]
    message = (
        f"Multi-Vector-Angriff von {source_ip}: "
        f"{len(events)} Events in {MULTI_VECTOR_WINDOW_MINUTES} Minuten, "
        f"Typen: {', '.join(sorted_event_types)}"
    )

    if affected_paths:
        message += f", Pfade: {', '.join(affected_paths)}"

    return {
        "alert_type": "multi_vector",
        "severity": "high",
        "source_ip": source_ip,
        "message": message,
    }


# Neue Regel dazu = Funktion schreiben und hier eintragen.
# (Jannis) heißt wenn du neue Dinge wie rate limit erstellst einfach hier eintragen
CORRELATION_RULES = [
    detect_brute_force,
    detect_multi_vector,
]

def is_duplicate_alert(session: Session, source_ip: str, alert_type: str, minutes: int = 5) -> bool:
    # Duplicate-Check: gleichen Alert nicht mehrfach in 5 Min speichern,
    # sonst spammt das bei jedem neuen Event denselben Alarm.
    cutoff = datetime.now(timezone.utc) - timedelta(minutes=minutes)
    existing = session.exec(
        select(Alert).where(
            Alert.source_ip == source_ip,
            Alert.alert_type == alert_type,
            Alert.timestamp >= cutoff,
        )
    ).first()

    return existing is not None


def correlate(session: Session, source_ip: str) -> list[Alert]:
    created = []

    for rule in CORRELATION_RULES:
        result = rule(session, source_ip)
        if result is None:
            continue  # Regel hat nix gefunden, naechste

        if is_duplicate_alert(session, result["source_ip"], result["alert_type"]):
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
        send_alert_webhook(alert) # Webhook ausloesen, schickt Discord-Nachricht wenn severity == "critical"
        created.append(alert)

    return created