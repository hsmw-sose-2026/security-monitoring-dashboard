# Angriffsbeispiele

<<<<<<< HEAD
Diese Datei dokumentiert manuelle Testfälle für die wichtigsten Sicherheitsereignisse im Backend. Jeder Block beschreibt einen konkreten Request, den erwarteten Event-Typ, die Severity, den sichtbaren Dashboard-Pfad und die Frage, ob ein Alert entstehen soll.
=======
Manuelle Beispiele fuer die wichtigsten Angriffstypen. Nach dem Ausfuehren sollten die Events im Dashboard unter `/dashboard/events` sichtbar sein.
>>>>>>> origin/integration-test

## 1. SQL Injection
- **Angriffstyp**: SQL Injection
- **Beispiel-Request**:
  ```bash
  curl -X POST http://localhost:8000/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"admin'\'' OR '\''1'\''='\''1'\'' --","password":"anything"}'
  ```
- **Erwarteter event_type**: `sql_injection`
- **Erwartete severity**: `high`
- **Pfad im Dashboard**: `/dashboard/events` und `/dashboard/attacks`
- **Alert**: Ja (bei Korrelation)

## 2. XSS
- **Angriffstyp**: Cross-Site Scripting
- **Beispiel-Request**:
  ```bash
  curl "http://localhost:8000/search?q=%3Cscript%3Ealert(1)%3C%2Fscript%3E"
  ```
- **Erwarteter event_type**: `xss`
- **Erwartete severity**: `medium`
- **Pfad im Dashboard**: `/dashboard/events`
- **Alert**: Nein (erstmal nur Event)

<<<<<<< HEAD
Fertig, wenn jede Anforderung aus dem Anforderungskatalog Abschnitt 3 ein manuelles Testszenario hat.

# Angriffsbeispiele

## 1. SQL Injection
- **Angriffstyp**: SQL Injection
- **Beschreibung**: Ein typisches Login-Payload versucht, die SQL-Query zu manipulieren.
- **Eingabe/Request**: Login mit Benutzername `admin' OR '1'='1` und beliebigem Passwort
- **Erwarteter event_type**: `sql_injection`
- **Erwartete severity**: `high`
- **Pfad im Dashboard**: `/dashboard/events` und `/dashboard/attacks`
- **Alert**: Ja (bei Korrelation mit weiteren Ereignissen)

## 2. XSS
- **Angriffstyp**: Cross-Site Scripting
- **Beschreibung**: Ein Eingabefeld wird mit Inline-JavaScript gefüllt, um clientseitige Ausführung zu provozieren.
- **Eingabe/Request**: Kontaktformular mit `message=<script>alert(1)</script>`
- **Erwarteter event_type**: `xss`
- **Erwartete severity**: `medium`
- **Pfad im Dashboard**: `/dashboard/events`
- **Alert**: Nein (erstmal nur Event)

## 3. Path Traversal
- **Angriffstyp**: Path Traversal
- **Beschreibung**: Eine Pfad-Manipulation versucht, auf Dateien außerhalb des Webroot zuzugreifen.
- **Eingabe/Request**: `/search?q=../../etc/passwd`
=======
## 3. Path Traversal
- **Angriffstyp**: Path Traversal
- **Beispiel-Request**:
  ```bash
  curl "http://localhost:8000/search?q=../../etc/passwd"
  ```
>>>>>>> origin/integration-test
- **Erwarteter event_type**: `path_traversal`
- **Erwartete severity**: `high`
- **Pfad im Dashboard**: `/dashboard/events` und `/dashboard/attacks`
- **Alert**: Ja (high severity)

## 4. Bad Upload
- **Angriffstyp**: Gefährlicher Datei-Upload
<<<<<<< HEAD
- **Beschreibung**: Ein Upload mit einer riskanten Dateiendung wird erkannt.
- **Eingabe/Request**: Hochladen von `malware.exe` oder `virus.bat`
=======
- **Beispiel-Request**:
  ```bash
  curl -F "file=@../Frontend/public/demo-attack.exe" http://localhost:8000/upload
  ```
>>>>>>> origin/integration-test
- **Erwarteter event_type**: `bad_upload`
- **Erwartete severity**: `medium`
- **Pfad im Dashboard**: `/dashboard/events`
- **Alert**: Nein

<<<<<<< HEAD
## 5. Brute Force / Failed Login
- **Angriffstyp**: Brute Force Login
- **Beschreibung**: Mehrere fehlgeschlagene Login-Versuche von derselben IP erzeugen wiederholte `failed_login`-Events.
- **Eingabe/Request**: 6+ fehlgeschlagene Login-Versuche innerhalb kurzer Zeit von derselben IP
- **Erwarteter event_type**: `failed_login`
- **Erwartete severity**: `high` (bei Alert)
=======
## 5. Brute Force
- **Angriffstyp**: Brute Force Login
- **Beispiel-Request**:
  ```bash
  for i in 1 2 3 4 5 6; do
    curl -X POST http://localhost:8000/auth/login \
      -H "Content-Type: application/json" \
      -d "{\"username\":\"admin\",\"password\":\"wrong$i\"}"
  done
  ```
- **Erwarteter event_type**: `failed_login`
- **Erwartete severity**: `medium` bei Events, `critical` beim Alert
>>>>>>> origin/integration-test
- **Pfad im Dashboard**: `/dashboard/alerts` und `/dashboard/attacks`
- **Alert**: Ja (`brute_force`)

## 6. Rate Limit
- **Angriffstyp**: Rate Limit / Flooding
<<<<<<< HEAD
- **Beschreibung**: Ein einzelner Client sendet eine sehr hohe Anzahl von Requests in kurzer Zeit.
- **Eingabe/Request**: >50 Requests von derselben IP in 60 Sekunden (z.B. `curl`-Loop oder `ab`)
- **Erwarteter event_type**: `rate_limit`
- **Erwartete severity**: `medium`
- **Pfad im Dashboard**: `/dashboard/events`
- **Alert**: Nein (derzeit nur Event-Erkennung)

## 7. Multi-Vector Angriff
- **Angriffstyp**: Multi-Vector
- **Beschreibung**: Dieselbe IP erzeugt nacheinander mehrere unterschiedliche Sicherheits-Events innerhalb von 15 Minuten.
- **Testsequenz**:
  1. `POST /login` mit `username=admin' OR '1'='1` → `sql_injection`
  2. `POST /contact` mit `message=<script>alert(1)</script>` → `xss`
  3. `GET /search?q=../../etc/passwd` → `path_traversal`
  4. Upload von `malware.exe` / `virus.bat` → `bad_upload`
- **Erwarteter alert_type**: `multi_vector`
- **Erwartete severity**: `high`
- **Pfad im Dashboard**: `/dashboard/alerts` und `/dashboard/attacks`
- **Alert**: Ja (Multi-Vector-Korrelation)

## Hinweis zu Regex-basierter Erkennung
Die Backend-Erkennung für SQLi, XSS und Path Traversal basiert auf Regex- oder Pattern-Matching-Regeln. Das bedeutet:
- Regex kann einfache Payloads zuverlässig finden, aber keine vollständige SQL- oder HTML-Syntax validieren.
- Komplexe oder verschleierte Payloads können unentdeckt bleiben, wenn sie nicht dem vordefinierten Muster entsprechen.
- Gleichzeitig kann es bei ungewöhnlichen Eingaben zu False Positives kommen, weil ein Regex nur auf Textmuster und nicht auf tatsächliche Ausführungssemantik prüft.
- Deshalb ist die Dokumentation der Erkennungsgrenzen wichtig: die Regeln sind nützlich für erste Warnungen, aber sie ersetzen keine vollständige Kontextanalyse oder sichere Input-Handhabung.
=======
- **Beispiel-Request**:
  ```bash
  for i in $(seq 1 55); do
    curl -s "http://localhost:8000/health" > /dev/null
  done
  ```
- **Erwarteter event_type**: `rate_limit`
- **Erwartete severity**: `medium`
- **Pfad im Dashboard**: `/dashboard/events`
- **Alert**: Nein (kann später erweitert werden)

## Grenzen der Regex-Erkennung

Die aktuelle Erkennung ist fuer den Prototyp bewusst regelbasiert. Sie erkennt typische SQLi-, XSS- und Path-Traversal-Payloads gut genug fuer die Demo, kann aber durch starke Obfuskation, Encoding-Kombinationen oder sehr kontextspezifische Payloads umgangen werden.
>>>>>>> origin/integration-test
