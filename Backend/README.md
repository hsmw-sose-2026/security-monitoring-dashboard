# Backend – Security Monitoring Dashboard

FastAPI-Backend für das Security Monitoring Dashboard. Erkennt Angriffe auf die Firmenwebseite (SQL-Injection, XSS, Path Traversal, Rate Limit, Brute Force, Bad Upload) und stellt die Events für das Dashboard-Frontend bereit.

## Quickstart

```bash
cd Backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Server läuft anschließend unter `http://localhost:8000`. Health-Check: `http://localhost:8000/health`.

## Neue Detection-Regel anlegen

Pattern-basierte Detektoren (SQLi, XSS, Path Traversal, …) werden über JSON-Regeldateien konfiguriert. Eine neue Regel hinzuzufügen, erfordert keine Code-Änderung – nur eine JSON-Datei und einen Server-Neustart.

### Schritt 1: JSON-Datei anlegen

Lege eine neue Datei in `Backend/app/services/security/rules/` an, z. B. `command_injection.json`. Der Dateiname ohne `.json` wird zum Regel-Namen im System.

### Schritt 2: Schema befüllen

```json
{
  "enabled": true,
  "event_type": "command_injection",
  "severity": "high",
  "patterns": [
    {
      "name": "ci_pipe_to_bash",
      "regex": "\\|\\s*bash",
      "description": "Pipe zu bash, typisch fuer Command Injection"
    },
    {
      "name": "ci_semicolon_chain",
      "regex": ";\\s*(cat|ls|whoami)",
      "description": "Befehlsverkettung mit gaengigen Shell-Kommandos"
    }
  ]
}
```

**Pflichtfelder:**

- `enabled` (bool): `true` aktiviert die Regel, `false` deaktiviert sie ohne Code-Änderung
- `event_type` (string): Erscheint später in den DB-Events und im Dashboard
- `severity` (string): Erlaubte Werte `low`, `medium`, `high`, `critical`
- `patterns` (array): Liste von Pattern-Objekten

**Pflichtfelder pro Pattern:**

- `name`: Eindeutiger Bezeichner, idealerweise mit Präfix (z. B. `ci_` für Command Injection)
- `regex`: Regex-Ausdruck, der gegen URL, Body und einzelne Query-/Form-Felder geprüft wird
- `description`: Kurze deutsche Beschreibung, was das Pattern erkennt

### Schritt 3: Server neu starten

`uvicorn app.main:app --reload` reicht – beim Start wird `load_all_rules()` in `rule_loader.py` aufgerufen, was alle JSON-Dateien einliest und validiert. In der Konsole erscheint:

```
[RuleLoader] 4 Regeldateien geladen: command_injection, path_traversal, sqli, xss
```

Bei Schema-Fehlern bricht der Server mit einer verständlichen Meldung ab, z. B.:

```
RuntimeError: Regel 'command_injection', Pattern #0: Feld 'name' fehlt.
```

### Verhalten und Geltungsbereich

- Patterns werden **case-insensitive** geprüft (`re.IGNORECASE`)
- Geprüft werden: URL, Body, einzelne Query-Parameter (Label `query:<name>`), einzelne Form-/JSON-Body-Felder (Label `form:<name>`)
- Mehrere Patterns einer Regel können in einem Request matchen → mehrere Events
- Ein Pattern matcht nur **einmal** pro Request (nach erstem Treffer Abbruch)

### Stolperfallen

**JSON-Escape vs. Regex-Escape:** In JSON-Strings ist `\\` ein literaler Backslash. Im Regex bedeutet das wiederum ein escaped Zeichen. Das führt zu doppelten Backslashes:

| Was du erkennen willst | Regex | In JSON schreiben als |
|---|---|---|
| Punkt (literal) | `\.` | `"\\."` |
| Backslash (literal) | `\\` | `"\\\\"` |
| Wortgrenze | `\b` | `"\\b"` |

**Reihenfolge der Treffer:** Wenn dein Pattern in einem Query-Param **und** in der vollen URL matchen würde, gewinnt das spezifischere Feld – das `where`-Label im Event zeigt dann `query:q` statt `url`.

**Deaktivieren statt löschen:** Wenn eine Regel zu viele False Positives produziert, setze `"enabled": false` statt die Datei zu löschen. So bleiben die Patterns als Referenz erhalten.

### Test einer neuen Regel

Nach Server-Neustart einen passenden Request schicken und in der DB nachschauen:

```bash
curl "http://localhost:8000/?cmd=ls;cat /etc/passwd"
```

Im Server-Log sollte erscheinen:

```
[Middleware] command_injection erkannt (ci_semicolon_chain): ;cat in query:cmd
```

Und ein passender Eintrag in der `securityevent`-Tabelle der `database.db`.