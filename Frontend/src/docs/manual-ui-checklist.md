# Security Monitoring Dashboard – UI Checkliste

Schritt-für-Schritt-Anleitung zum Durchführen aller Demo-Angriffe und Funktionen.

---

## 1. Login

**Seite:** `/login`

### 1.1 Normaler Login (User)
1. Benutzername und Passwort eines regulären Nutzers eingeben
2. „Anmelden" klicken → Weiterleitung zur Startseite

### 1.2 Normaler Login (Admin)
1. Benutzername und Passwort des Admin-Nutzers eingeben
2. „Anmelden" klicken → Weiterleitung zur Startseite
3. Seitenleiste zeigt zusätzlich den **Dashboard**-Link

### 1.3 Falsches/Kein Passwort Testen
1. falsches Passwort testen → Fehlermeldung
2. ohne Login /dashboard öffnen → sollte zurück zu /login

### 1.5 Demo-Angriff: SQL-Injection
1. Schaltfläche **„SQL-Injection simulieren"** klicken
2. Benutzernamefeld füllt sich automatisch mit `' OR '1'='1' --`
3. → Anfrage wird ans Backend gesendet
4. Im Dashboard sollte ein SQL-Injection-Event erscheinen

---

## 2. Navigation

**Seite:** 

1. Links:
   - **Startseite** `/`
   - **Datei Upload** `/upload`
   - **Kontakt** `/contact`
   - **Dashboard** `/dashboard` – sollte auf allen Seiten mit **Admin-Login** erscheinen
2. „Logout"-Button oben rechts → leert localStorage, leitet zu `/login` weiter, sollte access_token löschen

---

## 3. Kontaktformular

**Seite:** `/contact`

### 3a. Normale Nachricht senden
1. Name, Benutzername, E-Mail und Nachricht ausfüllen
2. „Senden" klicken → Toast „Nachricht gesendet" erscheint
3. Felder leeren sich automatisch

### 3b. Demo-Angriff: XSS
1. Schaltfläche **„XSS-Angriff simulieren"** klicken
2. Alle Felder füllen sich automatisch mit XSS-Payloads:
   - Name: `<img src=x onerror=alert("XSS")>`
   - Nachricht: `<script>document.cookie</script>`
3. → Daten werden ans Backend gesendet
4. Im Dashboard sollte ein XSS-Event erscheinen

---

## 4. Datei-Upload

**Seite:** `/upload`

### 4a. Normaler Upload
1. Klick auf den gestrichelten Bereich oder „Dateien auswählen"
2. Beliebige erlaubte Datei auswählen
3. „Hochladen" klicken → Erfolgs-Toast erscheint

### 4b. Demo-Angriff: Schädliche Datei (.exe)
1. Schaltfläche **„Schädliche Datei laden (demo-attack.exe)"** klicken
2. Die Datei `demo-attack.exe` wird aus `/public` geladen und in die Dateiliste eingefügt
3. → Backend lehnt die Datei ab (Dateiendung nicht erlaubt)
4. Response sollte `status: rejected` und `reason: extension_blocked` sein
5. Im Dashboard sollte ein `bad_upload` erscheinen

---

## 5. Suche (SearchBar)

**Seite:** `/` (Startseite, Header)

### 5a. Normale Suche
1. In das Suchfeld tippen → Dropdown mit passenden Vorschlägen erscheint
2. → Weiterleitung zu `/search?q=...`

### 5b. Demo-Angriff: XSS
1. Schaltfläche **„XSS-Demo"** klicken
2. Suchfeld füllt sich automatisch mit `<script>alert("XSS")</script>`
3. → Anfrage wird ans Backend gesendet
4. Im Dashboard sollte ein XSS-Event in der Suche erscheinen

---

## 6. Dashboard

**Seite:** `/dashboard` *( Admin-Login )*

1. Dashboard-Link in der Seitenleiste anklicken
2. Attacken: zeigt eine Tabelle mit allen geloggten Angriffen mit: Zeitraum, Dauer, Eventanzahl, Klassifizierung, Source IP, Severity, Risk Score
3. **Filter**:
   - Zeitraum (Start- & Enddatum + Uhrzeit)
   - Klassifizierung 
   - Source IP
   - Severity
4. Nach Demo-Angriffen prüfen, ob die entsprechenden Events in der Liste auftauchen
5. Weitere Funktionen testen:
   - Events
     - Aufzeichnung aller vorherigen geloggten Events
   - Alerts
     - z.b. Multi-Vector-Angriffe
   - Statistiken
     - prüfen, ob Karten Werte anzeigt werden:
       - Events heute
       - Alerts heute
       - Uploads heute
       - Contact Messages heute
       - kritische Alerts
   - Rules
     - Bearbeitung und Anzeige der Regeln

---

## 7. Rules-Seite

**Seite:** `/dashboard/rules` 

### 7a. Regeln anzeigen
1. Tabelle zeigt alle Regelklassen mit ihren Regeln
2. Spalten: Name, Event-Type, Severity-Badge, Enabled-Checkbox

### 7b. Regel bearbeiten
1. Genau eine Regel per Checkbox auswählen
2. „Bearbeiten"-Button → Edit-Modal öffnet sich
3. → Regel wird aktualisiert

### 7c. Neue Klasse / Neue Regel anlegen
1. **„Neue Klasse"** → Modal ausfüllen → Klasse erscheint in der Tabelle
2. **„Neue Regel"**  → Klasse wählen, Felder ausfüllen → Regel erscheint unter der gewählten Klasse

### 7d. Löschen
1. Klassen und/oder Regeln per Checkbox auswählen
2. „Löschen"-Button → ausgewählte Einträge werden entfernt