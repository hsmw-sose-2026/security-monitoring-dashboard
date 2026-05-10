# API-Beispiele

TODO(Kevin): curl- oder Browser-Beispiele fuer Kontakt-, Such- und Upload-Endpoints dokumentieren.

Ziel:
- Nachweisen, dass Kontakt, Suche und Upload als Backend-Endpoints funktionieren.
- Beispiele so aufschreiben, dass andere sie direkt nachmachen koennen.

Pro Endpoint dokumentieren:
- HTTP-Methode und URL
- Beispiel-Request
- Erwartete Response
- Ob ein SecurityEvent entstehen soll
- Kurzer Hinweis, welche Datei den Endpoint implementiert

Fertig, wenn Kontakt absenden, Suche ausfuehren, erlaubte Datei hochladen und gesperrte Datei hochladen dokumentiert sind.

---

# API-Beispiele

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
  "status": "Nachricht wurde gespeichert."
}
```

- **SecurityEvent**: Ja – `event_type: xss`, `severity: medium`
- **Hinweis**: Die Nachricht wird gespeichert; die Middleware erkennt das Muster und erzeugt ein Event unter `/dashboard/events`.

---

## 3. Suche ausfuehren – normaler Treffer

- **Methode/URL**: `GET /search/?q=<suchbegriff>`
- **Implementiert in**: `routes/search.py`
- **Beispiel-Request**:

```bash
curl "http://localhost:8000/search/?q=Eintrag"
```

- **Erwartete Response** (`200 OK`):

```json
{
  "query": "Eintrag",
  "total": 4,
  "results": [
    { "name": "Eintrag A", "description": "Beschreibung von Eintrag A" },
    { "name": "Eintrag B", "description": "Beschreibung von Eintrag B" },
    { "name": "Eintrag C", "description": "Beschreibung von Eintrag C" },
    { "name": "Eintrag D", "description": "Beschreibung von Eintrag D" }
  ]
}
```

- **SecurityEvent**: Nein (normaler Vorgang)

---

## 4. Suche ausfuehren – Path Traversal Versuch

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

## 5. Erlaubte Datei hochladen

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
  "status": "uploaded"
}
```

- **SecurityEvent**: Nein (normaler Vorgang)

---

## 6. Gesperrte Datei hochladen – Bad Upload Versuch

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
  "status": "uploaded"
}
```

- **SecurityEvent**: Ja – `event_type: bad_upload`, `severity: medium`
- **Hinweis**: Die Datei wird gespeichert; die Security-Pruefung auf Dateitypen erfolgt ueber die Middleware bzw. Detection-Logik. Das Event erscheint unter `/dashboard/events`.
