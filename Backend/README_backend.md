# Backend - Security Monitoring Dashboard

## Beschreibung

Das Backend ist die zentrale API des Security-Monitoring-Dashboards. Es nimmt Requests der Demo-Firmenwebseite entgegen, speichert sicherheitsrelevante Events und stellt diese Daten fuer das Dashboard bereit.

Der aktuelle Stand ist als modularer FastAPI-Prototyp aufgebaut. Die wichtigsten Aufgaben des Backends sind:

- Login pruefen und fehlgeschlagene Logins als Security-Events speichern
- eingehende Requests ueber die Middleware auf Angriffsmuster pruefen
- Security-Events und Alerts in der Datenbank speichern
- Dashboard-Daten ueber API-Endpunkte bereitstellen
- Events zu Angriffen gruppieren und einfache Correlation-Regeln ausfuehren

---

## Aktueller Stand

### Authentifizierung

- `POST /auth/login`
- prueft Benutzername und Passwort gegen die Test-User in der Datenbank
- bei falschem Login wird ein `failed_login` Event erzeugt
- mehrere fehlgeschlagene Logins koennen einen Brute-Force-Alert ausloesen

### Security Middleware

- analysiert eingehende Requests
- nutzt Request-Context, Rule-Loader und Pattern-Detector
- erkannte Findings werden ueber den zentralen `event_logger` gespeichert
- SQL-Injection-Muster werden aktuell als Events geloggt

### Dashboard API

Das Dashboard bekommt seine Daten ueber eigene Endpunkte:

- `GET /dashboard/events?limit={limit}&offset={offset}`
- `GET /dashboard/alerts?limit={limit}&offset={offset}`
- `GET /dashboard/attacks`
- `GET /dashboard/stats`

Die Dashboard-Endpunkte sind durch den Token-Guard geschuetzt. `events` und `alerts` unterstuetzen `limit` und `offset`, damit das Backend nicht unbegrenzt alle Eintraege zurueckgibt.

Die Stats enthalten unter anderem:

- Events pro Stunde
- durchschnittliche Events pro Stunde
- Events heute
- Verteilung nach Event-Typ
- kritische Alerts
- Alerts heute
- Gesamtzahl der Alerts

### Event- und Alert-Pipeline

Die Event-Pipeline ist in mehrere Module aufgeteilt:

- `event_repository.py` speichert und liest Security-Events
- `alert_repository.py` speichert und liest Alerts
- `event_logger.py` erzeugt Events zentral und startet danach Correlation
- `correlation.py` prueft mehrere Events auf Alert-Regeln
- `attack_grouping.py` gruppiert Events fuer die Dashboard-Ansicht

---

## Projektstruktur Backend

```text
Backend
├── app
│   ├── api
│   │   └── router.py
│   ├── config
│   │   └── patterns.json
│   ├── demo
│   │   ├── demo_check.py
│   │   └── seed_attacks.py
│   ├── middleware
│   │   └── security.py
│   ├── models.py
│   ├── models
│   ├── repositories
│   │   └── ...
│   ├── routes
│   │   └── ...
│   ├── schemas
│   │   └── ...
│   └── services
│       ├── dashboard_service.py
│       ├── detection.py
│       └── security
│           ├── attack_grouping.py
│           ├── correlation.py
│           ├── event_logger.py
│           ├── rule_loader.py
│           ├── request_context.py
│           ├── detectors
│           └── rules
├── app/tests_manual
│   └── ...
├── uploads
│   └── ...
└── requirements.txt
```

---

## Wichtige Dateien

### `app/main.py`

Erstellt die FastAPI-App, richtet CORS ein, registriert Middleware und bindet die Router ein.

### `app/api/router.py`

Zentrale Stelle fuer Router-Registrierung. Aktuell sind stabile Router wie `auth` und `dashboard` eingebunden. Weitere Router koennen hier ergaenzt werden, sobald sie final sind.

### `app/middleware/security.py`

Prueft eingehende Requests auf auffaellige Muster und leitet erkannte Findings an den `event_logger` weiter.

### `app/services/security/event_logger.py`

Zentrale Stelle zum Speichern von Security-Events. Nach dem Speichern wird die Correlation gestartet.

### `app/services/security/correlation.py`

Enthaelt Regeln, die mehrere Events zusammen auswerten. Aktuell ist Brute Force als MVP-Regel vorhanden.

### `app/services/security/attack_grouping.py`

Gruppiert einzelne Security-Events nach IP und Zeitfenster zu Angriffen fuer die Dashboard-Ansicht.

### `app/services/dashboard_service.py`

Berechnet die Dashboard-Statistiken aus Events und Alerts.

### `app/repositories/`

Kapselt Datenbankzugriffe, damit Routen und Services nicht direkt SQL-Abfragen schreiben muessen.

---

## Starten des Backends

Im Ordner `Backend`:

```bash
source .venv/bin/activate
uvicorn app.main:app --reload
```

Backend laeuft danach standardmaessig unter:

```text
http://localhost:8000
```

Health-Check:

```text
http://localhost:8000/health
```

Swagger/OpenAPI-Doku:

```text
http://localhost:8000/docs
```

---

## Beispiel-Endpoints

```text
POST /auth/login
GET  /dashboard/events?limit=50&offset=0
GET  /dashboard/alerts?limit=50&offset=0
GET  /dashboard/attacks
GET  /dashboard/stats
```

Fuer geschuetzte Dashboard-Routen muss der vom Login gelieferte Bearer-Token im `Authorization`-Header mitgeschickt werden.

Beispiel Login:

```json
{
  "username": "admin",
  "password": "admin123"
}
```

---

## Genutzte Technologien

- Python
- FastAPI
- SQLModel
- SQLite
- Uvicorn
- Pydantic

---

## Naechste Schritte

- Contact/Search/Upload-Backend vollstaendig fertigstellen
- Rules-Management-API vorbereiten (`GET/POST/PATCH /rules`)
- weitere Detektoren anbinden (XSS, Path Traversal, Rate Limit, Upload-Checks)
- Correlation-Regeln erweitern
- End-to-End-Testfaelle dokumentieren