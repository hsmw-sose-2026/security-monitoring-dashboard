"""Demo Attacken fuer den Prototypen ueber die echte API.

Es werden absichtlich HTTP-Endpoints aufgerufen anstatt direkt in die Datenbank zu schreiben,
damit die Middleware, Detection und Correlation laufen.
"""

from __future__ import annotations

import os

import requests

BASE_URL = os.getenv("BACKEND_BASE_URL", "http://localhost:8000")
TIMEOUT_SECONDS = 5


def print_result(label: str, response: requests.Response) -> None:
    print(f"{label}: {response.status_code} {response.url}")
    if response.status_code >= 400:
        print(f"  Response: {response.text[:200]}")


def failed_logins() -> None:
    url = f"{BASE_URL}/auth/login"

    for index in range(6):
        response = requests.post(
            url,
            json={"username": "admin", "password": f"wrong{index}"},
            timeout=TIMEOUT_SECONDS,
        )
        print_result("failed_login", response)


def sql_injection() -> None:
    response = requests.get(
        f"{BASE_URL}/search",
        params={"q": "' OR 1=1 --"},
        timeout=TIMEOUT_SECONDS,
    )
    print_result("sql_injection", response)


def xss() -> None:
    response = requests.get(
        f"{BASE_URL}/search",
        params={"q": "<script>alert('xss')</script>"},
        timeout=TIMEOUT_SECONDS,
    )
    print_result("xss", response)


def path_traversal() -> None:
    response = requests.get(
        f"{BASE_URL}/search",
        params={"q": "../../etc/passwd"},
        timeout=TIMEOUT_SECONDS,
    )
    print_result("path_traversal", response)


def bad_upload() -> None:
    filename = "demo-malware.php"
    payload = b"<?php echo 'bad upload'; ?>"

    response = requests.post(
        f"{BASE_URL}/upload",
        files={"file": (filename, payload, "application/x-php")},
        timeout=TIMEOUT_SECONDS,
    )
    print_result("bad_upload", response)


def multi_vector() -> None:
    # Selbe source_ip fuer verschiedene Event-Typen in kurzem Zeitfenster
    sql_injection()
    xss()
    path_traversal()


def check_backend() -> None:
    response = requests.get(f"{BASE_URL}/health", timeout=TIMEOUT_SECONDS)
    response.raise_for_status()
    print_result("health", response)


def print_dashboard_summary() -> None:
    stats_response = requests.get(f"{BASE_URL}/dashboard/stats", timeout=TIMEOUT_SECONDS)
    alerts_response = requests.get(f"{BASE_URL}/dashboard/alerts", timeout=TIMEOUT_SECONDS)
    attacks_response = requests.get(f"{BASE_URL}/dashboard/attacks", timeout=TIMEOUT_SECONDS)

    print_result("dashboard_stats", stats_response)
    print_result("dashboard_alerts", alerts_response)
    print_result("dashboard_attacks", attacks_response)

    if not stats_response.ok:
        return

    stats = stats_response.json()
    alerts = alerts_response.json() if alerts_response.ok else []
    attacks = attacks_response.json() if attacks_response.ok else []

    print("\nDashboard-Zusammenfassung:")
    print(f"  Events heute: {stats.get('events_today', 0)}")
    print(f"  Alerts heute: {stats.get('alerts_today', 0)}")
    print(f"  Kritische Alerts: {stats.get('critical_alerts', 0)}")
    print(f"  Attack-Gruppen: {len(attacks)}")
    print(f"  Event-Typen: {stats.get('events_by_type', {})}")

def main() -> None:
    print(f"Senden von Demo-Attacken an {BASE_URL}")

    check_backend()

    failed_logins()
    bad_upload()
    multi_vector()
    # Restliche Attacken werden schon bei Multi-Vector aufgerufen

    print("\nAlle Attacken erfolgreich gesendet.\n\nDashboard-Zusammenfassung:\n")

    print_dashboard_summary()

if __name__ == "__main__":
    main()