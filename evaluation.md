# Evaluation des Security-Monitoring-Prototyps

Stand: 07.06.2026

## Ziel der Evaluation

Ziel der Evaluation ist zu pruefen, ob der entwickelte Prototyp die zentrale Demo-Kette erfuellt:

> Angriff oder auffaellige Aktion auf der Webanwendung -> Erkennung im Backend -> Speicherung als SecurityEvent/Alert -> Darstellung im Dashboard.

Zusaetzlich wird geprueft, ob die Umsetzung zur urspruenglichen Projektaufgabe passt und welche Grenzen der aktuelle Prototyp noch hat.

## Getesteter Stand

- Branch: `integration-test`
- Datum: 07.06.2026
- Backend: FastAPI + SQLModel + SQLite
- Frontend: Next.js + React + TypeScript
- Testart:
  - Backend-Smoke-Tests ueber FastAPI `TestClient`
  - Frontend-Production-Build
  - Browser-E2E-Test mit Chromium fuer die Rules-UI
  - Manuelle/API-nahe Angriffsszenarien

Hinweis: Die Testserver wurden nach der Pruefung wieder gestoppt. Es wurde nichts gepusht.

## Durchgefuehrte technische Checks

### 1. Backend-Compile

Ausgefuehrt:

```bash
cd Backend
python -m compileall app
```

Ergebnis: Erfolgreich. Die Backend-Dateien konnten kompiliert werden.

### 2. Backend-Integrationstest

Gepruefte Punkte:

| Bereich | Ergebnis |
| --- | --- |
| `GET /health` | OK |
| Login mit `admin/admin123` | OK |
| Dashboard ohne Token blockiert | OK, `401` |
| Dashboard mit normalem User blockiert | OK, `403` |
| Dashboard mit Admin-Token | OK |
| Rules-API ohne Token blockiert | OK, `401` |
| Rules-API mit normalem User blockiert | OK, `403` |
| Rules-API mit Admin-Token | OK |
| `/dashboard/events` mit `limit`/`offset` | OK |
| Ungueltiger `limit`-Wert | OK, `422` |
| `/dashboard/alerts` | OK |
| `/dashboard/attacks` | OK |
| `/dashboard/stats` | OK |
| `POST /contact` | OK |
| `GET /contact` | OK |
| `GET /search` | OK |
| `POST /upload` mit gefaehrlicher Datei | OK |
| `GET /upload` | OK |

### 3. Angriffsszenarien

| Angriff / Auffaelligkeit | Test | Erwartung | Ergebnis |
| --- | --- | --- | --- |
| XSS | `<script>alert(1)</script>` in Suche/Kontakt | Event `xss` | OK |
| Path Traversal | `../../etc/passwd` | Event `path_traversal` | OK |
| Bad Upload | Upload einer `.exe` Datei | Event `bad_upload`, Upload abgelehnt/quarantaenisiert | OK |
| Failed Login | Mehrere falsche Login-Versuche | Events `failed_login` | OK |
| Brute Force | Mehr als 5 falsche Logins im Zeitfenster | Alert `brute_force`, Severity `critical` | OK |
| Multi-Vector | Verschiedene Event-Typen gleicher IP in kurzem Zeitraum | Alert `multi_vector` | OK |
| Rate Limit | Viele Requests in kurzem Zeitraum | Event `rate_limit` ab Schwellwert | Grundlogik vorhanden |

### 4. Rules-Backend

Gepruefte Punkte:

| Aktion | Ergebnis |
| --- | --- |
| `GET /rules` | OK |
| Regelklasse anlegen | OK |
| Regel anlegen | OK |
| Neue Regel greift direkt ohne Server-Neustart | OK |
| Angriff mit neuem Pattern erzeugt Event | OK |
| Regel loeschen | OK |
| Geloeschte Regel greift danach nicht mehr | OK |
| Regelklasse loeschen | OK |

Wichtiger Testfall:

Eine neue Regel wurde zur Laufzeit erstellt. Danach wurde ein Request mit genau diesem neuen Pattern ausgefuehrt. Das Backend hat daraus direkt ein neues SecurityEvent erzeugt. Damit ist bestaetigt, dass der Rules-Live-Reload funktioniert.

### 5. Frontend-Build

Ausgefuehrt:

```bash
cd Frontend
bun run build
```

Ergebnis: Erfolgreich.

Gebaut wurden unter anderem:

- `/`
- `/login`
- `/contact`
- `/upload`
- `/search`
- `/dashboard`
- `/dashboard/events`
- `/dashboard/alerts`
- `/dashboard/rules`
- `/dashboard/stats`

### 6. Frontend-E2E-Test Rules-UI

Geprueft wurde nicht nur das Backend, sondern die echte Bedienung im Frontend ueber Chromium:

1. Admin-Token erzeugt.
2. Token im Browser in `localStorage` gesetzt.
3. `/dashboard/rules` geoeffnet; die Rules-UI sendet den Admin-Token an die geschuetzte Rules-API.
4. Geprueft, dass echte Backend-Regeln geladen werden.
5. Neue Regelklasse ueber die UI erstellt.
6. Neue Regel ueber die UI erstellt.
7. Angriff mit dem neuen Pattern ausgeloest.
8. Geprueft, dass ein neues Event im Dashboard/API vorhanden ist.
9. Regel ueber die UI geloescht.
10. Regelklasse ueber die UI geloescht.
11. Geprueft, dass keine temporaere Regeldatei uebrig bleibt.

Ergebnis:

```text
Rules page loaded from backend
Class created through frontend UI
Rule created through frontend UI
New frontend-created rule produced dashboard event
Rule deleted through frontend UI
Class deleted through frontend UI
FRONTEND RULES E2E OK
```

## Anforderungsabgleich zur Originalaufgabe

### Originalanforderung: Security-Monitoring-System als Prototyp

> In diesem Projekt soll ein Prototyp fuer ein Security-Monitoring-System entwickelt werden, das sicherheitsrelevante Ereignisse einer Webanwendung erfasst, analysiert und visualisiert.

Erfuellung: Erfuellt.

Der Prototyp besteht aus einer einfachen Firmenwebseite als Angriffsoberflaeche, einem FastAPI-Backend zur Ereignisverarbeitung und einem Dashboard zur Visualisierung.

### Typische Vorfaelle erkennen

Gefordert waren unter anderem:

- fehlgeschlagene Login-Versuche
- verdaechtige Request-Muster
- Rechteverletzungen oder ungewoehnliche Zugriffe
- automatisierte Erkennung und Dashboard-Aufbereitung

Umsetzung:

| Vorfall / Muster | Umsetzung |
| --- | --- |
| Fehlgeschlagene Login-Versuche | `failed_login` Events im Auth-Endpoint |
| Brute Force | Correlation-Regel erzeugt `brute_force` Alert |
| SQL Injection | JSON-basierte Pattern-Regeln |
| XSS | JSON-basierte Pattern-Regeln |
| Path Traversal / ungewoehnliche Zugriffe | JSON-basierte Pattern-Regeln |
| Bad Upload | Upload-Service + Extension-Regeln |
| Rate Limit | In-Memory-Detector pro IP |
| Multi-Vector-Angriff | Correlation-Regel ueber mehrere Event-Typen |

Rechteverletzungen im engeren Sinn sind nur teilweise umgesetzt. Der Dashboard-Bereich ist per JWT geschuetzt, aber es gibt keine eigene Detection-Kategorie wie `permission_violation`.

### Webanwendung mit Logging-Komponente

Erfuellung: Erfuellt.

Die Webanwendung bietet Login, Kontakt, Upload und Suche als Angriffsoberflaechen. Sicherheitsrelevante Ereignisse werden strukturiert als `SecurityEvent` gespeichert. Alerts werden zusaetzlich als `Alert` gespeichert.

### Strukturierte Erfassung und Speicherung

Erfuellung: Erfuellt.

SecurityEvents enthalten:

- Zeitstempel
- Event-Typ
- Source-IP
- Pfad
- Detail
- Severity

Alerts enthalten:

- Zeitstempel
- Alert-Typ
- Source-IP
- Message
- Severity

### Auswertung ueber definierte Regeln

Erfuellung: Erfuellt.

Die Erkennung nutzt:

- JSON-Regeln fuer Pattern-Erkennung
- Spezialdetektoren fuer Rate Limit und Bad Upload
- Correlation-Regeln fuer Brute Force und Multi-Vector
- Rules-API zur Verwaltung von Pattern-Regeln
- Live-Reload, damit neue Regeln sofort aktiv sind

### Darstellung in einer Oberflaeche

Erfuellung: Erfuellt.

Das Dashboard zeigt:

- Events
- Alerts
- gruppierte Attacks
- Stats/KPI-Karten
- Charts
- Rules-Verwaltung

Administratoren koennen dadurch nachvollziehen, welche Requests auffaellig waren und welche Alerts entstanden sind.

### Optionale Benachrichtigungen oder Anomalie-Erkennung

Erfuellung: Teilweise / bewusst nicht umgesetzt.

Es gibt keine externen Benachrichtigungen wie E-Mail, Slack oder Webhooks. Eine einfache Form von Anomalie-Erkennung ist ueber Rate-Limit und Multi-Vector-Correlation vorhanden, aber kein Machine-Learning-Ansatz.

## Abgleich mit Lernzielen

| Lernziel | Bewertung |
| --- | --- |
| Verstaendnis typischer Angriffsmuster | Erfuellt durch SQLi, XSS, Path Traversal, Brute Force, Bad Upload, Rate Limit |
| Logging- und Monitoring-Komponenten entwickeln | Erfuellt durch Middleware, EventLogger, Repositories und Correlation |
| Backend mit interaktiver Oberflaeche verknuepfen | Erfuellt durch Dashboard, Auth, Search/Contact/Upload und Rules-UI |
| Projektmanagement ueber Code-Repository | Erfuellt durch Branches, Integration-Branch, Commit-History und Doku |

## Abgleich mit Bewertungskriterien

### Qualitaet und Vollstaendigkeit der Sicherheitsereignisse

Staerken:

- Mehrere typische Angriffsmuster werden erkannt.
- Events werden strukturiert gespeichert.
- Request-ID erleichtert Nachvollziehbarkeit.
- Events koennen ueber Dashboard/API abgerufen werden.

Grenzen:

- Detection ist regelbasiert und erkennt nur bekannte Muster.
- Rate-Limit-Speicher ist nur In-Memory und nicht persistent.
- Es gibt keine echte Rechteverletzungs-Detection als eigenen Event-Typ.

### Nachvollziehbarkeit und Nutzbarkeit der Visualisierung

Staerken:

- Dashboard zeigt Events, Alerts, Attacks und Stats.
- Attack-Details sind sichtbar.
- Filter und Zeitraeume im Dashboard unterstuetzen die Analyse.
- Rules-UI erlaubt Anpassung von Regeln.

Grenzen:

- UI ist ein Prototyp und nicht vollstaendig produktionsreif.
- Einige Formatierungsregeln von Biome sind noch nicht sauber.
- Mobile Ansicht ist nicht optimiert.

### Robustheit der Erkennungslogik

Staerken:

- Typische Demo-Payloads werden erkannt.
- Neue Rules greifen direkt ohne Server-Neustart.
- Bad Upload wird nicht nur geloggt, sondern auch als rejected/quarantine behandelt.
- Correlation erzeugt Alerts aus mehreren Events.

Grenzen:

- Regex-Erkennung kann durch Obfuskation oder ungewoehnliches Encoding umgangen werden.
- Rate Limit zaehlt pro Prozess und geht bei Neustart verloren.
- SQLite ist fuer den Prototyp ausreichend, aber nicht fuer produktive Last.
- Keine zentrale dedizierte Test-Suite im Repo, sondern vor allem manuelle und ad-hoc Tests.

### Dokumentation und Strukturierung des Quellcodes

Staerken:

- Backend ist modular in Routen, Repositories, Services, Schemas und Security-Komponenten aufgeteilt.
- API- und manuelle Testbeispiele liegen im Repo.
- Frontend-Doku und UI-Checkliste sind vorhanden.
- Git-History zeigt nachvollziehbare Arbeitsschritte.

Grenzen:

- Einige alte TODO-Kommentare und historische Dateien koennen noch auf fruehere Planung verweisen.
- Die Dokumentation ist noch nicht als finale Abschlussdokumentation ausgearbeitet.

## Bekannte Grenzen und kleinere Fehler

- `bun run lint` meldet noch Biome-Formatierungsprobleme. Der Production-Build und TypeScript laufen aber erfolgreich durch.
- Die Detection ist bewusst regelbasiert und nicht vollstaendig gegen Umgehungstechniken abgesichert.
- Rate-Limit ist In-Memory und nicht persistent.
- SQLite ist nur fuer den lokalen Prototyp geeignet.
- Es gibt keine externen Benachrichtigungen.
- Es gibt keine echte Rollen-/Rechteverletzungs-Erkennung als SecurityEvent-Kategorie.
- Uploads werden fuer Demo-Zwecke lokal gespeichert; produktive Dateispeicherung/Scanning ist nicht umgesetzt.
- Mobile/responsive Optimierung ist nicht Schwerpunkt des Prototyps.
- Manche Demo-Buttons fuellen Payloads nur ein; der eigentliche Request muss teilweise noch durch Absenden/Enter ausgeloest werden.
- Die lokale Testdatenbank kann nach Tests viele Demo-Events enthalten.

## Gesamtbewertung

Der aktuelle Stand erfuellt die Kernanforderung des Projekts: Ein Angriff oder auffaelliges Verhalten auf einer einfachen Webanwendung wird erfasst, analysiert, gespeichert und im Dashboard sichtbar gemacht.

Der Prototyp ist damit fuer eine Live-Demo geeignet. Besonders wichtig ist, dass nicht nur einzelne Backend-Endpunkte funktionieren, sondern auch der End-to-End-Flow mit Frontend, Backend, Detection und Dashboard getestet wurde.

Fuer eine produktive Weiterentwicklung waeren vor allem folgende Punkte sinnvoll:

- automatisierte Tests fest ins Repo aufnehmen
- Lint-/Formatierungsprobleme bereinigen
- Rate-Limit persistent oder verteilt speichern
- Rechteverletzungen explizit als Event-Typ modellieren
- Dokumentation zur finalen Abgabe ausbauen
- optionale Benachrichtigungen ergaenzen
