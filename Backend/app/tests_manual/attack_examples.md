# Angriffsbeispiele

Diese Datei dokumentiert manuelle Testfälle für die wichtigsten Sicherheitsereignisse im Backend. Jeder Block beschreibt einen konkreten Request, den erwarteten Event-Typ, die Severity, den sichtbaren Dashboard-Pfad und die Frage, ob ein Alert entstehen soll.

Ziel:
- Fuer jede geforderte Angriffsart ein konkretes Beispiel festhalten.
- Zu jedem Beispiel notieren, welches Event oder welcher Alert im Dashboard entstehen soll.

Pro Beispiel dokumentieren:
- Angriffstyp
- Eingabe oder Request
- Erwarteter event_type
- Erwartete severity
- Erwarteter Pfad im Dashboard
- Ob daraus ein Alert entstehen soll

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
- **Erwarteter event_type**: `path_traversal`
- **Erwartete severity**: `high`
- **Pfad im Dashboard**: `/dashboard/events` und `/dashboard/attacks`
- **Alert**: Ja (high severity)

## 4. Bad Upload
- **Angriffstyp**: Gefährlicher Datei-Upload
- **Beschreibung**: Ein Upload mit einer riskanten Dateiendung wird erkannt.
- **Eingabe/Request**: Hochladen von `malware.exe` oder `virus.bat`
- **Erwarteter event_type**: `bad_upload`
- **Erwartete severity**: `medium`
- **Pfad im Dashboard**: `/dashboard/events`
- **Alert**: Nein

## 5. Brute Force / Failed Login
- **Angriffstyp**: Brute Force Login
- **Beschreibung**: Mehrere fehlgeschlagene Login-Versuche von derselben IP erzeugen wiederholte `failed_login`-Events.
- **Eingabe/Request**: 6+ fehlgeschlagene Login-Versuche innerhalb kurzer Zeit von derselben IP
- **Erwarteter event_type**: `failed_login`
- **Erwartete severity**: `high` (bei Alert)
- **Pfad im Dashboard**: `/dashboard/alerts` und `/dashboard/attacks`
- **Alert**: Ja (`brute_force`)

## 6. Rate Limit
- **Angriffstyp**: Rate Limit / Flooding
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
