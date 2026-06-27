# Security Monitoring Dashboard

## Beschreibung

Das Projekt ist ein Prototyp fuer ein Security-Monitoring-System. Eine einfache Firmenwebseite dient als Demo-Anwendung und Angriffsfläche. Das Backend erkennt sicherheitsrelevante Ereignisse, speichert sie strukturiert und stellt sie dem Dashboard zur Verfuegung.

Ziel ist eine nachvollziehbare Pipeline:

```text
Request -> SecurityEvent -> Alert/Attack -> Dashboard
```

**Backend:**

Das Backend ist die zentrale API des Security-Monitoring-Dashboards. Es nimmt Requests der Demo-Firmenwebseite entgegen, speichert sicherheitsrelevante Events und stellt diese Daten fuer das Dashboard bereit.

Der aktuelle Stand ist als modularer FastAPI-Prototyp aufgebaut. Die wichtigsten Aufgaben des Backends sind:

- Login pruefen und fehlgeschlagene Logins als Security-Events speichern
- eingehende Requests ueber die Middleware auf Angriffsmuster pruefen (Regex-Regeln, ML-Klassifikator, Honeypot, Rate-Limit, Bad-Upload)
- Security-Events und Alerts in der Datenbank speichern
- Dashboard-Daten ueber API-Endpunkte bereitstellen, inkl. Forensic-Daten zu ML-Erkennungen
- Events zu Angriffen gruppieren und Correlation-Regeln ausfuehren (Brute Force, Honeypot-Reconnaissance, Path-Traversal, XSS, Rate-Limit, Multi-Vector)
- bei kritischen Alerts eine Discord-/Slack-Benachrichtigung ueber einen Webhook ausloesen
- aus gruppierten Angriffen lesbare Vorfallberichte (Incident Narratives) erzeugen

**Frontend:**

Die Website dient als Demo und Angriffsfläche von Attacken. Es gibt verschiedene Seiten mit unterschiedlichen Funktionen:

- die Login Seite ist die Haupt-Angriffsfläche, dabei wird das Eingabefeld von Benutzername und Passwort genutzt
- die Startseite als Darstellung einer normalen Firmen Website und Weiterleitung an die weiteren Funktionen
- ein Kontaktformular, mit dem ein Dummy-User eine Nachricht senden kann, welche im Backend gespeichert wird
- ein Datei-Upload, womit auch eine Datei ans Backend gesendet werden kann
- eine Such-Seite, deren Suchleiste im Header auf allen Seiten verfuegbar ist
- ein Admin-Dashboard mit Unterseiten fuer Angriffe, Events, Alerts, Statistiken, Regeln und Forensik

*Zweck:*
Mehrere Angriffsflächen durch verschiedene Eingabeflächen und Arten, welche überwacht werden, um Attacken festzustellen und darzustellen.

---

## Mitwirkende

- Tim -> Backend, Middleware, Rule-Loader, Pattern-Detection
- Jonas -> Backend, Dashboard-Daten, Event-/Alert-Pipeline
- Jannis -> Security-Detektoren, Testangriffe, Detection-Regeln
- Kevin -> Backend, Contact/Upload APIs
- Sophia -> Frontend, Firmenwebseite, Doku
- Niklas -> Frontend, Dashboard

## Projektstruktur

**Backend:**

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
```

**Frontend:**

```
Frontend
│   favicon.ico
│   globals.css
│   layout.tsx
│   page.tsx                        ← Startseite
├───contact
│       contactpage.tsx
│       page.tsx
├───dashboard
│   │   class-override.tsx
│   │   globals.css
│   │   layout.tsx                  ← Admin-Guard + Dark-Mode-Root
│   │   page.tsx                    ← Angriffs-Übersicht (Tabelle mit Filtern)
│   ├───alerts
│   │       page.tsx
│   ├───components
│   │       ModalAdd.tsx
│   │       ModalAddClass.tsx
│   │       ModalAddRule.tsx
│   │       ModalEdit.tsx
│   │       ModalForensicDetails.tsx
│   ├───events
│   │       page.tsx
│   ├───forensic                    ← Forensik-Seite zu ML-detektierten Payloads
│   │       ForensicEvent.tsx
│   │       page.tsx
│   ├───rules
│   │       page.tsx
│   │       rules.tsx               ← Regelklassen & Regeln
│   └───stats
│           page.tsx
├───hooks
│       useDarkMode.ts
├───impressum
│       impressum.tsx
│       page.tsx
├───login
│       loginpage.tsx
│       page.tsx
├───search
│       page.tsx
│       searchpage.tsx
└───upload
        page.tsx
        uploadpage.tsx

src/components                       ← Wiederverwendbare UI-Komponenten
├───SearchBar.tsx
├───dashboard/                       ← Dashboard-Widgets (event/alert/attack rows, charts, kpi cards, nav-bar)
└───ui/                              ← Generische UI-Primitives (button, card, input, dialog, ...)

src/lib/dashboard.ts                ← Typen & Fetch-Helper fürs Dashboard
src/types/dashboard.ts              ← Shared Typen
src/actions/getBackendHost.ts       ← Backend-URL Helper
```

---

## Backend-Stand

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
  - **Honeypot-Detector** erkennt Zugriffe auf DeCoay-Pfade (`/.env`, `/.git/config`, `/wp-admin`, ...) – critical severity
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

In `correlation.py` sind mehrere Regeln registriert, die aus Aeffentlichkeit von Events Alerts machen (in dieser Reihenfolge, spezifischste zuerst):

- `detect_brute_force` – viele `failed_login` Events einer IP in kurzem Zeitraum
- `detect_honeypot_alert` – Honeypot-Treffer (Reconnaissance)
- `detect_path_traversal_alert` – Path-Traversal-Versuche
- `detect_xss_alert` – XSS-Versuche
- `detect_rate_limit_alert` – Rate-Limit-Verstoesse
- `detect_multi_vector` – mehrere verschiedene Event-Typen derselben IP (zusammengesetzter Angriff)

Kritische Alerts (`severity=critical`) triggern zusaetzlich den Discord-Webhook (`services/notifications/webhook.py`), sofern `DISCORD_WEBHOOK_URL` gesetzt ist.

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

## Methoden und genutzte Tools

**Backend:**

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

**Frontend:**

*Framework:*

- [Bun](https://bun.sh/) (Runtime & Package Manager)
- [Next.js](https://nextjs.org/docs)
- [React](https://react.dev/learn)
- [TypeScript](https://www.typescriptlang.org/docs)

*Styling:*

- [Tailwind CSS](https://tailwindcss.com)
- Icons: [Tabler Icons](https://tabler.io/icons)

*Bibliotheken:*

- [Recharts](https://recharts.org/) – Diagramme (Stats-Seite)
- [Sonner](https://sonner.emilkowal.ski/) – Toast-Benachrichtigungen

**Versionsverwaltung:**

- Git + GitHub

---

## Starten

### Backend

```bash
cd Backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Optionale Umgebungsvariablen (z. B. in `Backend/.env`):

```text
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

### Frontend

```bash
cd Frontend
bun install
bun run dev
```

Die Backend-URL wird im Frontend ueber `Frontend/.env.local` gesetzt:

```text
NEXT_PUBLIC_API_URL=http://localhost:8000
```
