"""Rate-limit anomaly detector."""

# TODO(Jannis): Einfache Rate-Limit-Erkennung bauen.
# Ziel: Requests pro IP in einem 1-Minuten-Fenster zaehlen und ungewoehnlich viele
# Requests als rate_limit melden.
# Fertig, wenn mehr als 50 Requests pro IP in 1 Minute ein rate_limit-Event oder Alert erzeugen.



"""Rate-limit anomaly detector."""

from datetime import datetime, timedelta, timezone
from collections import defaultdict

print("[RATE LIMIT] Detector geladen")

# In-Memory Speicher pro IP
request_history: dict[str, list[datetime]] = defaultdict(list)

RATE_LIMIT_THRESHOLD = 50      # max. 50 requests
RATE_LIMIT_WINDOW = 60         # zeit in sekunden


def detect_rate_limit(context) -> dict | None:
    """Rate Limit Erkennung - gibt Details zurück oder None"""
    ip = getattr(context, 'client_ip', 'unknown')
    now = datetime.now(timezone.utc)

    # entfernt alte einträge, nur aktuelles Zeitfenster behalten
    cutoff = now - timedelta(seconds=RATE_LIMIT_WINDOW)
    request_history[ip] = [ts for ts in request_history[ip] if ts > cutoff]

    # Aktuellen Request zur IP-Historie hinzufügen
    request_history[ip].append(now)

    count = len(request_history[ip])

    if count >= RATE_LIMIT_THRESHOLD:
        # rückgabe rate limit
        print(f"ALERT [Rate Limit] ({count} Requests von {ip} in {RATE_LIMIT_WINDOW}s)")
        return {
            "count": count,
            "ip": ip,
            "threshold": RATE_LIMIT_THRESHOLD,
            "window": RATE_LIMIT_WINDOW
        }
    
    # Ausgabe aller 10 Requests
    if count % 10 == 0:
        print(f"{count} Requests von {ip} in den letzten {RATE_LIMIT_WINDOW}s")
    
    return None