"""Rate-limit anomaly detector."""

from collections import defaultdict
from datetime import datetime, timedelta, timezone

from sqlmodel import Session

from app.database import engine
from app.services.security.event_logger import log_security_event

print("[RATE LIMIT] Detector geladen")

# In-Memory Speicher pro IP.
# Hinweis: Funktioniert nur im aktuellen Prozess / Worker. Bei mehreren Prozessen oder
# horizontaler Skalierung reicht dieser Ansatz nicht aus.
request_history: dict[str, list[datetime]] = defaultdict(list)

RATE_LIMIT_THRESHOLD = 50      # max. 50 requests
RATE_LIMIT_WINDOW = 60         # zeit in sekunden


def detect_rate_limit(context) -> dict | None:
    """Rate Limit Erkennung - gibt Details zurück oder None."""
    ip = getattr(context, "source_ip", "unknown")
    path = str(getattr(context, "path", ""))
    now = datetime.now(timezone.utc)

    # alte Einträge bereinigen, damit nur das aktuelle Fenster gezählt wird
    cutoff = now - timedelta(seconds=RATE_LIMIT_WINDOW)
    request_history[ip] = [ts for ts in request_history[ip] if ts > cutoff]

    # aktuellen Request hinzufügen
    request_history[ip].append(now)
    count = len(request_history[ip])

    if count >= RATE_LIMIT_THRESHOLD:
        print(f"ALERT [Rate Limit] ({count} Requests von {ip} in {RATE_LIMIT_WINDOW}s)")
        with Session(engine) as session:
            log_security_event(
                session,
                event_type="rate_limit",
                source_ip=ip,
                path=path,
                detail=f"{count} requests in {RATE_LIMIT_WINDOW}s",
                severity="medium",
            )
        return {
            "count": count,
            "ip": ip,
            "threshold": RATE_LIMIT_THRESHOLD,
            "window": RATE_LIMIT_WINDOW,
        }

    if count % 10 == 0:
        print(f"{count} Requests von {ip} in den letzten {RATE_LIMIT_WINDOW}s")

    return None