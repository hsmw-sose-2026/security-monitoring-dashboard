# Backend - Security Monitoring Dashboard

## Beschreibung

Das Backend ist die zentrale API des Security-Monitoring-Dashboards. Es nimmt Requests der Demo-Firmenwebseite entgegen, speichert sicherheitsrelevante Events und stellt diese Daten fuer das Dashboard bereit.

Der aktuelle Stand ist als modularer FastAPI-Prototyp aufgebaut. Die wichtigsten Aufgaben des Backends sind:

- Login pruefen und fehlgeschlagene Logins als Security-Events speichern
- eingehende Requests ueber die Middleware auf Angriffsmuster pruefen (Regex-Regeln, ML-Klassifikator, Honeypot, Rate-Limit, Bad-Upload)
- Security-Events und Alerts in der Datenbank speichern
- Dashboard-Daten ueber API-Endpunkte bereitstellen, inkl. Forensic-Daten zu ML-Erkennungen
- Events zu Angriffen gruppieren und Correlation-Regeln ausfuehren (Brute Force, Honeypot-Reconnaissance, Path-Traversal, XSS, Rate-Limit, Multi-Vector)
- bei kritischen Alerts eine Discord-/Slack-Benachrichtigung ueber einen Webhook ausloesen
- aus gruppierten Angriffen lesbare Vorfallberichte (Incident Narratives) erzeugen

---

## Aktueller Stand

### Authentifizierung

- `POST /auth/login`
- prueft Benutzername und Passwort gegen die Test-User in der Datenbank
- bei falschem Login wird ein `failed_login` Event erzeugt
- mehrere fehlgeschlagene Logins koennen einen Brute-Force-Alert ausloesen

### Security Middleware

- analysiert eingehende Requests ueber eine zentrale FastAPI-Middleware
- baut aus jedem Request einen normalisierten `RequestContext` (Pfad, Query, Body, Headers)
- die `SecurityRegistry` fuehrt alle konfigurierten Detektoren aus:
  - **Pattern-Detector** mit regelbasierten JSON-Regeln (SQLi, XSS, Path-Traversal, Bad-Upload, ...)
  - **Honeypot-Detector** erkennt Zugriffe auf Decoy-Pfade (`/.env`, `/.git/config`, `/wp-admin`, ...) – critical severity
  - **Rate-Limit-Detector** erkennt auffaellig hohe Request-Raten einer IP
  - **Brute-Force-Detector** wertet failed-logins einer IP aus
  - **ML-Payload-Detector** klassifiziert obfuscate/encodete Payloads mit einem TF-IDF + Logistic-Regression-Modell (char-n-gram)
- erkannte Findings werden ueber den zentralen `event_logger` gespeichert
- bei ML-Detektion wird zusaetzlich der `forensic_analyzer` ausgefuehrt, der den Payload mehrstufig dekodiert (URL, HTML-Entities, Hex-Escapes, NFKC) und einen Nachvollzug liefert

### Dashboard API

Das Dashboard bekommt seine Daten ueber eigene Endpunkte:

- `GET /dashboard/events?limit={limit}&offset={offset}`
- `GET /dashboard/alerts?limit={limit}&offset={offset}`
- `GET /dashboard/attacks`
- `GET /dashboard/stats`
- `GET /dashboard/forensic` – Forensik-Daten zu ML-detektierten Events (Decode-Steps, Score, Original-Payload)

Die Dashboard-Endpunkte sind durch den Token-Guard geschuetzt. `events` und `alerts` unterstuetzen `limit` und `offset`, damit das Backend nicht unbegrenzt alle Eintraege zurueckgibt.

Die Stats enthalten unter anderem:

- Events pro Stunde
- durchschnittliche Events pro Stunde
- Events heute
- Verteilung nach Event-Typ
- kritische Alerts
- Alerts heute
- Gesamtzahl der Alerts

### Correlation und Alerts

In `correlation.py` sind mehrere Regeln registriert, die aus einer Reihe von Events Alerts machen (in dieser Reihenfolge, spezifischste zuerst):

- `detect_brute_force` – viele `failed_login` Events einer IP in kurzem Zeitraum
- `detect_honeypot_alert` – Honeypot-Treffer (Reconnaissance)
- `detect_path_traversal_alert` – Path-Traversal-Versuche
- `detect_xss_alert` – XSS-Versuche
- `detect_rate_limit_alert` – Rate-Limit-Verstoesse
- `detect_multi_vector` – mehrere verschiedene Event-Typen derselben IP (zusammengesetzter Angriff)

Kritische Alerts (`severity=critical`) triggern zusaetzlich den Discord-Webhook (`notifications/webhook.py`), sofern `DISCORD_WEBHOOK_URL` gesetzt ist.

### Incident Narrative

Aus gruppierten Angriffen (Attack-Clustern) erzeugt `incident_narrative.py` einen lesbaren Vorfallbericht. Die Event-Typen werden dabei in eine sinnvolle Phasenreihenfolge gebracht (Reconnaissance → Injection → Eskalation) und als Fließtext ausgegeben.

### Event- und Alert-Pipeline

Die Event-Pipeline ist in mehrere Module aufgeteilt:

- `event_repository.py` speichert und liest Security-Events
- `alert_repository.py` speichert und liest Alerts
- `event_logger.py` erzeugt Events zentral und startet danach Correlation
- `correlation.py` prueft mehrere Events auf Alert-Regeln und loest ggf. Webhooks aus
- `attack_grouping.py` gruppiert Events fuer die Dashboard-Ansicht
- `forensic_analyzer.py` erzeugt Decode-Schritte und Erklaerungen fuer ML-detektierte Payloads
- `incident_narrative.py` erzeugt aus Attack-Clustern lesbare Vorfallberichte

---

## Projektstruktur Backend

```text
Backend
├── app
│   ├── api
│   │   └── router.py
│   ├── demo
│   │   ├── demo_check.py
│   │   └── seed_attacks.py
│   ├── middleware
│   │   └── security.py
│   ├── models.py
│   ├── repositories
│   │   ├── alert_repository.py
│   │   ├── contact_repository.py
│   │   ├── event_repository.py
│   │   └── upload_repository.py
│   ├── routes
│   │   ├── auth.py
│   │   ├── contact.py
│   │   ├── dashboard.py
│   │   ├── rules.py
│   │   ├── search.py
│   │   └── upload.py
│   ├── schemas
│   │   ├── auth.py
│   │   ├── contact.py
│   │   ├── dashboard.py
│   │   ├── search.py
│   │   └── upload.py
│   ├── auth_utils.py
│   ├── main.py
│   └── services
│       ├── dashboard_service.py
│       ├── detection.py
│       ├── search_service.py
│       ├── upload_service.py
│       ├── notifications
│       │   └── webhook.py
│       └── security
│           ├── attack_grouping.py
│           ├── correlation.py
│           ├── event_logger.py
│           ├── forensic_analyzer.py
│           ├── incident_narrative.py
│           ├── registry.py
│           ├── rule_loader.py
│           ├── request_context.py
│           ├── detectors
│           │   ├── brute_force.py
│           │   ├── honeypot_detector.py
│           │   ├── ml_payload_detector.py
│           │   ├── pattern_detector.py
│           │   ├── payload_normalizer.py
│           │   └── rate_limit.py
│           ├── ml
│           │   ├── payload_model.joblib
│           │   ├── payload_vectorizer.joblib
│           │   └── ...
│           └── rules
│               ├── honeypot_paths.json
│               ├── sqli.json
│               ├── xss.json
│               ├── path_traversal.json
│               ├── upload_extensions.json
│               └── ...
├── app/tests_manual
│   └── ...
├── uploads
│   └── ...
└── requirements.txt
```

---

## Wichtige Dateien

### `app/main.py`

Erstellt die FastAPI-App, richtet CORS ein, registriert Middleware und bindet die Router ueber `register_routers()` ein.

### `app/api/router.py`

Zentrale Stelle fuer Router-Registrierung. Alle stabilen Router sind hier eingebunden: `auth`, `dashboard`, `contact`, `search`, `upload`, `rules`.

### `app/middleware/security.py`

Zentrale Middleware. Baut den `RequestContext`, ruft die `SecurityRegistry` auf und leitet erkannte Findings an den `event_logger` weiter. Bei ML-Detektion wird der `forensic_analyzer` zusaetzlich ausgefuehrt.

### `app/services/security/registry.py`

`SecurityRegistry` – fuehrt alle Detektoren aus (Pattern, Honeypot, Rate-Limit, Brute-Force, ML) und kombiniert deren Ergebnisse.

### `app/services/security/event_logger.py`

Zentrale Stelle zum Speichern von Security-Events. Nach dem Speichern wird die Correlation gestartet.

### `app/services/security/correlation.py`

Enthaelt alle Correlation-Regeln (Brute Force, Honeypot, Path-Traversal, XSS, Rate-Limit, Multi-Vector). Kritische Alerts loesen den Webhook aus.

### `app/services/security/attack_grouping.py`

Gruppiert einzelne Security-Events nach IP und Zeitfenster zu Angriffen fuer die Dashboard-Ansicht.

### `app/services/security/forensic_analyzer.py`

Baut mehrstufige Decode-Schritte fuer ML-detektierte Payloads (URL-, HTML-Entity-, Hex-Decode, NFKC-Normalisierung) und erzeugt einen nachvollziehbaren Forensik-Bericht.

### `app/services/security/incident_narrative.py`

Erzeugt aus Attack-Clustern lesbare Vorfallberichte in einer sinnvollen Phasenreihenfolge.

### `app/services/notifications/webhook.py`

Sendet kritische Alerts als Discord-Nachricht, wenn `DISCORD_WEBHOOK_URL` gesetzt ist.

### `app/services/security/ml/`

Enthaelt das trainierte ML-Modell (`payload_model.joblib`, `payload_vectorizer.joblib`) sowie Trainingsdaten und Skripte. Details zur Modellauswahl und -evaluation siehe `ml/ml_evaluation.md`.

### `app/services/dashboard_service.py`

Berechnet die Dashboard-Statistiken aus Events und Alerts.

### `app/repositories/`

Kapselt Datenbankzugriffe fuer Events, Alerts, Contacts und Uploads, damit Routen und Services nicht direkt SQL-Abfragen schreiben muessen.

---

## Starten des Backends

Im Ordner `Backend`:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
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

Optionale Umgebungsvariablen (z. B. in `Backend/.env`):

```text
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

---

## Beispiel-Endpoints

```text
POST /auth/login
GET  /dashboard/events?limit=50&offset=0
GET  /dashboard/alerts?limit=50&offset=0
GET  /dashboard/attacks
GET  /dashboard/stats
GET  /dashboard/forensic
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
- SQLModel / SQLAlchemy
- SQLite
- Uvicorn
- Pydantic / email-validator
- scikit-learn, joblib, pandas (ML-Payload-Klassifikator)
- httpx (Webhook-Versand)
- bcrypt, PyJWT (Passwort-Hashing, JWT-Tokens)
- pytest, pytest-asyncio, pytest-mock, pytest-cov (Tests)
