# Angriffsbeispiele

Manuelle Beispiele fuer die wichtigsten Angriffstypen. Nach dem Ausfuehren sollten die Events im Dashboard unter `/dashboard/events` sichtbar sein.

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

## 3. Path Traversal
- **Angriffstyp**: Path Traversal
- **Beispiel-Request**:
  ```bash
  curl "http://localhost:8000/search?q=../../etc/passwd"
  ```
- **Erwarteter event_type**: `path_traversal`
- **Erwartete severity**: `high`
- **Pfad im Dashboard**: `/dashboard/events` und `/dashboard/attacks`
- **Alert**: Ja (high severity)

## 4. Bad Upload
- **Angriffstyp**: Gefährlicher Datei-Upload
- **Beispiel-Request**:
  ```bash
  curl -F "file=@../Frontend/public/demo-attack.exe" http://localhost:8000/upload
  ```
- **Erwarteter event_type**: `bad_upload`
- **Erwartete severity**: `medium`
- **Pfad im Dashboard**: `/dashboard/events`
- **Alert**: Nein

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
- **Pfad im Dashboard**: `/dashboard/alerts` und `/dashboard/attacks`
- **Alert**: Ja (`brute_force`)

## 6. Rate Limit
- **Angriffstyp**: Rate Limit / Flooding
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
