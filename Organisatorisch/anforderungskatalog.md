## 1. Projektbeschreibung

Wir bauen einen Prototypen für ein Security-Monitoring-System. Das System besteht aus einer einfachen Firmenwebseite (als Angriffsflche) und einem Dashboard das sicherheitsrelevante Ereignisse anzeigt.

**Was das System kann:**
- Sicherheitsrelevante Ereignisse auf der Firmen-Webseite automatisch erkennen und loggen
- Diese Events in einem Dashboard anzeigen (Tabelle, Charts, Alerts)
- Einem Admin helfen, Angriffe und Auffälligkeiten schnell zu erkennen
(Eventuell noch Webhook implementierungen, können wir aber weg lassen)

**Was das System NICHT kann / nicht der Scope ist:**
- Angriffe aktiv blockieren (wir erkennen und loggen sie nur, wir blocken sie nicht)
- Schutz vor allen denkbaren Angriffsarten (wir beschränken uns auf die unten definierte Liste)
- Skalierbarkeit

---

## 2. Die Webanwendung (Firmenwebseite)

Die Firmenwebseite ist eine einfache Demo-Seite die als Angriffsfläche dient. Sie hat folgende Seiten:

### 2.1 Startseite
- Zeigt eine einfache Willkommensseite mit Navigation
- Links zu Login, Kontakt, Upload, Suche
- Keine besondere Logik, rein informativ
- Wir könnten auch Templates verwenden die eine offene Lizenz besitzen

### 2.2 Login-Seite
- Formular mit Benutzername und Passwort
- Einloggen mit vordefinierten Test-Accounts (werden in der Datenbank angelegt)
- Bei falschem Passwort: Fehlermeldung "Login fehlgeschlagen"
- Bei richtigem Login: Weiterleitung zum Dashboard
- **Kein** "Passwort vergessen", **keine** Registrierung, **kein** OAuth

### 2.3 Kontaktformular
- Felder: Name, E-Mail, Nachricht
- Beim Absenden wird der Inhalt gespeichert (in der Datenbank, nicht per E-Mail verschickt)
- Erfolgsmeldung nach dem Absenden
- **Keine** echte E-Mail-Versendung

### 2.4 Datei-Upload
- Ein Formular mit einer Datei-Auswahl und einem Upload-Button
- Akzeptiert Dateien und speichert sie in einem Upload-Ordner
- Zeigt den Dateinamen nach dem Upload an
- **Keine** Vorschau, **kein** Dateimanager, **keine** Dateiliste

### 2.5 Suchfeld
- Ein Textfeld mit einem Such-Button
- Sucht in einer kleinen Liste von vordefinierten Einträgen (z.B. Blogposts oder Produkte)
- Zeigt Ergebnisse als einfache Liste an
- **Keine** Volltextsuche, **keine** Filter, **keine** Sortierung

---

## 3. Security Monitoring (Erkennung)

Die Middleware analysiert jeden eingehenden Request und prüft ihn auf verdächtige Muster. Folgende Angriffstypen werden erkannt:

### 3.1 Brute-Force-Erkennung
- **Was:** Zu viele fehlgeschlagene Login-Versuche von einer IP-Adresse
- **Schwellwert:** Mehr als 5 fehlgeschlagene Logins innerhalb von 1 Minute von der gleichen IP
- **Severity:** Critical
- **Gespeichert wird:** IP-Adresse, Zeitpunkt, Anzahl Versuche

### 3.2 SQL-Injection-Erkennung
- **Was:** Verdächtige SQL-Fragmente in Eingabefeldern (Login, Suche, Kontakt)
- **Erkannte Muster:**
  - `' OR 1=1` und Varianten
  - `UNION SELECT`
  - `DROP TABLE`
  - `; DELETE FROM`
  - `' OR '1'='1`
- **Severity:** High
- **Gespeichert wird:** IP-Adresse, Zeitpunkt, betroffenes Feld, erkanntes Muster

### 3.3 XSS-Erkennung (Cross-Site Scripting)
- **Was:** Script-Tags oder JavaScript-Code in Eingabefeldern
- **Erkannte Muster:**
  - `<script>` Tags
  - `javascript:` in Eingaben
  - Event-Handler wie `onload=`, `onerror=`, `onclick=`
- **Severity:** Medium
- **Gespeichert wird:** IP-Adresse, Zeitpunkt, betroffenes Feld, erkanntes Muster

### 3.4 Path-Traversal-Erkennung
- **Was:** Versuche auf Dateien außerhalb des erlaubten Verzeichnisses zuzugreifen
- **Erkannte Muster:**
  - `../` in URLs oder Dateinamen
  - `/etc/passwd`, `/etc/shadow` in Anfragen
- **Severity:** High
- **Gespeichert wird:** IP-Adresse, Zeitpunkt, angefragter Pfad

### 3.5 Datei-Upload-Prüfung
- **Was:** Upload von potenziell gefährlichen Dateitypen
- **Blockierte Endungen:** `.exe`, `.php`, `.sh`, `.bat`, `.cmd`, `.js`, `.py`, `.pl`, `.rb`, `.ps1`, `.psm1`, `.psd1`, `.vbs`, `.vbe`, `.wsf`, `.wsh`, `.msi`, `.msp`, `.jar`, `.jsp`, `.asp`, `.aspx`, `.cgi`, `.war`, `.com`, `.scr`, `.pif`, `.hta`, `.inf`, `.reg`, `.dll`, `.so`, `.dylib`, `.elf`, `.bin`, `.run`, `.AppImage`, `.deb`, `.rpm`
- **Erlaubte Endungen:** `.pdf`, `.png`, `.jpg`, `.jpeg`, `.gif`, `.txt`, `.doc`, `.docx`, `.csv`, `.xlsx`
- **Severity:** Medium
- **Gespeichert wird:** IP-Adresse, Zeitpunkt, Dateiname, Dateityp

### 3.6 Rate-Limiting
- **Was:** Ungewöhnlich viele Requests von einer einzelnen IP in kurzer Zeit
- **Schwellwert:** Mehr als 50 Requests innerhalb von 1 Minute von der gleichen IP
- **Severity:** Medium
- **Gespeichert wird:** IP-Adresse, Zeitpunkt, Anzahl Requests

---

## 4. Security Dashboard

Das Dashboard ist ein geschützter Bereich der nur nach Login sichtbar ist. Es hat folgende Ansichten:

### 4.1 Übersichtsseite
- Anzahl Events heute (als Zahl in einer Karte)
- Anzahl kritischer Alerts (als Zahl in einer Karte)
- Balkendiagramm: Events pro Stunde (letzte 24 Stunden)
- Tortendiagramm: Verteilung nach Angriffstyp

-> Gibt's ja viele React Templates etc. die frei verfügbar sind

### 4.2 Event-Log
- Tabelle mit allen Security-Events
- Spalten: Zeitpunkt, Typ (SQL Injection, XSS, etc.), IP-Adresse, Pfad, Severity
- Sortiert nach Zeitpunkt (neueste oben)
- **Kein** Filtern, **kein** Suchen, **keine** Pagination (wir zeigen einfach die letzten 100)

### 4.3 Alert-Ansicht
- Liste der ausgelösten Alerts (z.B. "Brute Force von 192.168.1.5 erkannt")
- Spalten: Zeitpunkt, Alert-Typ, Beschreibung, Severity
- Sortiert nach Zeitpunkt (neueste oben)
- **Keine** Benachrichtigungen, **kein** "Alert bestätigen/schließen"

---

## 5. Datenmodell

### Security Event
| Feld | Typ | Beschreibung |
|------|-----|-------------|
| id | Integer | Eindeutige ID (automatisch) |
| timestamp | DateTime | Zeitpunkt des Events |
| event_type | String | Art des Events (sql_injection, xss, brute_force, path_traversal, bad_upload, rate_limit) |
| source_ip | String | IP-Adresse des Absenders |
| path | String | Angefragter URL-Pfad |
| detail | String | Zusätzliche Info (z.B. erkanntes Muster) |
| severity | String | low, medium, high, critical |

### Alert
| Feld | Typ | Beschreibung |
|------|-----|-------------|
| id | Integer | Eindeutige ID (automatisch) |
| timestamp | DateTime | Zeitpunkt des Alerts |
| alert_type | String | Art des Alerts (brute_force, rate_limit) |
| source_ip | String | IP-Adresse |
| message | String | Beschreibung was passiert ist |
| severity | String | low, medium, high, critical |

### User (für Login)
| Feld | Typ | Beschreibung |
|------|-----|-------------|
| id | Integer | Eindeutige ID (automatisch) |
| username | String | Benutzername |
| hashed_password | String | Gehashtes Passwort |
| role | String | user oder admin |

---

## 6. Tech-Stack

- **Frontend:** Next.js + React + TypeScript + Tailwind CSS
- **Backend:** Python + FastAPI
- **Datenbank:** SQLite (über SQLModel)
- **Versionsverwaltung:** Git + GitHub

---

## 7. Was explizit NICHT im Scope ist

Damit es keine Missverständnisse gibt, hier nochmal zusammengefasst was wir bewusst NICHT bauen:

- Keine Benutzerregistrierung (Test-Accounts werden fest angelegt)
- Keine Passwort-vergessen-Funktion
- Keine E-Mail-Versendung
- Keine Echtzeit-Push-Benachrichtigungen
- Kein aktives Blockieren von Angriffen (nur Erkennung und Logging)
- Clientseitiges verhindern von Angriffen (Verarbeitung von Eingaben) → Alles wird primitiv ans Backend weitergegeben
- Keine mobile-optimierte Ansicht
- Keine Pagination, Filterung oder Suche im Event-Log
- Keine Mehrsprachigkeit
- Keine automatische Anomalie-Erkennung mit Machine Learning
- Keine HTTPS/TLS-Konfiguration (läuft lokal über HTTP)
- Kein Deployment auf einem Server (läuft lokal)

---

## 8. Abnahmekriterien

So kann man prüfen ob das Projekt fertig ist:

1. Die Firmenwebseite hat eine Startseite, Login, Kontaktformular, Datei-Upload und Suchfeld
2. Man kann sich mit einem Test-Account einloggen
3. Wenn man SQL-Injection im Login-Feld eingibt (z.B. `' OR 1=1 --`) wird ein Event geloggt
4. Wenn man ein `<script>` Tag ins Kontaktformular eingibt wird ein Event geloggt
5. Wenn man 5x das falsche Passwort eingibt wird ein Brute-Force-Alert erzeugt
6. Wenn man eine .exe Datei hochladen will wird ein Event geloggt
7. Wenn man `../etc/passwd` in die URL eingibt wird ein Event geloggt
8. Das Dashboard zeigt die Events als Tabelle an
9. Das Dashboard zeigt ein Balkendiagramm mit Events pro Stunde an
10. Das Dashboard zeigt die Verteilung der Angriffstypen als Tortendiagramm an
11. Das Dashboard zeigt ausgelöste Alerts an
12. Der Code liegt in einem GitHub-Repository mit nachvollziehbarer Commit-History

---
