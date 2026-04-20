## 1. Finale Rollenverteilung

Die war bisher nur "vorläufig". Heute wird das verbindlich, damit jeder weiß welche Dateien ihm gehören. Falls jemand doch nicht zufrieden mit seinem Bereich ist, lieber jetzt sagen als später.

Aktueller Stand (basierend auf der Abstimmung):

**Niklas - Frontend Dashboard**
- `Frontend/src/app/dashboard/page.tsx` (Übersicht)
- `Frontend/src/app/dashboard/events/page.tsx` (Event-Log)
- `Frontend/src/app/dashboard/alerts/page.tsx` (Alerts)
- Charts, Statistiken, Event-Tabelle

**Sophia + Jannis - Frontend Firmenseiten**
- `Frontend/src/app/page.tsx` (Startseite, schon angelegt)
- `Frontend/src/app/login/page.tsx` (schon angelegt)
- `Frontend/src/app/upload/page.tsx`
- `Frontend/src/app/contact/page.tsx`
- `Frontend/src/app/search/page.tsx`

**Tim + Jonas - Backend API + Datenbank**
- `Backend/app/main.py`
- `Backend/app/models.py`
- `Backend/app/database.py`
- `Backend/app/routes/auth.py`
- `Backend/app/routes/dashboard.py`

**Niklas + Kevin - Backend Firmenseiten-Endpoints**
- `Backend/app/routes/upload.py`
- `Backend/app/routes/contact.py`
- `Backend/app/routes/search.py`

**Tim + Jonas - Security Erkennung**
- `Backend/app/middleware/security.py`
- `Backend/app/services/detection.py`

**Sophia + Jannis - Dokumentation + Testdaten**
- `Organisatorisch/` (Anforderungskatalog, Roadmap, Rollenverteilung)
- `README.md`
- Testdaten / Seed-Script falls nötig

**Kevin** - hat sich noch nicht zurückgemeldet, müssen wir heute final klären.

---

## 2. Erwartungen an den Code

Wichtig dass alle wissen: Wir bauen einen **Prototyp**, keinen Production-Code. Das heißt:

- Code muss **funktionieren**, nicht perfekt sein
- Lieber 5 Zeilen die laufen, als 50 Zeilen die "schöner" sind aber nicht fertig
- Keine Optimierung am Anfang (kommt später, oder gar nicht)
- Hauptsache nachvollziehbar und erklärbar - jeder muss seinen Code Zeile für Zeile erklären können

Niemand muss sich rechtfertigen wenn der Code nicht "schön" ist.

---

## 3. Stand checken

Kurze Runde wer was diese Woche schon gemacht/angeschaut hat:
- Tutorial durchgearbeitet?
- Entwicklungsumgebung steht?
- Erste Datei ausprobiert?
- Wo gibt's Fragen?

Wer noch nicht angefangen hat: kein Problem, aber dann lieber sagen damit wir wissen wo wir helfen müssen.

---

## 4. Konkrete Ziele bis 27.04. (nächster Konsultationstermin)

Damit der Prof am 27. was zu sehen bekommt:

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
- Anforderungskatalog ist final

**Konkret:** Bei der Demo am 27.04. wollen wir zeigen können:
1. Server starten
2. Firmenseite öffnen
3. Login-Versuch mit `' OR 1=1 --` ins Login-Feld machen
4. Im Dashboard taucht das Event auf

Das ist machbar, wenn jeder seinen Teil zieht.

---

## 5. Git Workflow

Falls noch nicht jeder weiß wie das mit Git/GitHub geht:

Statt Theorie hier ein gutes deutsches Video das die Basics in 15 Min erklärt:

- https://www.youtube.com/results?search_query=git+github+tutorial+deutsch+anf%C3%A4nger

Bzw. konkret können wir auch das gemeinsam mal kurz durchgehen wenn alle dabei sind:
- Repo klonen
- Branch erstellen (`git checkout -b feature/login-page`)
- Commit machen (`git add .`, `git commit -m "..."`)
- Push (`git push origin feature/...`)
- Pull Request auf GitHub erstellen

Wichtig: **Nie direkt auf main pushen.** Immer über Branch + PR.

---

## 6. Bei Problemen / Fragen

Damit wir Zeit sparen und alle was lernen:

Bei Problemen lieber im Discord `#hilfe` Channel posten als privat fragen. So sehen alle die Lösung und müssen das Problem nicht doppelt lösen.

Außerdem: AI ist erlaubt (Cursor, ChatGPT etc.). Wer das nutzt, sollte den Code aber wirklich verstehen, weil der Prof gesagt hat jeder muss seinen Code Zeile für Zeile erklären können.

---

## 7. Pair Programming?

Der Prof hat im Konzept geschrieben dass Pair Programming gewünscht ist. Wollen wir das so machen, dass die 2er-Teams (z.B. Tim+Jonas, Sophia+Jannis) sich auch mal zusammensetzen und gemeinsam coden?

---

## 8. Doku / Präsentation für 27.04.

Wer baut die Folien fürs nächste Konsultationsmeeting?

Vorschlag: Sophia + Jannis übernehmen das (passt zu ihrem Doku-Bereich), wir anderen liefern Stichpunkte zu was wir gemacht haben.

---

## 9. Zeiterfassung

Der Prof will am Ende Zeiterfassungsbögen sehen (150h pro Person). Wie machen wir das?

Vorschlag: Eine geteilte Tabelle (Excel oder Google Sheets) wo jeder seine Stunden einträgt. Lieber jetzt aufsetzen als am Ende schätzen müssen.

---

## 10. Optional: Modulares Erkennungssystem

Der Prof will ein generisches System wo man später einfach neue Erkennungsregeln hinzufügen kann. Kurz besprechen ob alle mitkönnen oder ob das eher Tim und ich allein bauen und die anderen später Regeln nachliefern.

---

## Was wir NICHT diskutieren sollten

- Über die hohen Erwartungen vom Prof jammern
- Tech-Stack nochmal in Frage stellen (haben wir schon entschieden)
- Stundenlang über UI-Details streiten

Lieber: Klare Zuordnungen, klare Ziele, dann jeder loslegen.
