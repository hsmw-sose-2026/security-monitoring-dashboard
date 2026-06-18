# Trainiert den ML-Payload-Klassifikator (char-n-gram TF-IDF + Logistic Regression).
# Erwartet training_data.csv im Unterordner data/. Speichert das Modell als payload_classifier.joblib.

import os

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.model_selection import StratifiedGroupKFold
from sklearn.pipeline import Pipeline


# Fester Seed -> reproduzierbar (jeder im Team bekommt dasselbe Modell)
RANDOM_STATE = 42

# Pfade relativ zu DIESER Datei -> egal von wo gestartet
HIER = os.path.dirname(os.path.abspath(__file__))
CSV_PFAD = os.path.join(HIER, "data", "training_data.csv")
MODELL_PFAD = os.path.join(HIER, "payload_classifier.joblib")


def lade_daten(pfad):
    df = pd.read_csv(pfad)
    # Sicherheitsnetz: leere Texte rauswerfen (waeren beim TF-IDF nur Rauschen)
    df = df.dropna(subset=["text"])
    df = df[df["text"].str.len() > 0].reset_index(drop=True)
    return df


def baue_pipeline():
    # Eine Pipeline = Vectorizer + Modell als EIN Objekt.
    # Jonas kann spaeter direkt rohen Text reingeben, Pipeline macht den Rest.
    return Pipeline([
        ("tfidf", TfidfVectorizer(
            analyzer="char",            # Zeichen-Schnipsel statt Woerter -> hilft gegen Obfuskation
            ngram_range=(3, 5),         # Schnipsel der Laenge 3-5
            lowercase=False,            # Case ist ein Signal (uNiOn vs union); nicht wegwerfen
            min_df=2,                   # Schnipsel die nur 1x vorkommen ignorieren -> weniger Rauschen
        )),
        ("clf", LogisticRegression(
            max_iter=2000,              # genug Iterationen damit der Optimierer konvergiert
            class_weight="balanced",    # gleicht aus, dass z.B. path_traversal weniger Beispiele hat
            random_state=RANDOM_STATE,
        )),
    ])


def split_train_test(df, test_anteil=0.2):
    # Angriffe: StratifiedGroupKFold -> splittet nach FAMILIE (Leakage-sicher) UND sorgt dafuer,
    #   dass JEDE Klasse in Train und Test vertreten ist. Sonst landet zufaellig mal eine ganze
    #   Klasse (z.B. xss) komplett im Train und fehlt im Test.
    # Harmlose: Zufalls-Split (keine Leakage-Gefahr, Eingaben sind unabhaengig).
    angriffe = df[df["label"] != "benign"].reset_index(drop=True)
    harmlos = df[df["label"] == "benign"]

    n_splits = int(round(1 / test_anteil))   # 0.2 -> 5 Folds, davon 1 als Test
    sgkf = StratifiedGroupKFold(n_splits=n_splits, shuffle=True, random_state=RANDOM_STATE)
    train_idx, test_idx = next(sgkf.split(angriffe["text"], angriffe["label"],
                                          groups=angriffe["familie"]))
    a_train = angriffe.iloc[train_idx]
    a_test = angriffe.iloc[test_idx]

    harmlos_mix = harmlos.sample(frac=1, random_state=RANDOM_STATE).reset_index(drop=True)
    n_test = int(len(harmlos_mix) * test_anteil)
    h_test = harmlos_mix.iloc[:n_test]
    h_train = harmlos_mix.iloc[n_test:]

    train_df = pd.concat([a_train, h_train]).sample(frac=1, random_state=RANDOM_STATE).reset_index(drop=True)
    test_df = pd.concat([a_test, h_test]).sample(frac=1, random_state=RANDOM_STATE).reset_index(drop=True)
    return train_df, test_df


def auswerten(modell, X_test, y_test):
    y_pred = modell.predict(X_test)
    print("\n=== Classification Report (Test-Set) ===")
    print(classification_report(y_test, y_pred, digits=3, zero_division=0))

    print("=== Confusion Matrix ===")
    labels = sorted(y_test.unique())
    cm = confusion_matrix(y_test, y_pred, labels=labels)
    breite = max(len(l) for l in labels) + 2
    kopf = " " * breite + "  ".join(f"{l:>{breite}}" for l in labels)
    print(kopf + "   <- vorhergesagt")
    for label, zeile in zip(labels, cm):
        print(f"{label:>{breite}}" + "  ".join(f"{n:>{breite}}" for n in zeile))
    print("\n(Zeilen = tatsaechliche Klasse, Spalten = vorhergesagte Klasse)")


if __name__ == "__main__":
    print(f"Lade {CSV_PFAD}")
    df = lade_daten(CSV_PFAD)
    print(f"Gesamt: {len(df)} Beispiele, {df['label'].nunique()} Klassen")
    print(f"Verteilung:\n{df['label'].value_counts().to_string()}\n")

    train_df, test_df = split_train_test(df, test_anteil=0.2)
    print(f"Train: {len(train_df)}  |  Test: {len(test_df)}")
    print(f"Familien im Train: {train_df['familie'].nunique()}  |  im Test: {test_df['familie'].nunique()}")
    ueberlapp_angriffe = (set(train_df[train_df["label"] != "benign"]["familie"])
                          & set(test_df[test_df["label"] != "benign"]["familie"]))
    assert not ueberlapp_angriffe, f"LEAKAGE: {len(ueberlapp_angriffe)} Angriffs-Familien in beiden Sets!"
    print(f"OK: keine Angriffs-Familie ueberlappt zwischen Train und Test")

    modell = baue_pipeline()
    print("\nTrainiere ...")
    modell.fit(train_df["text"], train_df["label"])

    auswerten(modell, test_df["text"], test_df["label"])

    joblib.dump(modell, MODELL_PFAD)
    print(f"\nModell gespeichert: {MODELL_PFAD}")