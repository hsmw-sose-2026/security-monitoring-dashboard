# Roadmap

Stand: 07.06.2026

Die Roadmap orientiert sich an den offiziellen Konsultations- und Arbeitsmeeting-Terminen. Durch Terminverschiebungen liegt der reale Projektstand etwa eine Woche versetzt. Die offiziellen Termine bleiben hier trotzdem als Orientierung erhalten.

Aktueller Stand: Das Treffen am 08.06. wird als verschobene Vorstellung des aktuellen Prototyps genutzt. Das naechste regulaere Treffen ist der 15.06. mit dem Ziel "Finalized Pretesting".

## Offizielle Terminuebersicht

| Datum | Termin | Schwerpunkt |
| --- | --- | --- |
| 30.03.2026 | Initialmeeting / 1. Meeting | Einfuehrung, Semesterplanung, Anforderungen klaeren |
| 13.04.2026 | 2. Meeting: Implementierung I | Grundstruktur, Projektstart, erste Implementierung |
| 20.04.2026 | Arbeitsmeeting | Gruppenindividuelle Abstimmung |
| 27.04.2026 | 3. Meeting: Implementierung II | Grundgeruest, erste Endpoints, erste UI, erste Detection |
| 04.05.2026 | Arbeitsmeeting | Gruppenindividuelle Abstimmung |
| 11.05.2026 | 4. Meeting: Implementierung III, Prototyp I, Evaluationsdiskussion | Modularisierung, Prototypstand, Evaluation planen |
| 18.05.2026 | Arbeitsmeeting | Integration vorbereiten |
| 01.06.2026 | 5. Meeting: Vorbereitung & Durchfuehrung Evaluation, Finalisierung Prototyp II | Live-Demo-Prototyp und Evaluation |
| 08.06.2026 | Arbeitsmeeting | Verschobener aktueller Prototypstand, E2E-Test, Praesentationsvorbereitung |
| 15.06.2026 | 6. Meeting: Finalized Pretesting | Fertiger Prototyp, Evaluationsergebnisse, letzte Korrekturen |
| 22.06.2026 | Arbeitsmeeting | Abschlussdokumentation und Praesentation finalisieren |
| 29.06.2026 | 7. Meeting: Auswertung und Abschlusspraesentation | Ergebnisvorstellung und Abschluss |

## Phase 1: Projektstart und Grundgeruest (30.03. - 26.04.)

**Ziel:** Anforderungen klaeren, technische Basis aufsetzen und erste Funktionen entwickeln.

- Entwicklungsumgebung einrichten.
- Git/GitHub-Workflow klaeren.
- FastAPI-Backend starten.
- Next.js/React-Frontend aufsetzen.
- Datenbankmodell vorbereiten.
- Erste Route und erste Seite bauen.
- Security-Middleware als Grundidee vorbereiten.

**Zwischenergebnis zum 27.04.:**

- Grundgeruest laeuft lokal.
- Erste Login-/Security-Demo ist moeglich.
- Repo-Struktur ist nutzbar.

## Phase 2: Kernfunktionen und Modularisierung (27.04. - 11.05.)

**Ziel:** Die wichtigsten Bereiche in Module trennen und Kernfunktionen vorbereiten.

- Backend in Routes, Schemas, Repositories, Services und Security-Komponenten strukturieren.
- Frontend-Seiten fuer Login, Startseite, Kontakt, Upload und Suche vorbereiten.
- Dashboard-Grundseiten vorbereiten.
- Erste Security-Regeln auslagern.
- Rollen und Aufgaben fuer die naechsten Sprints festlegen.

**Ergebnis zum Treffen am 11.05.:**

- Modularisierung wurde vorgestellt.
- Projektstruktur war klarer aufgeteilt.
- Weitere Features konnten auf eigenen Branches umgesetzt werden.

## Phase 3: Prototyp I und Integration vorbereiten (11.05. - 31.05.)

**Ziel:** Aus der modularen Struktur einen funktionierenden End-to-End-Prototyp bauen.

- Detection-Pipeline mit RequestContext, Rule-Loader, Pattern-Detector und Middleware verbinden.
- JSON-Regeln fuer SQLi, XSS und Path Traversal vorbereiten.
- Contact-, Search- und Upload-Backend ausbauen.
- Dashboard mit echten Events, Alerts, Stats und Attack-Daten verbinden.
- Attack-Gruppierung und Correlation fuer Alerts vorbereiten.
- Demo-Seeding und manuelle Testbeispiele erstellen.

**Geplanter Stand zum 01.06.:**

- Angriff auf Firmenseite erzeugt Event.
- Dashboard zeigt echte Daten.
- Evaluation kann vorbereitet werden.

## Phase 4: Prototyp II, Evaluation und Bugfixing (01.06. - 14.06.)

**Ziel:** Finalen Prototyp stabilisieren, Evaluation durchfuehren und bekannte Luecken schliessen.

- JWT-Login und Dashboard-Token-Guard integrieren.
- Dashboard-Seiten gegen Auth absichern.
- Rules-Backend und Rules-UI verbinden.
- Contact/Search/Upload final anbinden.
- Bad Upload, Rate Limit, Brute Force und Multi-Vector in Demo pruefen.
- Darkmode-/Whitemode-Probleme im Dashboard beheben.
- Frontend-Demo-Buttons testen.
- Evaluation dokumentieren.
- Eigenanteile pro Person aus Git-History ableiten.

**Ist-Stand am 07./08.06.:**

- Backend-Compile erfolgreich.
- Backend-Integrationstest erfolgreich.
- Frontend-Production-Build erfolgreich.
- Browser-E2E-Test fuer Rules-UI erfolgreich.
- Evaluation und Eigenanteile sind dokumentiert.
- Offene kleinere Punkte: Biome-Formatierung, finale Praesentation, Abschlussdokumentation.

**Ziel fuer das Treffen am 15.06.:**

- Fertiger Prototyp fuer Finalized Pretesting.
- Evaluationsergebnisse vorzeigbar.
- Bekannte Grenzen klar benennen.

## Phase 5: Finalisierung und Abschluss (15.06. - 29.06.)

**Ziel:** Projekt fuer Abschluss und Abgabe vorbereiten.

- Abschlusspräsentation erstellen.
- Live-Demo-Ablauf festlegen.
- Evaluationsergebnisse zusammenfassen.
- Abschlussdokumentation schreiben.
- README und API-Dokumentation finalisieren.
- Zeiterfassungsboegen fertigstellen.
- Repository aufraeumen.
- Finale Zip/Abgabe vorbereiten.

**Ergebnis zum 29.06.:**

- Abschlusspraesentation.
- Fertiger Prototyp.
- Dokumentation und Evaluationsauswertung.

## Deadline

| Datum | Inhalt |
| --- | --- |
| 10.07.2026 | Abgabe der Abschlussdokumentation mit allen Unterlagen |

## Kurzstatus

| Bereich | Status am 07.06. |
| --- | --- |
| Webanwendung | umgesetzt |
| Backend-Logging | umgesetzt |
| Detection | umgesetzt fuer typische Demo-Angriffe |
| Dashboard | umgesetzt |
| Rules-Management | umgesetzt und E2E getestet |
| Evaluation | dokumentiert |
| Praesentation | noch zu erstellen |
| Abschlussdokumentation | noch auszubauen |
