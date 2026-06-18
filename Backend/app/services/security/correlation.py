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

HONEYPOT_WINDOW = 300          # Sekunden: Zeitfenster für Honeypot-Erkennung
HONEYPOT_THRESHOLD = 2         # Anzahl Honeypot-Treffer um als Reconnaissance zu gelten

PATH_TRAVERSAL_WINDOW = 300    # Sekunden: Zeitfenster für Path-Traversal-Erkennung
PATH_TRAVERSAL_THRESHOLD = 3    # Anzahl Path-Traversal-Versuche um als Attack zu gelten

RATE_LIMIT_WINDOW = 60         # Sekunden: Zeitfenster für Rate-Limit-Erkennung
RATE_LIMIT_THRESHOLD = 5        # Anzahl Rate-Limit-Events um als Alert zu gelten

XSS_WINDOW = 300               # Sekunden: Zeitfenster für XSS-Erkennung
XSS_THRESHOLD = 3              # Anzahl XSS-Versuche um als Attack zu gelten


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


def detect_path_traversal_alert(session: Session, source_ip: str) -> dict | None:
    """Aggregiert mehrere Path-Traversal-Events zu einem Alert."""
    cutoff = datetime.now(timezone.utc) - timedelta(seconds=PATH_TRAVERSAL_WINDOW)
    statement = select(SecurityEvent).where(
        SecurityEvent.source_ip == source_ip,
        SecurityEvent.event_type == "path_traversal",
        SecurityEvent.timestamp >= cutoff,
    )
    attempts = session.exec(statement).all()

    if len(attempts) >= PATH_TRAVERSAL_THRESHOLD:
        # Details der Versuche sammeln
        details = ", ".join([event.detail for event in attempts[:3]])  # Erste 3 Versuche
        return {
            "alert_type": "path_traversal",
            "severity": "high",
            "source_ip": source_ip,
            "message": f"{len(attempts)} Path-Traversal-Versuche von {source_ip} in {PATH_TRAVERSAL_WINDOW}s. Patterns: {details}",
        }
    return None


def detect_rate_limit_alert(session: Session, source_ip: str) -> dict | None:
    """Aggregiert mehrere Rate-Limit-Events zu einem Alert."""
    cutoff = datetime.now(timezone.utc) - timedelta(seconds=RATE_LIMIT_WINDOW)
    statement = select(SecurityEvent).where(
        SecurityEvent.source_ip == source_ip,
        SecurityEvent.event_type == "rate_limit",
        SecurityEvent.timestamp >= cutoff,
    )
    events = session.exec(statement).all()

    if len(events) >= RATE_LIMIT_THRESHOLD:
        return {
            "alert_type": "rate_limit",
            "severity": "medium",
            "source_ip": source_ip,
            "message": f"{len(events)} Rate-Limit-Verletzungen von {source_ip} in {RATE_LIMIT_WINDOW}s",
        }
    return None


def detect_xss_alert(session: Session, source_ip: str) -> dict | None:
    """Aggregiert mehrere XSS-Erkennung zu einem Alert."""
    cutoff = datetime.now(timezone.utc) - timedelta(seconds=XSS_WINDOW)
    statement = select(SecurityEvent).where(
        SecurityEvent.source_ip == source_ip,
        SecurityEvent.event_type == "xss",
        SecurityEvent.timestamp >= cutoff,
    )
    attempts = session.exec(statement).all()

    if len(attempts) >= XSS_THRESHOLD:
        # Details der Versuche sammeln
        details = ", ".join([event.detail for event in attempts[:3]])  # Erste 3 Versuche
        return {
            "alert_type": "xss",
            "severity": "high",
            "source_ip": source_ip,
            "message": f"{len(attempts)} XSS-Versuche von {source_ip} in {XSS_WINDOW}s. Patterns: {details}",
        }
    return None


def detect_honeypot_alert(session: Session, source_ip: str) -> dict | None:
    """Detects reconnaissance attempts through honeypot endpoint access.
    
    Multiple honeypot hits from the same IP in short time window indicate
    automated scanning/reconnaissance, not accidental discovery.
    """
    cutoff = datetime.now(timezone.utc) - timedelta(seconds=HONEYPOT_WINDOW)
    statement = select(SecurityEvent).where(
        SecurityEvent.source_ip == source_ip,
        SecurityEvent.event_type == "honeypot_triggered",
        SecurityEvent.timestamp >= cutoff,
    )
    hits = session.exec(statement).all()

    if len(hits) > HONEYPOT_THRESHOLD:
        # Honeypot Zugriffswege
        paths = [event.path for event in hits[:5]]  # ersten 5 Versuche
        details = ", ".join(paths)
        return {
            "alert_type": "reconnaissance",
            "severity": "critical",
            "source_ip": source_ip,
            "message": f"Reconnaissance attempt by {source_ip}: {len(hits)} honeypot hits in {HONEYPOT_WINDOW}s. Paths: {details}",
        }
    return None



# Reihenfolge: spezifische Regeln zuerst, breite Multi-Vector-Regel zuletzt,
# damit pro IP der passendste Alert zündet, bevor der Catch-All greift.
CORRELATION_RULES = [
    detect_brute_force,
    detect_honeypot_alert,
    detect_path_traversal_alert,
    detect_xss_alert,
    detect_rate_limit_alert,
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

