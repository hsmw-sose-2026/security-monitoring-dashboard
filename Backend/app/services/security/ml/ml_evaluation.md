# ML-Payload-Detector – Evaluation

> Status: Prototyp. Zahlen aus dem aktuellen Trainingslauf. Offene Abschnitte (Regex-Baseline,
> Schwellenwert-Analyse) sind als TODO markiert und werden vor der Abgabe ergänzt.

## 1. Ziel und Einordnung

Der ML-Detector ergänzt – nicht ersetzt – die bestehende Regex-/Pattern-Pipeline. Die
Regex-Regeln (JSON-basiert) erkennen bekannte Angriffsmuster zuverlässig, scheitern aber an
**obfuskierten** Varianten (Case-Mixing, URL-/Doppel-URL-Encoding, HTML-Entities, SQL-Kommentare).
Genau diese Lücke schließt das ML-Modul: Es klassifiziert einen Request-Payload in eine von
fünf Klassen und liefert einen Confidence-Wert, auf dessen Basis die Middleware ein Event
auslöst.

Klassen: `benign`, `sqli`, `xss`, `path_traversal`, `cmd_injection`.

## 2. Datensatz

Der Datensatz wird **programmatisch** erzeugt (`generate_dataset.py`), mit festem Seed
(`random.seed(42)`) – jeder im Team und der Prüfende erhält durch Ausführen denselben
Datensatz (Reproduzierbarkeit).

| Klasse | Beispiele |
| --- | --- |
| benign | 450 |
| sqli | 120 |
| xss | 120 |
| path_traversal | 120 |
| cmd_injection | 120 |
| **Gesamt** | **930** |

Aufbau:
- **Harmlose Inputs** orientieren sich an echten Request-Mustern der Firmenseite (Suche, Kontakt,
  Login, Uploads) und enthalten bewusst Eingaben mit *legitimen* Sonderzeichen
  (`firma & co. kg`, `node.js`, `report-q3.xlsx`, `preis < 100 euro`). Das verhindert, dass das
  Modell „Sonderzeichen = böse" lernt und reduziert False Positives.
- **Angriffe** bestehen aus Basis-Payloads pro Kategorie, auf die systematisch
  Obfuskations-Transforms angewandt werden: Case-Mixing, URL-Encoding, doppeltes URL-Encoding
  (`%253C`), HTML-Entities, SQL-Kommentare (`/**/`), Whitespace-Varianten. Kombinationen werden
  kontrolliert gestapelt (max. ein Struktur- + ein Encoding-Transform), um unrealistische
  Doppel-Encodings zu vermeiden.

## 3. Modell

Eine scikit-learn-Pipeline aus zwei Stufen, gespeichert als ein `.joblib`-Objekt:

```
TfidfVectorizer(analyzer="char", ngram_range=(3,5), lowercase=False, min_df=2)
  -> LogisticRegression(class_weight="balanced", max_iter=2000)
```

Begründung der Designentscheidungen:
- **Char-N-Grams (3–5)** statt Wort-Tokenisierung: `union` und `uNiOn` teilen sich auf
  Zeichenebene dieselben Schnipsel. Das ist der Schlüssel zur Erkennung obfuskierter Payloads.
- **`lowercase=False`**: Groß-/Kleinschreibung ist bei Obfuskation ein Signal und wird bewusst
  nicht verworfen.
- **Logistic Regression**: bewusst einfaches, gut erklärbares Modell. Geeignet für einen
  kleinen Datensatz, geringe Overfitting-Neigung, nachvollziehbare Entscheidungen. Ein
  komplexeres Modell wäre bei dieser Datensatzgröße nicht der Flaschenhals.
- **`class_weight="balanced"`**: gleicht aus, dass `benign` deutlich mehr Beispiele hat als die
  einzelnen Angriffsklassen.

## 4. Evaluationsmethode

Train/Test-Split 80/20, **leakage-sicher**:
- Angriffe werden mit `StratifiedGroupKFold` nach **Familie** (Basis-Payload) gesplittet. So
  landen alle Varianten eines Basis-Payloads entweder komplett im Training oder komplett im Test
  – das Modell wird im Test nur mit *unbekannten* Familien geprüft. Die Stratifizierung sorgt
  zusätzlich dafür, dass jede Klasse in beiden Sets vertreten ist.
- Harmlose Inputs werden zufällig gesplittet (keine Leakage-Gefahr, da die Eingaben unabhängig
  sind).

Ein Assertion-Check stellt sicher, dass keine Angriffs-Familie in beiden Sets auftaucht.

## 5. Ergebnisse

Test-Set: 186 Beispiele.

| Klasse | Precision | Recall | F1 | Support |
| --- | --- | --- | --- | --- |
| benign | 0.978 | 1.000 | 0.989 | 90 |
| cmd_injection | 0.909 | 0.870 | 0.889 | 23 |
| path_traversal | 1.000 | 0.920 | 0.958 | 25 |
| sqli | 1.000 | 0.955 | 0.977 | 22 |
| xss | 0.929 | 1.000 | 0.963 | 26 |
| **Accuracy** | | | **0.968** | 186 |
| Macro avg | 0.963 | 0.949 | 0.955 | 186 |

Confusion Matrix (Zeilen = tatsächlich, Spalten = vorhergesagt):

| tatsächlich ↓ / vorhergesagt → | benign | cmd | path | sqli | xss |
| --- | --- | --- | --- | --- | --- |
| benign | 90 | 0 | 0 | 0 | 0 |
| cmd_injection | 1 | 20 | 0 | 0 | 2 |
| path_traversal | 0 | 2 | 23 | 0 | 0 |
| sqli | 1 | 0 | 0 | 21 | 0 |
| xss | 0 | 0 | 0 | 0 | 26 |

Interpretation:
- **Kein False Positive auf harmlosen Inputs** (benign Recall 1.000): keine harmlose Eingabe wird
  fälschlich als Angriff klassifiziert. Das ist die für den Produktivbetrieb wichtigste Zahl.
- **sqli, xss, path_traversal** werden zuverlässig erkannt (F1 > 0.95), inkl. obfuskierter
  Varianten.
- **cmd_injection ist die schwächste Klasse** (Recall 0.870). Die verbleibenden Fehler betreffen
  kurze, natürsprachlich aussehende Payloads (`| whoami`, `$(whoami)`), die sich auf Zeichenebene
  kaum von harmlosem Text unterscheiden. Eine erste Version erreichte hier nur Recall 0.50; durch
  Erweiterung des Datensatzes um diversere cmd-Payloads (Reverse-Shells, `/dev/tcp`, `base64`)
  wurde sie deutlich verbessert.

> Hinweis: Einzelne Werte können zwischen Läufen um 1–2 % schwanken (Solver-Nichtdeterminismus
> bei dieser scikit-learn-Version). Das Gesamtbild bleibt stabil.

## 6. Schwellenwert-Analyse (TODO)

> Geplant: `predict_proba` auswerten und Precision/Recall beim produktiven Cutoff **0.75**
> betrachten (abgestimmt mit Jonas). Ergänzend eine gestaffelte Logik prüfen:
> `>= 0.95 -> Event`, `0.75–0.95 -> Review`, `< 0.75 -> ignorieren`.
> Liefert die Zahl, wie viele Treffer/Fehlalarme bei genau dem Schwellenwert entstehen, der
> live läuft.

## 7. Vergleich gegen Regex-Baseline (TODO)

> Geplant: dieselben Test-Payloads gegen die bestehende Regex-/Pattern-Pipeline laufen lassen
> und gegenüberstellen, was die Regex fängt vs. was das ML zusätzlich fängt – besonders bei
> obfuskierten Varianten. Erwartung: Die Regex erkennt unverschleierte Payloads, das ML schließt
> die Obfuskations-Lücke. Ergebnis als Tabelle „erkannt durch Regex / ML / beide / keines".

## 8. Grenzen und nächste Schritte

Bewusst benannte Schwächen (relevant für eine ehrliche Einordnung):

- **Synthetischer Datensatz.** Angriffe werden aus Basis-Payloads + Transforms erzeugt. Das
  Modell lernt damit teilweise die Struktur *unserer Generatoren*, nicht die volle Bandbreite
  echter Angriffe. Reale Varianten wie MySQL-Inline-Kommentare (`/*!50000UNION*/`) oder
  String-Konkatenation (`chr(65)||chr(66)`) sind nicht abgedeckt. Größter Hebel für eine
  Weiterentwicklung: Ergänzung um echte Payload-Korpora (z. B. OWASP-Listen).
- **Wenige Basis-Familien pro Klasse.** Der Leakage-sichere Split ist sauber, beruht aber auf
  relativ wenigen Grundmustern. Mehr Diversität bei den Basis-Payloads würde die
  Generalisierung verbessern.
- **Fehlende „schwierige" harmlose Beispiele.** Inputs, die Angriffen ähneln, aber harmlos sind
  (`<div class="header">`, `document.querySelector()`, `cat datei.txt`, `os.path.join(...)`),
  sind noch nicht im Datensatz. Genau an solchen Fällen entscheidet sich die False-Positive-Rate
  in der Praxis. Geplante Ergänzung.

Fazit: Für einen Hybrid-Ansatz (Regex + ML-Klassifikator) ist die Architektur tragfähig. Der
größte Verbesserungshebel liegt aktuell nicht im Modell, sondern in der Datenqualität.
