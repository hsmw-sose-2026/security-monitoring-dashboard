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
- eingehende Requests ueber die Middleware auf Angriffsmuster pruefen
- Security-Events und Alerts in der Datenbank speichern
- Dashboard-Daten ueber API-Endpunkte bereitstellen
- Events zu Angriffen gruppieren und einfache Correlation-Regeln ausfuehren

**Frontend:**

Die Website dient als Demo und Angriffsfläche von Attacken. Es gibt verschiedene Seiten mit unterschiedlichen Funktionen:

- die Login Seite ist die Haupt-Angriffsfläche, dabei wird das Eingabefeld von Benutzername und Passwort genutzt
- die Startseite als Darstellung einer normalen Firmen Website und Weiterleitung an die weiteren Funktionen
- ein Kontaktformular, mit dem ein Dummy-User eine Nachricht senden kann, welche im Backend gespeichert wird
- ein Datei-Upload, womit auch eine Datei ans Backend gesendet werden kann

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
│   ├── middleware
│   │   └── security.py
│   ├── models.py
│   ├── repositories
│   │   ├── event_repository.py
│   │   └── alert_repository.py
│   ├── routes
│   │   ├── auth.py
│   │   └── dashboard.py
│   ├── schemas
│   │   └── dashboard.py
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
├── database.db
└── requirements.txt
```

**Frontend:**

```
Frontend
│   favicon.ico
│   globals.css
│   layout.tsx
│   page.tsx
├───contact
│       contactpage.tsx
│       page.tsx
├───dashboard
│   │   class-override.tsx
│   │   globals.css
│   │   layout.tsx
│   │   page.tsx
│   ├───alerts
│   │       page.tsx
│   ├───components
│   │       ModalAdd.tsx
│   │       ModalEdit.tsx
│   ├───events
│   │       page.tsx
│   └───rules
│           page.tsx
│           rules.tsx
├───impressum
│       impressum.tsx
│       page.tsx
├───login
│       loginpage.tsx
│       page.tsx
└───upload
        page.tsx
        uploadpage.tsx

```

---

## Backend-Stand

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

- `GET /dashboard/events`
- `GET /dashboard/alerts`
- `GET /dashboard/attacks`
- `GET /dashboard/stats`

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

## Methoden und genutzte Tools

**Backend:**

- Python
- FastAPI
- SQLModel
- SQLite
- Uvicorn
- Pydantic

**Frontend:**

*Framework:*
- [Node.js](https://nodejs.org/)  
- [Next.js](https://nextjs.org/docs) 
- [React](https://react.dev/learn) 
- [TypeScript](https://www.typescriptlang.org/docs)

- *Styling:* [Tailwind CSS](https://tailwindcss.com)

**Versionsverwaltung:**

- Git + GitHub

---

## Starten

### Backend

```bash
cd Backend
source .venv/bin/activate
uvicorn app.main:app --reload
```

### Frontend

```bash
cd Frontend
bun install
bun run dev
```

---

## Naechste Schritte

- Contact/Search/Upload-Backend vollstaendig fertigstellen
- Rules-Management-API vorbereiten (`GET/POST/PATCH /rules`)
- Rules-UI im Dashboard vorbereiten
- weitere Detektoren anbinden (XSS, Path Traversal, Rate Limit, Upload-Checks)
- Correlation-Regeln erweitern
- End-to-End-Testfaelle dokumentieren