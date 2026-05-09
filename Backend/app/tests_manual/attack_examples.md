# Angriffsbeispiele

TODO(Jannis): Manuelle Beispiele fuer SQLi, XSS, Path Traversal, Bad Upload, Brute Force und Rate Limit dokumentieren.

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
- **Eingabe/Request**: Login mit `admin' OR '1'='1` im Benutzernamen
- **Erwarteter event_type**: `sql_injection`
- **Erwartete severity**: `high`
- **Pfad im Dashboard**: `/dashboard/events` und `/dashboard/attacks`
- **Alert**: Ja (bei Korrelation)

## 2. XSS
- **Angriffstyp**: Cross-Site Scripting
- **Eingabe/Request**: Kontaktformular mit `<script>alert(1)</script>` im Nachrichtenfeld
- **Erwarteter event_type**: `xss`
- **Erwartete severity**: `medium`
- **Pfad im Dashboard**: `/dashboard/events`
- **Alert**: Nein (erstmal nur Event)

## 3. Path Traversal
- **Angriffstyp**: Path Traversal
- **Eingabe/Request**: `../../etc/passwd` in URL oder Suchfeld (`/search?q=../../etc/passwd`)
- **Erwarteter event_type**: `path_traversal`
- **Erwartete severity**: `high`
- **Pfad im Dashboard**: `/dashboard/events` und `/dashboard/attacks`
- **Alert**: Ja (high severity)

## 4. Bad Upload
- **Angriffstyp**: Gefährlicher Datei-Upload
- **Eingabe/Request**: Hochladen von `malware.exe`
- **Erwarteter event_type**: `bad_upload`
- **Erwartete severity**: `medium`
- **Pfad im Dashboard**: `/dashboard/events`
- **Alert**: Nein

## 5. Brute Force
- **Angriffstyp**: Brute Force Login
- **Eingabe/Request**: 6+ fehlgeschlagene Logins mit gleicher IP in kurzer Zeit
- **Erwarteter event_type**: `failed_login`
- **Erwartete severity**: `high` (bei Alert)
- **Pfad im Dashboard**: `/dashboard/alerts` und `/dashboard/attacks`
- **Alert**: Ja (`brute_force`)

## 6. Rate Limit
- **Angriffstyp**: Rate Limit / Flooding
- **Eingabe/Request**: >50 Requests von derselben IP in 60 Sekunden (z.B. mit `ab` oder `curl` loop)
- **Erwarteter event_type**: `rate_limit`
- **Erwartete severity**: `medium`
- **Pfad im Dashboard**: `/dashboard/events`
- **Alert**: Nein (kann später erweitert werden)
