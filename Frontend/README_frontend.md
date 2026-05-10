# Security Monitoring Dashboard

## Frontend - Website

## Beschreibung

Die Website dient als Demo und Angriffsfläche von Attacken. Es gibt verschiedene Seiten mit unterschiedlichen Funktionen:

- die Login Seite ist die Haupt-Angriffsfläche, dabei wird das Eingabefeld von Benutzername und Passwort genutzt
- die Startseite als Darstellung einer normalen Firmen Website und Weiterleitung an die weiteren Funktionen
- ein Kontaktformular, mit dem ein Dummy-User eine Nachricht senden kann, welche im Backend gespeichert wird
- ein Datei-Upload, womit auch eine Datei ans Backend gesendet werden kann

**Zweck:**
Mehrere Angriffsflächen durch verschiedene Eingabeflächen und Arten, welche überwacht werden, um Attacken festzustellen und darzustellen.

---

## Mitwirkende

- Name: Sophia, Bereich: Frontend, Zuständigkeit: Website Developer
- Name: Jannis, Bereich: Frontend/Backend, Zuständigkeit: Suche, Datei-Upload
- Name: Niklas, Bereich: Frontend, Zuständigkeit: Dashboard

## Projektstruktur

Die einzelnen Ordner mit Login, Contact, Upload und Impressum beinhalten die verschiedenen Websites.
Die Datei `page.tsx` im `app` Verzeichnis ist die Startseite und verbindet alle Websites.

```
Frontend
│   favicon.ico
│   globals.css
│   layout.tsx
│   page.tsx
│
├───contact
│       contactpage.tsx
│       page.tsx
│
├───dashboard
│   │   class-override.tsx
│   │   globals.css
│   │   layout.tsx
│   │   page.tsx
│   │
│   ├───alerts
│   │       page.tsx
│   │
│   ├───components
│   │       ModalAdd.tsx
│   │       ModalEdit.tsx
│   │
│   ├───events
│   │       page.tsx
│   │
│   └───rules
│           page.tsx
│           rules.tsx
│
├───impressum
│       impressum.tsx
│       page.tsx
│
├───login
│       loginpage.tsx
│       page.tsx
│
└───upload
        page.tsx
        uploadpage.tsx

```

## Dashboard-Frontend

Der Dashboard-Bereich liegt unter `/dashboard` und soll Events, Alerts, Angriffe und Statistiken aus dem Backend anzeigen.

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

**Testing:**

- [Bun](https://bun.sh/)


## Hinweise

Die Backend-URL wird über `.env.local` gesetzt:

```text
NEXT_PUBLIC_API_URL=http://localhost:8000
```