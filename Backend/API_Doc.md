# API Dokumentation

Im folgenden Dokument ist die Dashboard-API festgehalten. Inhalt sind Endpoints und ihre dazugehörigen Response-Patterns. Alle Responses werden im JSON-Format übergeben.

## Endpoints

Das Backend des Prototypen verfügt derzeit über folgende Endpoints für das Dashboard:

```http
GET /dashboard/events?limit={limit}&offset={offset}
GET /dashboard/alerts?limit={limit}&offset={offset}
GET /dashboard/attacks
GET /dashboard/stats
```

Die Endpoints können per **URL-Aufruf:** `http://127.0.0.1:8000/dashboard/events`,
oder direkt per Get-Request aus dem **Terminal:** `curl http://127.0.0.1:8000/dashboard/events`
genutzt werden.

### Query-Parameter für Events und Alerts

Die Endpoints `/dashboard/events` und `/dashboard/alerts` unterstützen optionale Query-Parameter, um die Anzahl der zurückgegebenen Einträge zu begrenzen.

| Parameter | Typ       | Default | Beschreibung                                      |
| --------- | --------- | ------- | ------------------------------------------------- |
| `limit`   | `integer` | `100`   | Maximale Anzahl zurückgegebener Einträge          |
| `offset`  | `integer` | `0`     | Anzahl der übersprungenen Einträge vor der Ausgabe |

`limit` muss zwischen `1` und `500` liegen. `offset` muss mindestens `0` sein.

### Fehlerformat

Typische Fehler werden einheitlich zurückgegeben:

```json
{
"detail": "Invalid request",
"error_code": "validation_error"
}
```

Bei HTTP-Fehlern sieht ``error_code`` z.B. so aus:

```json
{
  "detail": "Not authenticated",
  "error_code": "http_401"
}
```

### Request-ID

Jede Request enthält den Header:

`` X-Request-ID: <uuid> ``

Dieselbe ID erscheint im Server-Log und bei Security-Events im ``detail``.


### Demo-Durchlauf mit Seed-Daten

Der Demo-Check wurde mit Seed-Daten ausgeführt. Events und Alerts sind sichtbar, `/dashboard/attacks` gruppiert weiterhin Angriffe, `/dashboard/stats` liefert sinnvolle Kennzahlen. `limit` und `offset` begrenzen Events und Alerts wie erwartet. Bei ungültigem `limit` wird das einheitliche Fehlerformat mit `error_code` zurückgegeben.

## Response-Patterns

---

## Events-Pattern

Das Pattern der Eventresponse ist nach folgendem Prinzip aufgebaut:

```json
{
    "id": 23,
    "timestamp": "2026-05-27T14:39:22.615500",
    "event_type": "path_traversal",
    "source_ip": "127.0.0.1",
    "path": "/search",
    "detail": "Zugriffsversuch auf Linux-Passwortdatei: /etc/passwd in query:q erkannt",
    "severity": "high"
}
```

### Felder


| Feld         | Typ                 | Beschreibung                                            |
| ------------ | ------------------- | ------------------------------------------------------- |
| `id`         | `integer`           | Eindeutige ID des Events                                |
| `timestamp`  | `string` (ISO 8601) | Genauer Zeitstempel des Ereignisses                     |
| `event_type` | `string`            | Klassifizierter Eventtyp (z. B. `path_traversal`)       |
| `source_ip`  | `string`            | IP-Adresse, die das Event ausgelöst hat                 |
| `path`       | `string`            | Request-Pfad, auf dem das Event erkannt wurde           |
| `detail`     | `string`            | Detailbeschreibung des Events                           |
| `severity`   | `string`            | Zugeordnete Schweregrad-Stufe (`low`, `medium`, `high`) |


---

## Alerts-Pattern

Das Pattern der Alertresponse ist nach folgendem Prinzip aufgebaut:

```json
{
    "id": 4,
    "timestamp": "2026-05-27T14:39:22.438029",
    "alert_type": "multi_vector",
    "source_ip": "127.0.0.1",
    "message": "Multi-Vector-Angriff von 127.0.0.1: 7 Events in 15 Minuten, Typen: failed_login, sql_injection, Pfade: /auth/login, /search",
    "severity": "high"
}
```

### Felder


| Feld         | Typ                 | Beschreibung                                            |
| ------------ | ------------------- | ------------------------------------------------------- |
| `id`         | `integer`           | Eindeutige ID des Alerts                                |
| `timestamp`  | `string` (ISO 8601) | Genauer Zeitstempel des Alerts                          |
| `alert_type` | `string`            | Klassifizierter Alerttyp (z. B. `multi_vector`)         |
| `source_ip`  | `string`            | IP-Adresse, die den Alert ausgelöst hat                 |
| `message`    | `string`            | Lesbare Zusammenfassung des Alerts                      |
| `severity`   | `string`            | Zugeordnete Schweregrad-Stufe (`low`, `medium`, `high`) |


---

## Attacks-Pattern

Ein Attack-Objekt fasst alle zusammengehörigen Events einer Quell-IP zu einem erkannten Angriff zusammen.

```json
{
  "source_ip": "127.0.0.1",
  "start_time": "2026-05-27T14:39:21.102642",
  "end_time": "2026-05-27T14:39:22.615500",
  "event_count": 11,
  "event_types": ["failed_login", "path_traversal", "sql_injection", "xss"],
  "severity": "high",
  "classification": "sql_injection",
  "risk_score": 95,
  "events": [ ... ]
}
```

### Felder – Attack Object


| Feld             | Typ                 | Beschreibung                                          |
| ---------------- | ------------------- | ----------------------------------------------------- |
| `source_ip`      | `string`            | IP-Adresse des Angreifers                             |
| `start_time`     | `string` (ISO 8601) | Zeitstempel des ersten Events                         |
| `end_time`       | `string` (ISO 8601) | Zeitstempel des letzten Events                        |
| `event_count`    | `integer`           | Gesamtzahl der Events in diesem Angriff               |
| `event_types`    | `string[]`          | Alle beteiligten Event-Typen (dedupliziert)           |
| `severity`       | `string`            | Höchste Severity unter allen Events                   |
| `classification` | `string`            | Dominanter Angriffstyp, der den Angriff klassifiziert |
| `risk_score`     | `integer`           | Berechneter Risikowert (0–100)                        |
| `events`         | `Event[]`           | Liste aller zugehörigen Events (siehe unten)          |


### Felder – Events[]


| Feld         | Typ                 | Beschreibung                                  |
| ------------ | ------------------- | --------------------------------------------- |
| `id`         | `integer`           | Eindeutige Event-ID                           |
| `timestamp`  | `string` (ISO 8601) | Zeitstempel des Events                        |
| `event_type` | `string`            | Typ des Events (z. B. `sql_injection`, `xss`) |
| `source_ip`  | `string`            | Auslösende IP-Adresse                         |
| `path`       | `string`            | Request-Pfad, auf dem das Event erkannt wurde |
| `detail`     | `string`            | Beschreibung des konkreten Vorfalls           |
| `severity`   | `string`            | Schweregrad: `low` · `medium` · `high`        |


---

## Stats-Pattern

Das Pattern der Statsresponse ist nach folgendem Prinzip aufgebaut:

```json
{
  "events_per_hour": { "14": 23, "15": 7 },
  "average_events": 0,
  "events_today": 0,
  "events_by_type": {
    "failed_login": 18,
    "sql_injection": 1,
    "xss": 2,
    "path_traversal": 2
  },
  "critical_alerts": 3,
  "alerts_today": 0,
  "total_alerts": 4,
  "contact_messages_today": 0,
  "uploads_today": 0
}
```

### Felder


| Feld                     | Typ       | Beschreibung                                                                            |
| ------------------------ | --------- | --------------------------------------------------------------------------------------- |
| `events_per_hour`        | `object`  | Anzahl der Events pro Stunde, Schlüssel ist die Stunde als String (`"14"`, `"15"`, ...) |
| `average_events`         | `number`  | Durchschnittliche Anzahl an Events pro Stunde                                           |
| `events_today`           | `integer` | Gesamtzahl der Events am aktuellen Tag                                                  |
| `events_by_type`         | `object`  | Anzahl der Events je Event-Typ (z. B. `failed_login`, `xss`)                            |
| `critical_alerts`        | `integer` | Anzahl der Alerts mit Severity `high`                                                   |
| `alerts_today`           | `integer` | Anzahl der Alerts am aktuellen Tag                                                      |
| `total_alerts`           | `integer` | Gesamtzahl aller Alerts                                                                 |
| `contact_messages_today` | `integer` | Anzahl eingegangener Kontaktnachrichten am aktuellen Tag                                |
| `uploads_today`          | `integer` | Anzahl der Datei-Uploads am aktuellen Tag                                               |


