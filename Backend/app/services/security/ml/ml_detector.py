# Runtime-Schnittstelle zum trainierten Payload-Klassifikator.
# Jonas' Backend laedt das Modell einmal beim Start (lade_modell) und ruft
# predict_payload(text) pro Request auf.

import os

import joblib

_HIER = os.path.dirname(os.path.abspath(__file__))
_MODELL_PFAD = os.path.join(_HIER, "payload_classifier.joblib")

BENIGN_LABEL = "benign"

# Modell wird modul-global gecacht -> nur einmal von der Platte geladen.
_modell = None


def lade_modell(pfad=_MODELL_PFAD):
    # Laedt die Pipeline (Vectorizer + Classifier) aus dem .joblib.
    # Am besten einmal beim Serverstart aufrufen; sonst wird es lazy beim
    # ersten predict_payload geladen.
    global _modell
    if _modell is None:
        if not os.path.exists(pfad):
            raise FileNotFoundError(
                f"Modell nicht gefunden: {pfad}. "
                "Erst 'python train_classifier.py' ausfuehren."
            )
        _modell = joblib.load(pfad)
    return _modell


def predict_payload(text):
    # Klassifiziert einen einzelnen Payload-String.
    #
    # Rueckgabe (dict):
    #   is_malicious : bool   -> True, wenn vorhergesagte Klasse != "benign"
    #   label        : str    -> benign | sqli | xss | path_traversal | cmd_injection
    #   confidence   : float  -> Wahrscheinlichkeit der vorhergesagten Klasse (0..1)
    #   p_malicious  : float  -> 1 - P(benign), Gesamt-Wahrscheinlichkeit "Angriff"
    #   proba        : dict   -> vollstaendige Verteilung {klasse: wahrscheinlichkeit}
    #
    # Hinweis fuer die Schwelle: fuer "ist das ein Angriff?" ist p_malicious meist
    # sinnvoller; fuer "wie sicher ist der Typ?" das confidence.
    modell = lade_modell()

    # leere/whitespace-Eingaben sind harmlos -> kein unnoetiger Modell-Aufruf
    if text is None or str(text).strip() == "":
        return {
            "is_malicious": False,
            "label": BENIGN_LABEL,
            "confidence": 1.0,
            "p_malicious": 0.0,
            "proba": {BENIGN_LABEL: 1.0},
        }

    # Pipeline erwartet eine Liste -> [text] rein, erstes Ergebnis raus
    proba_vektor = modell.predict_proba([str(text)])[0]
    klassen = modell.classes_

    proba = {klasse: float(p) for klasse, p in zip(klassen, proba_vektor)}
    label = max(proba, key=proba.get)            # Klasse mit hoechster Wahrscheinlichkeit
    confidence = proba[label]
    p_benign = proba.get(BENIGN_LABEL, 0.0)

    return {
        "is_malicious": label != BENIGN_LABEL,
        "label": label,
        "confidence": confidence,
        "p_malicious": 1.0 - p_benign,
        "proba": proba,
    }


if __name__ == "__main__":
    # Kleiner Selbsttest mit Beispiel-Payloads (harmlos, klar boese, obfuskiert)
    beispiele = [
        "firma & co. kg",                                  # harmlos mit Sonderzeichen
        "max.mueller@web.de",                              # harmlos
        "' OR '1'='1",                                     # SQLi (klar)
        "<script>alert(1)</script>",                       # XSS (klar)
        "%253Cscript%253Ealert%25281%2529%253C%252Fscript%253E",  # XSS doppelt URL-kodiert
        "uNiOn/**/SeLeCt",                                 # SQLi obfuskiert
        "../../etc/passwd",                                # Path Traversal
        "; cat /etc/passwd",                               # Command Injection
    ]
    for t in beispiele:
        r = predict_payload(t)
        print(f"{r['label']:>15}  conf={r['confidence']:.2f}  "
              f"p_mal={r['p_malicious']:.2f}  mal={r['is_malicious']}  | {t[:45]}")