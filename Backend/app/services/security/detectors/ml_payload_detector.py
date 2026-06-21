from app.services.security.ml.ml_detector import predict_payload


ML_THRESHOLD = 0.75 #Bei Confidence >= 0.75 wird ein Event ausgelöst

# Pfade, auf denen der ML-Detektor nicht laeuft (z.B. Login: normale
# Credentials koennen sonst faelschlich als Angriffspayload klassifiziert werden).
ML_EXCLUDED_PATHS = frozenset({"/auth/login"})


LABEL_TO_EVENT_TYPE = { # Event Types festlegen
    "sqli": "sql_injection",
    "xss": "xss",
    "path_traversal": "path_traversal",
    "cmd_injection": "command_injection",
}

LABEL_TO_SEVERITY = { # Severities festlegen
    "sqli": "high",
    "xss": "medium",
    "path_traversal": "high",
    "cmd_injection": "high",
}

def detect_ml_payload(context) -> dict | None:
    if context.path in ML_EXCLUDED_PATHS:
        return None

    text = context.searchable_text #Request Data die analysiert werden soll
    if not text.strip():
        return None # Wenn keine Daten vorhanden, keine Analyse
    
    result = predict_payload(text)

    if result["p_malicious"] < ML_THRESHOLD:
        return None # Confidence nicht hoch genug, kein Event

    label = result["label"]
    event_type = LABEL_TO_EVENT_TYPE.get(label, "ml_detected_attack")

    return {
        "event_type": "ml_detected_attack",
        "severity": LABEL_TO_SEVERITY.get(label, "medium"),
        "ml_label": label,
        "confidence": result["confidence"],
        "p_malicious": result["p_malicious"],
    }
