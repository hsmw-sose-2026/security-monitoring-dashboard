# Security Monitoring Dashboard

## Frontend – Website

## Beschreibung

Die Website dient als Demo und Angriffsfläche von Attacken. Es gibt verschiedene Seiten mit unterschiedlichen Funktionen:

- **Login:** Haupt-Angriffsfläche; Benutzername- und Passwortfeld werden für SQL-Injection-Demos genutzt
- **Startseite:** Darstellung einer normalen Firmenwebsite mit Weiterleitung zu den weiteren Funktionen; Suchleiste mit XSS-Demo
- **Kontaktformular:** Dummy-User kann eine Nachricht senden, die im Backend gespeichert wird; XSS-Demo über alle Felder
- **Datei-Upload:** Datei wird ans Backend gesendet; Demo lädt eine `.exe`-Datei aus dem `public`-Ordner
- **Suche:** Suchleiste im Header mit Autovervollständigung; XSS-Demo füllt das Feld mit einem Script-Payload
- **Dashboard:** Nur für Admins erreichbar; zeigt geloggte Angriffe, Events, Alerts und Statistiken aus dem Backend
- **Rules:** Verwaltung von Erkennungsregeln und Regelklassen mit Modalen zum Anlegen, Bearbeiten und Löschen

**Zweck:**
Mehrere Angriffsflächen durch verschiedene Eingabefelder und Eingabearten, die überwacht werden, um Angriffe festzustellen und darzustellen.

---

## Mitwirkende

- Name: Sophia, Bereich: Frontend, Zuständigkeit: Website Developer
- Name: Jannis, Bereich: Frontend/Backend, Zuständigkeit: Suche, Datei-Upload
- Name: Niklas, Bereich: Frontend, Zuständigkeit: Dashboard

---

## Projektstruktur

```
Frontend
│   favicon.ico
│   globals.css
│   layout.tsx
│   page.tsx                        ← Startseite
│
├───contact
│       contactpage.tsx
│       page.tsx
│
├───dashboard
│   │   class-override.tsx
│   │   globals.css
│   │   layout.tsx                  ← Admin-Guard + Dark-Mode-Root
│   │   page.tsx                    ← Angriffs-Übersicht (Tabelle mit Filtern)
│   │
│   ├───alerts
│   │       page.tsx
│   │
│   ├───components
│   │       ModalAddClass.tsx
│   │       ModalAddRule.tsx
│   │       ModalAdd.tsx
│   │       ModalEdit.tsx
│   │       ModalForensicDetails.tsx  ← Detail-Modal für ML-detektierte Payloads
│   │
│   ├───events
│   │       page.tsx
│   │
│   ├───forensic                      ← Forensik-Seite zu ML-Payloads
│   │       ForensicEvent.tsx
│   │       page.tsx
│   │
│   ├───rules
│   │       page.tsx
│   │       rules.tsx               ← Regelklassen & Regeln
│   │
│   └───stats
│           page.tsx
│
├───hooks
│       useDarkMode.ts
│
├───impressum
│       impressum.tsx
│       page.tsx
│
├───login
│       loginpage.tsx
│       page.tsx
│
├───search
│       page.tsx
│       searchpage.tsx
│
└───upload
        page.tsx
        uploadpage.tsx

src/components                       ← Wiederverwendbare UI-Komponenten
├───SearchBar.tsx
├───dashboard/                       ← Dashboard-Widgets (event/alert/attack rows, charts, kpi cards, nav-bar)
└───ui/                              ← Generische UI-Primitives (button, card, input, dialog, ...)

src/lib/dashboard.ts                ← Typen & Fetch-Helper fürs Dashboard
src/types/dashboard.ts              ← Shared Typen
src/actions/getBackendHost.ts       ← Backend-URL Helper
```

---

## Seiten im Detail

### Startseite (`/`)

Normale Firmenwebsite mit Neuigkeiten und Dienstleistungen. Im Header befindet sich die Suchleiste.

### Login (`/login`)

Anmeldemaske mit Benutzername und Passwort. Nach erfolgreichem Login wird die Rolle (`user` / `admin`) im `localStorage` gespeichert. Admins sehen zusätzlich den Dashboard-Link in der Seitenleiste.

### Kontaktformular (`/contact`)

Formular mit den Feldern Name, Benutzername, E-Mail und Nachricht. Die Eingaben werden per POST ans Backend gesendet und dort gespeichert.

### Datei-Upload (`/upload`)

Mehrere Dateien können gleichzeitig ausgewählt und hochgeladen werden. Das Backend prüft die Dateiendung und antwortet mit `status: uploaded` oder `status: rejected | reason: extension_blocked`. Die Antwort wird farbig in der UI angezeigt (grün / rot).

### Suche (`/search`)

Die Suchleiste im Header ist auf allen Seiten sichtbar. Sie zeigt ein Dropdown mit statischen Vorschlägen und leitet bei Eingabe auf `/search?q=...` weiter.

### Dashboard (`/dashboard`) — nur für Admins

Zeigt alle vom Backend geloggten Angriffe in einer gefilterbaren Tabelle. Verfügbare Filter:

- Zeitraum (Start- und Enddatum mit Uhrzeit)
- Klassifizierung (Dropdown)
- Source IP (Freitext)
- Severity (Dropdown)

Weitere Unterseiten: Events (`/dashboard/events`), Alerts (`/dashboard/alerts`), Statistiken (`/dashboard/stats`), Forensik (`/dashboard/forensic`).

### Forensik (`/dashboard/forensic`) — nur für Admins

Zeigt die vom ML-Detektor erkannten Payloads an. Pro Event sind Original-Payload, Decode-Schritte (URL-/HTML-/Hex-/NFKC-Normalisierung), Score und Erkärung sichtbar. Über das Detail-Modal (`ModalForensicDetails`) lassen sich die einzelnen Decoding-Stufen nachvollziehen.

### Rules (`/dashboard/rules`) — nur für Admins

Verwaltung der Erkennungsregeln. Regelklassen lassen sich auf- und zuklappen (Accordion). Jede Regel zeigt Name, Event-Type, Severity-Badge und Enabled-Status.

**Aktionen:**
- **Neue Klasse** – öffnet `ModalAddClass`, legt eine neue Regelklasse an
- **Neue Regel** – öffnet `ModalAddRule`, fügt eine Regel einer bestehenden Klasse hinzu
- **Bearbeiten** – öffnet `ModalEdit` für die ausgewählte Regel (genau eine Regel muss selektiert sein)
- **Löschen** – entfernt alle ausgewählten Klassen und Regeln
- **Alle auswählen / Auswahl aufheben** – Schnellauswahl für alle Einträge

---

## Demo-Angriffs-Buttons

Auf mehreren Seiten gibt es rote „Demo-Angriff"-Buttons, die typische Angriffsmuster automatisch einfügen, damit diese nicht manuell eingegeben werden müssen:

| Seite               | Angriff          | Payload              |
|---                  |---               |---                   |
| Login               | SQL-Injection    | `' OR '1'='1' --` im Benutzernamefeld |
| Kontakt             | XSS              | `<img src=x onerror=alert("XSS")>` und `<script>document.cookie</script>` in Name/Nachricht |
| Upload              | Schädliche Datei | lädt `demo-attack.exe` aus `/public` in die Dateiliste |
| Startseite (Header) | XSS in Suche     | `<script>alert("XSS")</script>` ins Suchfeld |

Die Demo-Datei `demo-attack.exe` liegt unter `public/demo-attack.exe` und enthält nur Klartext – sie wird vom Backend anhand der Dateiendung als `extension_blocked` abgelehnt.

---

## Methoden und genutzte Tools

**Framework:**

- Entwicklungsumgebung: VS Code
- [Node.js](https://nodejs.org/) (NPM)
- [Next.js](https://nextjs.org/docs)
- [React](https://react.dev/learn)
- [TypeScript](https://www.typescriptlang.org/docs)

**Styling:**

- [Tailwind CSS](https://tailwindcss.com)
- Icons: [Tabler Icons](https://tabler.io/icons)

**Bibliotheken:**

- [Recharts](https://recharts.org/) – Diagramme in der Stats-Seite
- [Sonner](https://sonner.emilkowal.ski/) – Toast-Benachrichtigungen

**Testing:**

- [Bun](https://bun.sh/)

---

## Hinweise

Die Backend-URL wird über `.env.local` gesetzt:

```text
NEXT_PUBLIC_API_URL=http://localhost:8000
```