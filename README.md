# Security Monitoring Dashboard

## Projekt 

## Beschreibung

Alte Anforderungen: 

(In diesem Projekt soll ein Prototyp für ein Security-Monitoring-System entwickelt werden, das sicherheitsrelevante Ereignisse einer Webanwendung erfasst, analysiert und visualisiert. Ziel ist es, typische Vorfälle wie fehlgeschlagene Login-Versuche, verdächtige Request-Muster, Rechteverletzungen oder ungewöhnliche Zugriffe automatisiert zu erkennen und in einem Dashboard aufzubereiten.

Hierfür soll zunächst eine einfache Webanwendung mit Logging-Komponente aufgebaut oder eine bestehende Testanwendung erweitert werden. Anschließend sollen sicherheitsrelevante Ereignisse strukturiert erfasst, gespeichert und über definierte Regeln ausgewertet werden. Die Ergebnisse sollen in einer Oberfläche dargestellt werden, sodass Administratoren Angriffe oder Auffälligkeiten schnell nachvollziehen können. Optional kann das System um Benachrichtigungen oder einfache Anomalie-Erkennung erweitert werden.)

Momentaner Stand: ... 

**Backend:**


**Frontend:**
Die Website dient als Demo und Angriffsfläche von Attacken. Es gibt verschiedene Seiten mit unterschiedlichen Funktionen: 

- die Login Seite ist die Haupt-Angriffsfläche, dabei wird das Eingabefeld vom Benutzername und Passwort genutzt
- die Startseite als Darstellung einer normalen Firmen Website und Weiterleitung an die weiteren Funktionen
- ein Kontaktformular mit der ein Dummy-User eine Nachricht senden kann, welche im Backend gespeichert wird
- ein Datei-Uplaod womit auch eine Datei ans Backend gesendet werden 
*Zweck:*
Mehrere Angriffsflächen durch verschiedene Eingabeflächen und Arten, welche überwacht werden um Attacken festzustellen und darzustellen.

---

## Mitwirkende

- Jonas -> Backend  |
- Tim   -> Backend  |
- Niklas-> Frontend |
- Kevin -> Backend  |
- Sophia-> Frontend | Website Developer, ...
- Jannis-> Frontend/Backend | Suche, Datei-Upload, ...

## Projektstruktur

...

**Backend:**

**Frontend:**
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

**Backend:**

- Python (FastAPI), Node.js
  
- *Versionsverwaltung:* Git + GitHub
- *Datenbank:* SQLite (für Prototyp), optional PostgreSQL
- *Logging & Monitoring:* JSON-Logs, strukturierte Ereignisprotokolle

**Frontend:**

*Framework:*
- [Node.js](https://nodejs.org/)  
- [Next.js](https://nextjs.org/docs) 
- [React](https://react.dev/learn) 
- [TypeScript](https://www.typescriptlang.org/docs)

- *Styling:* [Tailwind CSS](https://tailwindcss.com)



## zusätzliches

Adding additional notes about the project or dataset that didn't fit into the other sections.

