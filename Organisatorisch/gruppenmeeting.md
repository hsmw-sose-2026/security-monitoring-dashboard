## 1. Finale Rollenverteilung

Aktueller Stand (basierend auf der Abstimmung):

**Niklas + Kevin - Frontend Dashboard**
- `Frontend/src/app/dashboard/page.tsx` (Übersicht)
- `Frontend/src/app/dashboard/events/page.tsx` (Event-Log)
- `Frontend/src/app/dashboard/alerts/page.tsx` (Alerts)
- Charts, Statistiken, Event-Tabelle

**Sophia + Jannis - Frontend Firmenseiten**
- `Frontend/src/app/page.tsx` (Startseite, schon angelegt)
- `Frontend/src/app/login/page.tsx` (Sophia)
- `Frontend/src/app/upload/page.tsx` (Jannis)
- `Frontend/src/app/contact/page.tsx` (Sophia)
- `Frontend/src/app/search/page.tsx` (Jannis)

**Tim + Jonas - Backend API + Datenbank**
- `Backend/app/main.py` (Jonas)
- `Backend/app/models.py` (Tim + Jonas)
- `Backend/app/database.py` (Tim)
- `Backend/app/routes/auth.py` (Tim)
- `Backend/app/routes/dashboard.py`(Jonas)

**Niklas + Kevin - Backend Firmenseiten-Endpoints**
- `Backend/app/routes/upload.py` (Kevin)
- `Backend/app/routes/contact.py` (Niklas)
- `Backend/app/routes/search.py` (Kevin)

**Tim + Jonas - Security Erkennung**
- `Backend/app/middleware/security.py` (Tim)
- `Backend/app/services/detection.py` (Jonas)

**Sophia + Jannis - Dokumentation + Testdaten**
- `Organisatorisch/` (Anforderungskatalog, Roadmap, Rollenverteilung updaten)
- `README.md`
- Testdaten / Seed-Script falls nötig

---

## 2. Erwartungen an den Code

Wir bauen einen **Prototyp**, keinen Production-Code:

- Code muss **funktionieren**, nicht perfekt sein
- Keine Optimierung am Anfang (kommt später, oder gar nicht)
- Hauptsache nachvollziehbar und erklärbar 

---

## 3. Jetziger Stand

Wer hat sich mit was befasst
- Tutorial durchgearbeitet?
- Entwicklungsumgebung steht?
- Erste Datei ausprobiert?
- Wo gibt's Fragen?


---

## 4. Ziele bis zum 27.

**Backend:**
- FastAPI Server startet
- Datenbank-Tabellen sind da (User, SecurityEvent, Alert)
- Login-Endpoint funktioniert mit Test-Account
- Mindestens ein Endpoint für Firmenseiten (z.B. `/api/contact` oder `/api/search`)
- Security Middleware Grundgerüst steht
- Mindestens 1 Erkennungstyp funktioniert (z.B. SQL Injection im Login)

**Frontend:**
- Startseite mit Navigation steht
- Login-Seite mit funktionierendem Formular
- Mindestens eine weitere Firmenseite (z.B. Kontakt)
- Erste Dashboard-Seite die zumindest Dummy-Daten anzeigt

**Allgemein:**
- Code liegt im Repo, jeder hat schon mal committet (auch wenn klein)
- README erklärt grob wie man Backend und Frontend startet

**Konkret:** Bei der Demo am 27.04. wollen wir zeigen können:
1. Server starten
2. Firmenseite öffnen
3. Login-Versuch mit `' OR 1=1 --` ins Login-Feld machen
4. Im Dashboard taucht das Event auf

---

## 5. Git Workflow

Falls noch nicht jeder weiß wie das mit Git/GitHub geht:

- https://www.youtube.com/watch?v=a0_AcknhqDY


Wichtig: **Nie direkt auf main pushen.** Immer über Branch + PR.

-  Ich schicke noch Cheatsheet in den Discord

---


## 6. Doku / Präsentation für 27.04.

Wer baut die Folien fürs nächste Konsultationsmeeting?

Vorschlag: Sophia + Jannis übernehmen das (passt zu ihrem Doku-Bereich), wir anderen liefern Stichpunkte zu was wir gemacht haben.

---

## 7. Zeiterfassung

- Jeder seine Stunden individuell eintragen

---
