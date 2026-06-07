# Anforderungskatalog

Stand: 07.06.2026

## 1. Projektziel

Ziel des Projekts ist ein Prototyp fuer ein Security-Monitoring-System. Das System soll sicherheitsrelevante Ereignisse einer einfachen Webanwendung erfassen, analysieren, speichern und in einem Dashboard visualisieren.

Die Demo-Kette lautet:

> Angriff oder auffaellige Aktion auf der Webanwendung -> Erkennung im Backend -> Speicherung als SecurityEvent/Alert -> Darstellung im Dashboard.

Der Prototyp ist bewusst kein produktives Security-Produkt, sondern eine nachvollziehbare Umsetzung der wichtigsten Konzepte: Logging, Detection, Correlation, Dashboard und Evaluation.

## 2. Bezug zur Originalaufgabe

Die Originalaufgabe fordert:

- Aufbau oder Erweiterung einer einfachen Webanwendung mit Logging-Komponente
- strukturierte Erfassung sicherheitsrelevanter Ereignisse
- Auswertung ueber definierte Regeln
- Visualisierung der Ergebnisse in einer Oberflaeche fuer Administratoren
- Erkennung typischer Vorfaelle wie fehlgeschlagene Logins, verdaechtige Request-Muster, Rechteverletzungen oder ungewoehnliche Zugriffe
- optional Benachrichtigungen oder einfache Anomalie-Erkennung

Der aktuelle Prototyp erfuellt die Kernanforderungen. Rechteverletzungen werden nur teilweise abgedeckt: Das Dashboard ist per JWT geschuetzt, aber es gibt keinen eigenen Event-Typ `permission_violation`.

## 3. Systemueberblick

Das System besteht aus drei Hauptteilen:

| Komponente | Aufgabe |
| --- | --- |
| Firmenwebseite | Demo-Webanwendung und Angriffsoberflaeche |
| Backend | Logging, Detection, Speicherung, Correlation, API |
| Dashboard | Visualisierung von Events, Alerts, Attacks, Stats und Regeln |

## 4. Webanwendung als Angriffsoberflaeche

### 4.1 Startseite

- Zeigt eine einfache Firmenwebseite mit Navigation.
- Enthaelt die Suchleiste und Demo-Angriffsbutton fuer XSS.
- Leitet angemeldete Admins zum Dashboard weiter.

### 4.2 Login

- Test-Login mit festen Accounts.
- Erfolgreicher Login erzeugt ein JWT.
- Admins koennen danach das Dashboard oeffnen.
- Fehlgeschlagene Login-Versuche erzeugen `failed_login` Events.
- Mehrere fehlgeschlagene Logins koennen einen `brute_force` Alert ausloesen.

### 4.3 Kontakt

- Kontaktformular mit Name, E-Mail und Nachricht.
- Nachrichten werden im Backend gespeichert.
- XSS- oder SQLi-Payloads in Feldern werden durch die Security-Middleware erkannt und geloggt.

### 4.4 Upload

- Datei-Upload fuer Demo-Dateien.
- Upload-Metadaten werden gespeichert.
- Gefaehrliche Dateitypen werden als `bad_upload` erkannt.
- Abgelehnte Dateien erhalten den Status `rejected` und werden in einen Quarantaene-Ordner geschrieben.

### 4.5 Suche

- Suche gegen vordefinierte Inhalte.
- Suchergebnisse enthalten Name, Beschreibung, URL und Kategorie.
- Suchparameter werden durch die Security-Middleware auf verdaechtige Muster geprueft.

## 5. Security-Erkennung

### 5.1 Logging und RequestContext

Jeder relevante Request wird in einen normalisierten `RequestContext` ueberfuehrt. Ausgewertet werden unter anderem:

- Source-IP
- HTTP-Methode
- Pfad
- vollstaendige URL
- Query-Parameter
- Header
- Body
- Form-/JSON-Felder

Zusätzlich erzeugt das Backend pro Request eine Request-ID, die in Logs und Response-Headern nachvollziehbar ist.

### 5.2 Pattern-basierte Erkennung

Die Pattern-Erkennung nutzt JSON-Regeln. Die Regeln werden ueber einen Rule-Loader geladen und durch den Pattern-Detector gegen Query, Body, URL und Form-Felder geprueft.

Erkannte Pattern:

| Angriffstyp | Event-Typ | Severity | Beispiel |
| --- | --- | --- | --- |
| SQL Injection | `sql_injection` | high | `' OR 1=1 --` |
| XSS | `xss` | medium | `<script>alert(1)</script>` |
| Path Traversal | `path_traversal` | high | `../../etc/passwd` |

### 5.3 Spezialdetektoren

| Detektor | Event-Typ | Beschreibung |
| --- | --- | --- |
| Bad Upload | `bad_upload` | erkennt gefaehrliche Dateiendungen |
| Rate Limit | `rate_limit` | erkennt viele Requests pro IP in kurzem Zeitraum |

### 5.4 Correlation und Alerts

Einzelne Events werden nach dem Speichern durch Correlation-Regeln ausgewertet.

| Alert | Ausloeser | Severity |
| --- | --- | --- |
| Brute Force | mindestens 5 fehlgeschlagene Logins in 60 Sekunden von gleicher IP | critical |
| Multi-Vector | mehrere verschiedene Event-Typen einer IP in kurzem Zeitraum | high |

Duplicate-Alerts werden in einem kurzen Zeitfenster vermieden, damit das Dashboard nicht mit identischen Alerts geflutet wird.

### 5.5 Rules-Management

Das Dashboard enthaelt eine Rules-Verwaltung. Regeln koennen ueber das Frontend und die Backend-API verwaltet werden.

Anforderungen:

- Regeln anzeigen
- Regelklassen anzeigen
- Regelklasse anlegen
- Regel anlegen
- Regel bearbeiten
- Regel loeschen
- Regelklasse loeschen
- neue Regeln ohne Backend-Neustart aktivieren

Status: umgesetzt und per Frontend-E2E-Test geprueft.

## 6. Dashboard

Das Dashboard ist ein geschuetzter Bereich fuer Admins.

### 6.1 Dashboard-Uebersicht

- Zeigt gruppierte Angriffe.
- Erlaubt Filterung nach Zeitraum, Klassifikation, IP und Severity.
- Zeigt Detailinformationen zu Angriffen.

### 6.2 Events

- Zeigt SecurityEvents als Tabelle.
- Neueste Events werden zuerst angezeigt.
- `limit` und `offset` unterstuetzen Pagination.

### 6.3 Alerts

- Zeigt erzeugte Alerts.
- Neueste Alerts werden zuerst angezeigt.
- `limit` und `offset` unterstuetzen Pagination.

### 6.4 Stats

- KPI-Karten fuer Events und Alerts.
- Chart fuer Events pro Stunde.
- Chart fuer Verteilung nach Event-Typ.

### 6.5 Rules

- Zeigt aktuelle Regeln aus dem Backend.
- Erlaubt Erstellung, Bearbeitung und Loeschung von Regeln.
- Neue Regeln greifen sofort in der Detection.

## 7. API-Anforderungen

Wichtige API-Bereiche:

| Bereich | Beispiele |
| --- | --- |
| Auth | `POST /auth/login` |
| Dashboard | `GET /dashboard/events`, `GET /dashboard/alerts`, `GET /dashboard/attacks`, `GET /dashboard/stats` |
| Contact | `POST /contact`, `GET /contact` |
| Search | `GET /search?q=...` |
| Upload | `POST /upload`, `GET /upload` |
| Rules | `GET /rules`, `POST /rules`, `PATCH /rules/{id}`, `DELETE /rules/{id}` |

Fehlerantworten sollen in einem einfachen einheitlichen Format ausgegeben werden:

```json
{
  "detail": "Invalid request",
  "error_code": "validation_error"
}
```

## 8. Datenmodell

### 8.1 SecurityEvent

| Feld | Typ | Beschreibung |
| --- | --- | --- |
| `id` | Integer | eindeutige ID |
| `timestamp` | DateTime | Zeitpunkt des Events |
| `event_type` | String | Art des Events |
| `source_ip` | String | IP-Adresse |
| `path` | String | betroffener Pfad |
| `detail` | String | Beschreibung / erkanntes Muster |
| `severity` | String | `low`, `medium`, `high`, `critical` |

### 8.2 Alert

| Feld | Typ | Beschreibung |
| --- | --- | --- |
| `id` | Integer | eindeutige ID |
| `timestamp` | DateTime | Zeitpunkt des Alerts |
| `alert_type` | String | Art des Alerts |
| `source_ip` | String | IP-Adresse |
| `message` | String | Beschreibung |
| `severity` | String | `low`, `medium`, `high`, `critical` |

### 8.3 User

| Feld | Typ | Beschreibung |
| --- | --- | --- |
| `id` | Integer | eindeutige ID |
| `username` | String | Benutzername |
| `hashed_password` | String | gehashtes Passwort |
| `role` | String | Rolle, z.B. `admin` oder `user` |

### 8.4 ContactMessage

| Feld | Typ | Beschreibung |
| --- | --- | --- |
| `id` | Integer | eindeutige ID |
| `name` | String | Name |
| `email` | String | E-Mail-Adresse |
| `message` | String | Nachricht |
| `submitted_at` | DateTime | Zeitpunkt |

### 8.5 UploadedFile

| Feld | Typ | Beschreibung |
| --- | --- | --- |
| `id` | Integer | eindeutige ID |
| `original_filename` | String | urspruenglicher Dateiname |
| `stored_filename` | String | gespeicherter Dateiname |
| `file_extension` | String | Dateiendung |
| `uploaded_at` | DateTime | Upload-Zeitpunkt |
| `client_ip` | String | Client-IP |
| `status` | String | `uploaded` oder `rejected` |
| `content_type` | String | MIME-Type |
| `file_size` | Integer | Dateigroesse |

## 9. Nicht-funktionale Anforderungen

| Anforderung | Umsetzung |
| --- | --- |
| Modularitaet | Backend ist in Routes, Schemas, Repositories, Services, Middleware und Security-Komponenten aufgeteilt |
| Nachvollziehbarkeit | Events, Alerts, Request-ID, API-Doku und Testbeispiele |
| Bedienbarkeit | Dashboard und Demo-Buttons fuer typische Angriffe |
| Lokale Ausfuehrbarkeit | Backend und Frontend koennen lokal gestartet werden |
| Versionierung | Git/GitHub mit Branches und nachvollziehbarer Commit-History |

## 10. Bewusst nicht im Scope

- Kein produktiver Schutz vor allen Angriffen.
- Kein aktives Blockieren aller Requests; Fokus liegt auf Erkennung, Logging und Visualisierung.
- Keine Benutzerregistrierung.
- Keine E-Mail-Versendung.
- Keine externen Benachrichtigungen.
- Keine Machine-Learning-Anomalie-Erkennung.
- Keine produktive Skalierung.
- Keine HTTPS-/Deployment-Konfiguration.
- Keine vollstaendige mobile Optimierung.

## 11. Abnahmekriterien

Der Prototyp gilt als abnahmefaehig, wenn folgende Punkte gezeigt werden koennen:

1. Die Firmenwebseite besitzt Startseite, Login, Kontaktformular, Upload und Suche.
2. Login mit Test-Account funktioniert.
3. Dashboard ist nur mit Admin-Token erreichbar.
4. SQL-Injection-Payload erzeugt ein Event.
5. XSS-Payload erzeugt ein Event.
6. Path-Traversal-Payload erzeugt ein Event.
7. Gefaehrlicher Upload erzeugt ein `bad_upload` Event.
8. Mehrere fehlgeschlagene Login-Versuche erzeugen einen `brute_force` Alert.
9. Mehrere verschiedene Angriffstypen koennen zu einem `multi_vector` Alert gruppiert werden.
10. Dashboard zeigt Events, Alerts, Attacks und Stats.
11. Rules-UI kann Regeln erstellen und loeschen.
12. Eine neu erstellte Regel erzeugt ohne Server-Neustart ein Event.
13. Dokumentation und manuelle Testbeispiele liegen im Repository.
14. Git-History zeigt die Arbeit der Teammitglieder nachvollziehbar.

## 12. Erfuellungsstand am 07.06.2026

| Bereich | Status |
| --- | --- |
| Webanwendung | umgesetzt |
| Logging | umgesetzt |
| Detection | umgesetzt fuer typische Demo-Angriffe |
| Correlation | umgesetzt fuer Brute Force und Multi-Vector |
| Dashboard | umgesetzt |
| Rules-Management | umgesetzt |
| Evaluation | vorbereitet und technisch getestet |
| Benachrichtigungen | nicht umgesetzt, optional |
| Rechteverletzungs-Detection | teilweise, Auth-Guard vorhanden, kein eigener Event-Typ |

Details zur Evaluation stehen in `evaluation.md`.
