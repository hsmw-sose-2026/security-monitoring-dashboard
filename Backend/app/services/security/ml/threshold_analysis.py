# Analysiert das Verhalten an der produktiven Schwelle (p_malicious >= 0.75).
# Laedt das gespeicherte Modell, nutzt denselben leakage-sicheren Split wie das Training
# und misst auf dem Test-Set: Wie viele Angriffe werden bei welcher Schwelle gefangen/verpasst,
# wie viele harmlose Inputs loesen faelschlich ein Event aus?

import joblib

from train_classifier import lade_daten, split_train_test, CSV_PFAD, MODELL_PFAD

BENIGN_LABEL = "benign"
PRODUKTIV_SCHWELLE = 0.75      # so filtert Jonas' Backend
SCHWELLEN = [0.50, 0.60, 0.70, 0.75, 0.80, 0.90, 0.95]


def p_malicious_vektor(modell, texte):
    # p_malicious = 1 - P(benign). Wir brauchen die Spalte der benign-Klasse.
    proba = modell.predict_proba(texte)
    benign_idx = list(modell.classes_).index(BENIGN_LABEL)
    return 1.0 - proba[:, benign_idx]


def metriken_bei_schwelle(y_attack, p_mal, schwelle):
    # y_attack: 1 = echter Angriff, 0 = harmlos.  Vorhersage: p_mal >= schwelle -> Angriff.
    vorhergesagt = p_mal >= schwelle
    tp = int(((y_attack == 1) & vorhergesagt).sum())   # Angriff korrekt gefangen
    fn = int(((y_attack == 1) & ~vorhergesagt).sum())  # Angriff verpasst (unter Schwelle)
    fp = int(((y_attack == 0) & vorhergesagt).sum())   # harmlos -> Fehlalarm
    tn = int(((y_attack == 0) & ~vorhergesagt).sum())  # harmlos korrekt ignoriert
    precision = tp / (tp + fp) if (tp + fp) else 0.0
    recall = tp / (tp + fn) if (tp + fn) else 0.0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) else 0.0
    return tp, fn, fp, tn, precision, recall, f1


if __name__ == "__main__":
    modell = joblib.load(MODELL_PFAD)
    df = lade_daten(CSV_PFAD)
    _, test_df = split_train_test(df, test_anteil=0.2)   # exakt derselbe Split wie im Training

    texte = test_df["text"].tolist()
    y_attack = (test_df["label"] != BENIGN_LABEL).astype(int).to_numpy()
    p_mal = p_malicious_vektor(modell, texte)

    n_attack = int(y_attack.sum())
    n_benign = int((y_attack == 0).sum())
    print(f"Test-Set: {len(test_df)} Beispiele ({n_attack} Angriffe, {n_benign} harmlos)\n")

    # --- Schwellen-Sweep ---
    print("Schwelle |  gefangen / verpasst | Fehlalarme | Precision  Recall   F1")
    print("-" * 72)
    for s in SCHWELLEN:
        tp, fn, fp, tn, prec, rec, f1 = metriken_bei_schwelle(y_attack, p_mal, s)
        markierung = "  <- produktiv" if abs(s - PRODUKTIV_SCHWELLE) < 1e-9 else ""
        print(f"  {s:.2f}   |   {tp:3d}    /  {fn:3d}    |    {fp:3d}     | "
              f"{prec:.3f}    {rec:.3f}   {f1:.3f}{markierung}")

    # --- Detailblick auf die produktive Schwelle ---
    tp, fn, fp, tn, prec, rec, f1 = metriken_bei_schwelle(y_attack, p_mal, PRODUKTIV_SCHWELLE)
    print(f"\n=== Bei der produktiven Schwelle {PRODUKTIV_SCHWELLE} ===")
    print(f"  Angriffe gefangen:   {tp} von {n_attack}  (Recall {rec:.1%})")
    print(f"  Angriffe verpasst:   {fn}")
    print(f"  Fehlalarme (harmlos -> Event): {fp} von {n_benign}")
    print(f"  Precision: {prec:.1%}  (von allen ausgeloesten Events sind so viele echte Angriffe)")

    # --- Welche Typen werden bei 0.75 verpasst? ---
    verpasst_mask = (y_attack == 1) & (p_mal < PRODUKTIV_SCHWELLE)
    if verpasst_mask.any():
        verpasst = test_df.loc[verpasst_mask, "label"].value_counts()
        print(f"\n  Verpasste Angriffe nach Typ:")
        for label, n in verpasst.items():
            print(f"    {label}: {n}")