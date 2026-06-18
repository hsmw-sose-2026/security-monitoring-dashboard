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

## 6. Schwellenwert-Analyse

Das Backend loest ein Event aus, wenn `p_malicious >= 0.75` (abgestimmt mit Jonas). `p_malicious`
ist `1 - P(benign)`, also die Gesamt-Wahrscheinlichkeit "Angriff" – bewusst nicht die `confidence`
der Top-Klasse, da diese sich bei einem 5-Klassen-Modell ueber die Angriffsklassen verteilt und
oft unter 0.75 liegt, obwohl klar ein Angriff vorliegt (Beispiel: `' OR '1'='1` hat confidence
0.58, aber p_malicious 0.83).

Die Analyse (`threshold_analysis.py`) misst auf demselben leakage-sicheren Test-Set wie die
Haupt-Evaluation, wie sich verschiedene Schwellen auf Erkennung und Fehlalarme auswirken:

```
Schwelle | gefangen / verpasst | Fehlalarme | Precision  Recall   F1
--------------------------------------------------------------------
  0.50   |   96    /    0      |     2      |  0.980    1.000   0.990
  0.60   |   96    /    0      |     0      |  1.000    1.000   1.000
  0.70   |   95    /    1      |     0      |  1.000    0.990   0.995
  0.75   |   89    /    7      |     0      |  1.000    0.927   0.962   <- produktiv
  0.80   |   83    /   13      |     0      |  1.000    0.865   0.927
  0.90   |   50    /   46      |     0      |  1.000    0.521   0.685
  0.95   |   13    /   83      |     0      |  1.000    0.135   0.239
```

(Test-Set: 186 Beispiele, davon 96 Angriffe und 90 harmlose.)

**Bei der produktiven Schwelle 0.75:**
- Angriffe gefangen: 89 von 96 (Recall 92,7 %)
- Fehlalarme auf harmlosen Inputs: 0 von 90 (Precision 100 %)
- Verpasste Angriffe nach Typ: 4x cmd_injection (die bekannte schwaechste Klasse – kurze,
  natuersprachlich aussehende Payloads)

**Warum 0.75 und nicht niedriger?** Auf dem synthetischen Test-Set waere 0.60 sogar optimal
(alle Angriffe, null Fehlalarme). 0.75 wird trotzdem bewusst gewaehlt, als **Sicherheitspuffer**:
In der realen Pipeline analysiert das ML auch Request-Texte, die nicht im Training waren
(Endpoint-Pfade, JSON-Bodies). Diese koennen hoehere p_malicious-Werte erzeugen; eine hoehere
Schwelle schuetzt vor den dadurch entstehenden Fehlalarmen. 0.75 opfert etwas Recall (92,7 % statt
100 %) zugunsten von Robustheit gegen ungesehene Daten.

**Interpretation des Trade-offs:** Niedrige Schwellen fangen mehr Angriffe, erzeugen aber
Fehlalarme (0.50: 2). Ab 0.60 verschwinden die Fehlalarme. Sehr hohe Schwellen (0.90+) verpassen
einen Grossteil der Angriffe. Die Precision bleibt ab 0.60 durchgehend bei 100 % – wenn das
System Alarm schlaegt, ist es auf diesem Datensatz immer ein echter Angriff.

## 7. Vergleich gegen Regex-Baseline

Kernfrage des ganzen Moduls: Was faengt das ML zusaetzlich gegenueber der bestehenden
Regex-/Pattern-Pipeline? Dazu werden dieselben Test-Payloads durch *beide* Systeme geschickt
(`regex_vs_ml.py`). Fairer Vergleich: Beide sehen denselben Payload, fuer die Regex als
query-Parameter `q` in einem RequestContext (so wie er live ueber `/search?q=...` kaeme). Als
"ML erkennt" gilt `p_malicious >= 0.75` – exakt der produktive Cutoff.

Ergebnis auf 96 Angriffen im Test-Set:

| Kategorie | Anzahl |
| --- | --- |
| Von beiden erkannt | 29 |
| Nur von Regex erkannt | 4 |
| **Nur von ML erkannt** | **60** |
| Von keinem erkannt | 3 |

| System | Erkennungsrate |
| --- | --- |
| Regex allein | 33 / 96 (34,4 %) |
| ML allein | 89 / 96 (92,7 %) |

Fehlalarme auf 90 harmlosen Inputs: Regex 0, ML 0.

**Interpretation:**
- **60 Angriffe werden ausschliesslich vom ML erkannt.** Das sind die obfuskierten Varianten
  (URL-/Doppel-Encoding, Hex-Escapes, Tab-Trennung), durch die die Regex blind durchlaeuft.
  Beispiel: `' \x4F\x52 '1'='\x31` ist `' OR '1'='1` mit Hex-Escapes – die Regex sucht nach `OR`,
  findet aber `\x4F\x52` nicht; das char-n-gram-Modell erkennt das Muster trotzdem.
- **4 Angriffe erkennt nur die Regex** (knapp unter der ML-Schwelle). Das belegt: Die Systeme
  ergaenzen sich – der Hybrid-Ansatz ist staerker als jedes System allein. Das ML ersetzt die
  Regex nicht, es schliesst ihre Obfuskations-Luecke.
- **3 Angriffe rutschen durch beide.** Auch der Hybrid ist kein Allheilmittel; diese Faelle
  zeigen die verbleibende Grenze.

Hinweis zum Aufruf: `regex_vs_ml.py` greift auf den Backend-Code (Pattern-Pipeline) zu und wird
daher als Modul gestartet:
`python -m app.services.security.ml.regex_vs_ml` (aus dem `Backend/`-Ordner).

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
