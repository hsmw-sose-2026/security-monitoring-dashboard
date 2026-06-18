"""Discord Webhook Benachrichtigungen fuer kritische Alerts."""

import os
import httpx

from app.models import Alert

# URL aus Umgebungsvariable lesen – wenn nicht gesetzt, passiert nichts
DISCORD_WEBHOOK_URL = os.getenv("DISCORD_WEBHOOK_URL")

# Schickt eine Discord-Nachricht wenn der Alert critical ist.
# Wenn DISCORD_WEBHOOK_URL nicht gesetzt ist, wird still zurueckgekehrt.
# Fehler beim Senden werden abgefangen und geloggt, werfen aber keine Exception.
def send_alert_webhook(alert: Alert) -> None:

    if not DISCORD_WEBHOOK_URL:
        return

    if alert.severity != "critical":
        return

    # Discord erwartet ein JSON-Objekt mit einem "content"-Feld
    payload = {
        "content": (
            f"🚨 **Security Alert** – `{alert.alert_type}`\n"
            f"**Severity:** {alert.severity}\n"
            f"**IP:** {alert.source_ip}\n"
            f"**Meldung:** {alert.message}"
        )
    }

    try:
        response = httpx.post(DISCORD_WEBHOOK_URL, json=payload, timeout=5)
        response.raise_for_status()
    except Exception as e:
        # Fehler beim Senden sollen den normalen Programmfluss nicht unterbrechen
        print(f"[WEBHOOK] Fehler beim Senden der Discord-Nachricht: {e}")
