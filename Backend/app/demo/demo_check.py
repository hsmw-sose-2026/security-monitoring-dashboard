from urllib.error import HTTPError
from urllib.request import Request, urlopen
import json

BASE_URL = "http://localhost:8000"
USERNAME = "admin"
PASSWORD = "admin123"



def get_header(headers: dict, name: str) -> str:
    for key, value in headers.items():
        if key.lower() == name.lower():
            return value
    return "-"


def request_json(path: str, *, method: str = "GET", payload: dict | None = None, token: str | None = None):
    data = None
    headers = {}

    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"

    if token is not None:
        headers["Authorization"] = f"Bearer {token}"

    request = Request(f"{BASE_URL}{path}", data=data, headers=headers, method=method)
    try:
        with urlopen(request) as response:
            body = response.read().decode("utf-8")
            return response.status, dict(response.headers), json.loads(body)
    except HTTPError as error:
        body = error.read().decode("utf-8")
        return error.status, dict(error.headers), json.loads(body)

def login() -> str:
    status, headers, data = request_json(
        "/auth/login",
        method="POST",
        payload={"username": USERNAME, "password": PASSWORD},
    )

    print("\nLogin")
    print("POST /auth/login")
    print(f"Status: {status}")
    print(f"X-Request-ID: {get_header(headers, 'X-Request-ID')}")

    if status != 200:
        raise RuntimeError(f"Login fehlgeschlagen: {data}")

    return data["access_token"]


def print_check(name: str, path: str, token: str):
    status, headers, data = request_json(path, token=token)
    request_id = get_header(headers, "X-Request-ID")

    print(f"\n{name}")
    print(f"GET {path}")
    print(f"Status: {status}")
    print(f"X-Request-ID: {request_id}")

    if isinstance(data, list):
        print(f"Einträge: {len(data)}")
        if data:
            print(f"Erstes Eintrag: {data[0]}")
    else:
        print(f"Antwort: {data}")



def main():
    token = login()

    print_check("Events erste Seite", "/dashboard/events?limit=5&offset=0", token)
    print_check("Events zweite Seite", "/dashboard/events?limit=5&offset=5", token)
    print_check("Alerts", "/dashboard/alerts?limit=5&offset=0", token)
    print_check("Attacks", "/dashboard/attacks", token)
    print_check("Stats", "/dashboard/stats", token)
    print_check("Fehlerformat", "/dashboard/events?limit=1000", token)

if __name__ == "__main__":
    main()