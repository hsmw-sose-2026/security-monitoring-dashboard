# Roadmap (Entwurf)

Grobe Roadmap orientiert an den Konsultationsterminen. Gerne noch anpassen wenn ihr wollt:

---

## Phase 1: Grundgerüst (13.04. – 26.04.)

**Ziel:** Grundgerüst steht, erste Funktionen laufen.

- Entwicklungsumgebung bei allen einrichten (Python, Node.js, Git)
- Jeder arbeitet Tutorial für seinen Bereich durch
- Backend: FastAPI Server läuft, Datenbank-Tabellen angelegt, erster Endpoint (z.B. Login)
- Frontend: React-Projekt aufgesetzt, Routing steht, erste Seite sichtbar (z.B. Startseite + Login)
- Security: Middleware-Grundgerüst, erster Erkennungstyp funktioniert (z.B. SQL Injection)

**Ergebnis fürs Meeting am 27.04.:** Man kann den Server starten, eine Seite sehen, und ein Login-Formular abschicken. Mindestens eine Angriffsart wird erkannt und geloggt.

---

## Phase 2: Kernfunktionen (27.04. – 10.05.)

**Ziel:** Kernfunktionen fertig, Dashboard zeigt echte Daten.

- Backend: Alle Endpoints fertig (Login, Upload, Kontakt, Suche, Dashboard-Daten)
- Frontend: Alle Firmenseiten fertig (Login, Upload, Kontakt, Suche)
- Frontend: Dashboard zeigt Events als Tabelle an
- Security: Alle Erkennungstypen implementiert (SQL Injection, XSS, Brute Force, Path Traversal, Upload-Check, Rate Limiting)

**Ergebnis fürs Meeting am 11.05.:** Alle Seiten funktionieren, alle Angriffsarten werden erkannt, Dashboard zeigt die Events an.

---

## Phase 3: Prototyp I + Evaluation vorbereiten (11.05. – 31.05.)

**Ziel:** Erster vorzeigbarer Prototyp, Charts im Dashboard, Evaluation planen.

- Frontend: Dashboard mit Charts (Balkendiagramm Events/Stunde, Tortendiagramm Angriffstypen)
- Frontend: Alert-Ansicht im Dashboard
- Alles zusammenführen und End-to-End testen
- Bekannte Bugs fixen
- Evaluationsdurchführung planen (wie testen wir das System, was zeigen wir?)

**Ergebnis fürs Meeting am 01.06.:** Funktionierender Prototyp den man live vorführen kann. Angriff auf die Firmenseite → Event taucht im Dashboard auf.

---

## Phase 4: Prototyp II + Evaluation (01.06. – 14.06.)

**Ziel:** Finaler Prototyp, Evaluation durchgeführt, letzte Verbesserungen.

- Evaluation durchführen (Testszenarien durchspielen, Ergebnisse dokumentieren)
- Feedback einarbeiten
- UI aufräumen, letzte Bugs fixen
- Dokumentation anfangen (Abschlussdokument)

**Ergebnis fürs Meeting am 15.06.:** Fertiger Prototyp, Evaluationsergebnisse vorzeigbar.

---

## Phase 5: Finalisierung (15.06. – 29.06.)

**Ziel:** Alles fertig für die Abschlusspräsentation.

- Abschlusspräsentation vorbereiten (15 Min. Vortrag)
- Abschlussdokumentation schreiben (7+ Seiten)
- Zeiterfassungsbögen fertigstellen
- Code aufräumen, kommentieren
- README im Repo finalisieren
- Alles in den Nextcloud-Ordner hochladen

**Ergebnis fürs Meeting am 29.06.:** Abschlusspräsentation + fertiges Produkt + Dokumentation.

---

## Deadline: 10.07.2026

Abgabe Abschlussdokumentation mit allen Unterlagen.

---

## Übersicht

| Datum | Meeting | Was wir zeigen |
|-------|---------|---------------|
| 13.04. | Implementierung I | Anforderungskatalog, Roadmap, Aufgabenverteilung |
| 27.04. | Implementierung II | Grundgerüst, erster Endpoint, erste Seite, erste Erkennung |
| 11.05. | Implementierung III | Alle Features, Dashboard mit Events |
| 01.06. | Evaluation + Prototyp II | Funktionierender Prototyp, Live-Demo |
| 15.06. | Finalized Pretesting | Fertiger Prototyp, Evaluationsergebnisse |
| 29.06. | Abschlusspräsentation | Vortrag + fertiges Produkt |
| 10.07. | — | Deadline Abschlussdokumentation |

---
