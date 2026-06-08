# API-Beispiele

Diese Beispiele pruefen die Contact-, Search- und Upload-Endpoints manuell gegen ein lokal laufendes Backend.

Backend starten:

```bash
cd Backend
uvicorn app.main:app --reload
```

## 1. Kontakt absenden

- **Methode/URL**: `POST /contact/`
- **Implementiert in**: `routes/contact.py`
- **Beispiel-Request**:

```bash
curl -X POST http://localhost:8000/contact/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Max Mustermann",
    "email": "max@beispiel.de",
    "message": "Ich habe eine Frage zu eurem Angebot."
  }'
```

- **Erwartete Response** (`201 Created`):

```json
{
  "id": 1,
  "name": "Max Mustermann",
  "email": "max@beispiel.de",
  "message": "Ich habe eine Frage zu eurem Angebot.",
  "submitted_at": "2026-06-07T10:00:00",
  "status": "Nachricht wurde gespeichert."
}
```

- **SecurityEvent**: Nein (normaler Vorgang)

---

## 2. Kontakt absenden – XSS-Versuch im Nachrichtenfeld

- **Methode/URL**: `POST /contact/`
- **Implementiert in**: `routes/contact.py`
- **Beispiel-Request**:

```bash
curl -X POST http://localhost:8000/contact/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Angreifer",
    "email": "xss@beispiel.de",
    "message": "<script>alert(1)</script>"
  }'
```

- **Erwartete Response** (`201 Created`):

```json
{
  "id": 2,
  "name": "Angreifer",
  "email": "xss@beispiel.de",
  "message": "<script>alert(1)</script>",
  "submitted_at": "2026-06-07T10:00:00",
  "status": "Nachricht wurde gespeichert."
}
```

- **SecurityEvent**: Ja – `event_type: xss`, `severity: medium`
- **Hinweis**: Die Nachricht wird gespeichert; die Middleware erkennt das Muster und erzeugt ein Event unter `/dashboard/events`.

---

## 3. Kontaktanfragen abrufen

- **Methode/URL**: `GET /contact?limit=20&offset=0`
- **Implementiert in**: `routes/contact.py`, `repositories/contact_repository.py`
- **Beispiel-Request**:

```bash
curl "http://localhost:8000/contact?limit=20&offset=0"
```

- **Erwartete Response** (`200 OK`):

```json
[
  {
    "id": 1,
    "name": "Max Mustermann",
    "email": "max@beispiel.de",
    "message": "Ich habe eine Frage zu eurem Angebot.",
    "submitted_at": "2026-06-07T10:00:00"
  }
]
```

- **SecurityEvent**: Nein (nur Abruf gespeicherter Daten)

---

## 4. Suche ausfuehren – Treffer mit Kategorie

- **Methode/URL**: `GET /search/?q=<suchbegriff>`
- **Implementiert in**: `routes/search.py`
- **Beispiel-Request**:

```bash
curl "http://localhost:8000/search?q=kontakt"
```

- **Erwartete Response** (`200 OK`):

```json
{
  "query": "kontakt",
  "total": 1,
  "results": [
    {
      "name": "Kontakt",
      "description": null,
      "url": "/contact",
      "category": "Seite"
    }
  ]
}
```

- **SecurityEvent**: Nein (normaler Vorgang)

---

## 5. Suche ausfuehren – Path Traversal Versuch

- **Methode/URL**: `GET /search/?q=<suchbegriff>`
- **Implementiert in**: `routes/search.py`
- **Beispiel-Request**:

```bash
curl "http://localhost:8000/search/?q=../../etc/passwd"
```

- **Erwartete Response** (`200 OK`):

```json
{
  "query": "../../etc/passwd",
  "total": 0,
  "results": []
}
```

- **SecurityEvent**: Ja – `event_type: path_traversal`, `severity: high`
- **Hinweis**: Die Suche liefert keine Treffer; die Middleware erkennt das Muster und erzeugt ein Event unter `/dashboard/events` und `/dashboard/attacks`.

---

## 6. Erlaubte Datei hochladen

- **Methode/URL**: `POST /upload/`
- **Implementiert in**: `routes/upload.py`
- **Beispiel-Request**:

```bash
curl -X POST http://localhost:8000/upload/ \
  -F "file=@dokument.pdf"
```

- **Erwartete Response** (`201 Created`):

```json
{
  "original_filename": "dokument.pdf",
  "stored_filename": "a1b2c3d4-dokument.pdf",
  "file_extension": ".pdf",
  "status": "uploaded",
  "content_type": "application/pdf",
  "file_size": 12345,
  "reason": null
}
```

- **SecurityEvent**: Nein (normaler Vorgang)

---

## 7. Upload-Metadaten abrufen

- **Methode/URL**: `GET /upload?limit=20&offset=0`
- **Implementiert in**: `routes/upload.py`, `repositories/upload_repository.py`
- **Beispiel-Request**:

```bash
curl "http://localhost:8000/upload?limit=20&offset=0"
```

- **Erwartete Response** (`200 OK`):

```json
[
  {
    "id": 1,
    "original_filename": "dokument.pdf",
    "stored_filename": "a1b2c3d4-dokument.pdf",
    "file_extension": ".pdf",
    "uploaded_at": "2026-06-07T10:00:00",
    "client_ip": "127.0.0.1",
    "status": "uploaded",
    "content_type": "application/pdf",
    "file_size": 12345
  }
]
```

- **SecurityEvent**: Nein (nur Abruf gespeicherter Daten)

---

## 8. Gesperrte Datei hochladen – Bad Upload Versuch

- **Methode/URL**: `POST /upload/`
- **Implementiert in**: `routes/upload.py`
- **Beispiel-Request**:

```bash
curl -X POST http://localhost:8000/upload/ \
  -F "file=@malware.exe"
```

- **Erwartete Response** (`201 Created`):

```json
{
  "original_filename": "malware.exe",
  "stored_filename": "f9e8d7c6-malware.exe",
  "file_extension": ".exe",
  "status": "rejected",
  "content_type": "application/octet-stream",
  "file_size": 1234,
  "reason": "extension_blocked"
}
```

- **SecurityEvent**: Ja – `event_type: bad_upload`, `severity: medium`
- **Hinweis**: Die Datei wird in `uploads/quarantine/` gespeichert und ein Event erscheint unter `/dashboard/events`.

---

## 9. Rules – Liste abrufen

- **Methode/URL**: `GET /rules`
- **Implementiert in**: `routes/rules.py`
- **Beispiel-Request**:

```bash
curl http://localhost:8000/rules
```

- **Erwartete Response** (`200 OK`):

```json
[
  {
    "id": 1,
    "name": "SQL Injection",
    "description": "Regeln fuer sqli",
    "rules": [
      {
        "id": 101,
        "classId": 1,
        "name": "union_select",
        "eventType": "sqli",
        "target": "request",
        "regex": "union\\s+select",
        "severity": "high",
        "enabled": true,
        "description": ""
      }
    ]
  }
]
```

---

## 10. Rules – Klasse anlegen

- **Methode/URL**: `POST /rules/classes`
- **Beispiel-Request**:

```bash
curl -X POST http://localhost:8000/rules/classes \
  -H "Content-Type: application/json" \
  -d '{"name": "Custom Rules", "description": "Eigene Testregeln"}'
```

- **Erwartete Response** (`201 Created`): `RuleClassResponse` mit leerem `rules`-Array

---

## 11. Rules – Regel anlegen / bearbeiten / löschen

```bash
# Regel anlegen
curl -X POST http://localhost:8000/rules \
  -H "Content-Type: application/json" \
  -d '{
    "class_id": 1,
    "name": "test_pattern",
    "event_type": "sqli",
    "target": "request",
    "regex": "or 1=1",
    "severity": "medium",
    "enabled": true,
    "description": "Demo-Regel"
  }'

# Regel bearbeiten (ID-Schema: classId * 100 + patternIndex + 1)
curl -X PATCH http://localhost:8000/rules/101 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "test_pattern",
    "event_type": "sqli",
    "target": "request",
    "regex": "or 1=1 --",
    "severity": "high",
    "enabled": true,
    "description": "aktualisiert"
  }'

# Regel löschen
curl -X DELETE http://localhost:8000/rules/101

# Klasse löschen
curl -X DELETE http://localhost:8000/rules/classes/4
```

- **Hinweis**: Die Modals in `rules.tsx` nutzen diese Endpoints schon. Nur der initiale `GET`-Fetch lädt noch `/test-rules.json`.
