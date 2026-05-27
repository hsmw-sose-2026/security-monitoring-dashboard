# Smoke-Tests Backend

Diese Checkliste prueft schnell, ob die wichtigsten Backend-Endpunkte fuer die Demo erreichbar sind.

## Voraussetzungen

- Backend laeuft auf `http://localhost:8000`
- Start aus dem Ordner `Backend`:

```bash
uvicorn app.main:app --reload
```

- Optional Demo-Angriffe erzeugen:

```bash
python seed_attacks.py
```

## 1. Health Check

```bash
curl -i http://localhost:8000/health
```

Erwartung:
- Status `200 OK`
- Body enthaelt `{"status":"ok"}`

## 2. Login erfolgreich

```bash
curl -i -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

Erwartung:
- Status `200 OK`
- Body enthaelt `status: "ok"` und `role: "admin"`

## 3. Login fehlgeschlagen

```bash
curl -i -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"wrong-password"}'
```

Erwartung:
- Status `401 Unauthorized`
- Ein `failed_login` Event erscheint unter `/dashboard/events`

## 4. Events abrufen

```bash
curl -i http://localhost:8000/dashboard/events
```

Erwartung:
- Status `200 OK`
- Body ist eine JSON-Liste
- Nach fehlgeschlagenem Login enthaelt die Liste mindestens ein Event mit `event_type: "failed_login"`

## 5. Alerts abrufen

```bash
curl -i http://localhost:8000/dashboard/alerts
```

Erwartung:
- Status `200 OK`
- Body ist eine JSON-Liste
- Nach mehreren fehlgeschlagenen Logins enthaelt die Liste einen `brute_force` Alert mit `severity: "critical"`

## 6. Attacks abrufen

```bash
curl -i http://localhost:8000/dashboard/attacks
```

Erwartung:
- Status `200 OK`
- Body ist eine JSON-Liste
- Attack-Objekte enthalten mindestens:
  - `source_ip`
  - `start_time`
  - `end_time`
  - `event_count`
  - `event_types`
  - `severity`
  - `classification`
  - `risk_score`
  - `events`

Beispiel-Erwartung nach Brute-Force-Test:

```json
{
  "classification": "brute_force",
  "event_types": ["failed_login"],
  "risk_score": 62
}
```

## 7. Stats abrufen

```bash
curl -i http://localhost:8000/dashboard/stats
```

Erwartung:
- Status `200 OK`
- Body enthaelt:
  - `events_today`
  - `alerts_today`
  - `critical_alerts`
  - `events_per_hour`
  - `events_by_type`
  - `total_alerts`
  - `average_events`
  - `contact_messages_today`
  - `uploads_today`

## 8. Seed-Skript Demo-Lauf

```bash
python seed_attacks.py
```

Erwartung:
- Health Check ist erfolgreich
- Fehlgeschlagene Logins liefern `401`
- Upload liefert `201`
- Suche mit SQLi/XSS/Path-Traversal liefert `200`
- Am Ende wird eine Dashboard-Zusammenfassung ausgegeben

Hinweis: SQLi, XSS, Path Traversal und Bad Upload erscheinen erst als SecurityEvents, wenn die vorgelagerte Detection-Pipeline diese Event-Typen loggt.