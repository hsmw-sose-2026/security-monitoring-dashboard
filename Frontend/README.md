# Security Monitoring Dashboard

## Frontend - Website 

## Beschreibung

Die Website dient als Demo und Angriffsfläche von Attacken. Es gibt verschiedene Seiten mit unterschiedlichen Funktionen: 

- die Login Seite ist die Haupt-Angriffsfläche, dabei wird das Eingabefeld vom Benutzername und Passwort genutzt
- die Startseite als Darstellung einer normalen Firmen Website und Weiterleitung an die weiteren Funktionen
- ein Kontaktformular mit der ein Dummy-User eine Nachricht senden kann, welche im Backend gespeichert wird
- ein Datei-Uplaod womit auch eine Datei ans Backend gesendet werden 

**Zweck:**
Mehrere Angriffsflächen durch verschiedene Eingabeflächen und Arten, welche überwacht werden um Attacken festzustellen und darzustellen.

---

## Mitwirkende

- Name: Sophia, Bereich: Frontend, Zuständigkeit: Website Developer
- Name: Jannis, Bereich Frontend/Backend, Zuständigkeit: Suche, Datei-Upload

## Citation

Preferred citation (Style name):
```
[LastName1], [FirstName1]; [LastName2], [FirstName2]; [LastName3], [FirstName3]; etc. (YYYY). "[Title of Article or Dataset]". Journal name, and journal information (e.g., volume, issue, page numbers) [DOI link to publication]
```
DOI: https://doi.org/...

## Projektstruktur

Die einzelnen Order mit Login, Contact, Upload und Impressum beinhalten die verschiedenen Websites.
Die Datei page.tsx im app Verzeichnis ist die Startseite und verbinden alle Websites

```
Frontend
├─ public
└─ src
   ├── app
   │   ├── login
   │   │   └── loginpage.tsx
   │   │   └── page.tsx
   │   ├── contact
   │   │   └── contactpage.tsx
   │   │   └── page.tsx
   │   ├── upload   
   │   │   └── uploadpage.tsx
   │   │   └── page.tsx
   │   ├── impressum
   │   │   └── impressum.tsx
   │   │   └── page.tsx   
   │   ├── favicon.ico
   │   ├── globals.css
   │   ├── page.tsx
   │   └── layout.tsx   
   └── components

```

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

*Testing:*

- [Bun](https://bun.sh/)


## zusätzliches

Adding additional notes about the project or dataset that didn't fit into the other sections.
