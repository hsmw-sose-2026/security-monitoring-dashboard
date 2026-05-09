# Aufgabenverteilung fuer 12h-Sprints

Stand: 01.05.2026

## Branches

Jeder behaelt seinen eigenen Branch. Die neue Ordnerstruktur wird ueber `integration-test` verteilt.

```bash
git fetch origin
git switch <eigener-branch>
git merge origin/integration-test
```

## Sprint 1: 01.05. bis 11.05.

### Tim

**Bereich:** JSON-Regeln und Security-Middleware

**Dateien:** `rule_loader.py`, `request_context.py`, `pattern_detector.py`, `sqli.json`, `middleware/security.py`

**Ca. 12h Aufgabe:** JSON-Format fuer Erkennungsregeln festlegen, SQLi-Regeln aus der Middleware in `sqli.json` uebertragen, Rule-Loader und Pattern-Detector vorbereiten, Request-Daten einheitlich sammeln.

**Ergebnis:** SQLi-Erkennung ist als JSON-basierte Struktur vorbereitet.

### Jannis

**Bereich:** Neue Security-Detektoren

**Dateien:** `registry.py`, `xss.py`, `path_traversal.py`, `rate_limit.py`, `xss.json`, `path_traversal.json`, `attack_examples.md`

**Ca. 12h Aufgabe:** Detektor-Registry vorbereiten, XSS- und Path-Traversal-Regeln sammeln, passende Detektor-Dateien vorbereiten, Rate-Limit-Konzept umsetzen oder dokumentieren, Testangriffe dokumentieren.

**Ergebnis:** XSS, Path Traversal und Rate Limit haben eigene Dateien und konkrete Testbeispiele.

### Kevin

**Bereich:** Firmenseiten-Backend

**Dateien:** `routes/contact.py`, `routes/search.py`, `routes/upload.py`, `schemas/contact.py`, `schemas/search.py`, `schemas/upload.py`, `contact_message.py`, `uploaded_file.py`, `contact_repository.py`, `upload_repository.py`, `search_service.py`, `upload_service.py`, `api_examples.md`

**Ca. 12h Aufgabe:** Kontakt-, Such- und Upload-Backend fertig planen/umsetzen, Schemas anlegen, Kontakt-Datenmodell vorbereiten, Suchlogik auslagern, Upload-Service vorbereiten, API-Beispiele dokumentieren.

**Ergebnis:** Kontakt, Suche und Upload sind als echte Backend-Funktionen vorbereitet oder umgesetzt.

### Jonas

**Bereich:** Dashboard-Daten und Event-Pipeline

**Dateien:** `routes/dashboard.py`, `dashboard_service.py`, `attack_grouping.py`, `correlation.py`, `event_repository.py`, `alert_repository.py`, `schemas/dashboard.py`

**Ca. 12h Aufgabe:** Event-/Alert-Repositories vorbereiten, Dashboard-Service fuer Stats bauen, Events heute, kritische Alerts, Events pro Stunde und Angriffstyp-Verteilung vorbereiten, Angriff-Gruppierung aus `detection.py` herausloesen.

**Ergebnis:** Dashboard-Daten bekommen eigene Services und Repositories.

### Niklas

**Bereich:** Dashboard-Frontend

**Dateien:** `dashboard/page.tsx`, `dashboard/events/page.tsx`, `dashboard/alerts/page.tsx`, `overview.tsx`, `dashboard.ts`

**Ca. 12h Aufgabe:** Dashboard mit echten Backend-Daten stabilisieren, Event-Log-Seite und Alert-Seite bauen/erweitern, Typen fuer Alerts/Stats ergaenzen, Demo mit echten Events testen.

**Ergebnis:** Dashboard zeigt echte Events und Alerts statt nur Dummy-Daten oder Coming-Soon-Seiten.

### Sophia

**Bereich:** Firmenwebseite und Demo-Doku

**Dateien:** `login/page.tsx`, `login/loginpage.tsx`, `contact/page.tsx`, `contact/contactpage.tsx`, `upload/page.tsx`, `upload/uploadpage.tsx`, `README.md`, `2026-05-11-demo-checklist.md`

**Ca. 12h Aufgabe:** Login, Kontakt und Upload ans Backend anbinden, Erfolg-/Fehlermeldungen anzeigen, README um lokalen Startablauf erweitern, Demo-Checkliste schreiben.

**Ergebnis:** Firmenwebseite ist als Angriffsfläche nutzbar und die Demo ist dokumentiert.

## Sprint 2: 12.05. bis 25.05.

Ziel: Die vorbereiteten Module werden verbunden. Demo-Kette: Angriff auf Firmenseite -> Event/Alert in DB -> Anzeige im Dashboard.

- **Tim:** Middleware komplett auf `request_context.py`, `registry.py` und `event_logger.py` umstellen. Demo: SQLi erzeugt weiter ein Event.
- **Jannis:** XSS, Path Traversal und Rate Limit fertigstellen und testen. Demo: `<script>` und `../etc/passwd` erzeugen Events.
- **Kevin:** Contact/Search/Upload in `main.py` einbinden, Kontakt speichern, Suche strukturieren, Bad Upload loggen. Demo: `.exe` erzeugt `bad_upload`.
- **Jonas:** `/dashboard/stats` fertigstellen, Brute-Force-Alert auf `critical` setzen, Attack-Gruppierung final auslagern. Demo: Backend liefert Stats fuer Karten/Charts.
- **Niklas:** Stats-Karten, Events, Alerts und einfache Chart-Daten im Dashboard anzeigen. Demo: Dashboard zeigt echte Daten.
- **Sophia:** End-to-End-Demo durchspielen, README und Demo-Checkliste finalisieren. Demo: Projekt kann anhand README gestartet und vorgefuehrt werden.

