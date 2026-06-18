# Vergleicht die Regex-/Pattern-Pipeline gegen das ML-Modell auf denselben Test-Payloads.
# Kernfrage: Was faengt die Regex, was faengt das ML zusaetzlich - besonders bei Obfuskation?
#
# Fairer Vergleich: Beide Systeme sehen denselben Payload. Fuer die Regex wird er als
# query-Parameter "q" in einen RequestContext gelegt (so wie er live ueber /search?q=... kaeme).

from app.services.security.request_context import RequestContext
from app.services.security.detectors.pattern_detector import run_all_pattern_rules
from app.services.security.ml.ml_detector import predict_payload
from app.services.security.ml.train_classifier import lade_daten, split_train_test, CSV_PFAD


ML_SCHWELLE = 0.75
BENIGN_LABEL = "benign"


def regex_erkennt(payload) -> bool:
    # Minimaler RequestContext mit dem Payload im query-Feld "q"
    # (so wie er live ueber /search?q=... kaeme) -> fairer Vergleich.
    context = RequestContext(
        source_ip="127.0.0.1",
        method="GET",
        path="/search",
        full_url=f"/search?q={payload}",
        query_params={"q": payload},
    )
    return len(run_all_pattern_rules(context)) > 0


def ml_erkennt(payload) -> bool:
    # ML erkennt = p_malicious ueber der produktiven Schwelle (so filtert das Backend)
    return predict_payload(payload)["p_malicious"] >= ML_SCHWELLE


if __name__ == "__main__":
    df = lade_daten(CSV_PFAD)
    _, test_df = split_train_test(df, test_anteil=0.2)

    angriffe = test_df[test_df["label"] != BENIGN_LABEL]
    harmlos = test_df[test_df["label"] == BENIGN_LABEL]

    nur_regex = nur_ml = beide = keines = 0
    nur_ml_beispiele = []

    for _, row in angriffe.iterrows():
        payload = row["text"]
        r = regex_erkennt(payload)
        m = ml_erkennt(payload)
        if r and m:
            beide += 1
        elif r and not m:
            nur_regex += 1
        elif m and not r:
            nur_ml += 1
            if len(nur_ml_beispiele) < 5:
                nur_ml_beispiele.append((row["label"], payload))
        else:
            keines += 1

    gesamt = len(angriffe)
    print(f"=== Angriffe im Test-Set: {gesamt} ===\n")
    print(f"  Von BEIDEN erkannt:        {beide:3d}")
    print(f"  Nur von REGEX erkannt:     {nur_regex:3d}")
    print(f"  Nur von ML erkannt:        {nur_ml:3d}   <- ML-Mehrwert")
    print(f"  Von KEINEM erkannt:        {keines:3d}")
    print()
    regex_ges = beide + nur_regex
    ml_ges = beide + nur_ml
    print(f"  Regex-Erkennung gesamt:    {regex_ges:3d} / {gesamt}  ({regex_ges / gesamt:.1%})")
    print(f"  ML-Erkennung gesamt:       {ml_ges:3d} / {gesamt}  ({ml_ges / gesamt:.1%})")

    regex_fp = sum(regex_erkennt(r["text"]) for _, r in harmlos.iterrows())
    ml_fp = sum(ml_erkennt(r["text"]) for _, r in harmlos.iterrows())
    print(f"\n  Fehlalarme auf {len(harmlos)} harmlosen Inputs:  Regex {regex_fp}  |  ML {ml_fp}")

    print(f"\n  Beispiele 'nur ML erkannt' (Obfuskation, die die Regex verpasst):")
    for label, payload in nur_ml_beispiele:
        print(f"    [{label}] {payload[:70]}")