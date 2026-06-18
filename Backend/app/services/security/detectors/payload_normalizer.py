import html
import re
import unicodedata
from urllib.parse import unquote

MAX_URL_DECODE_ROUNDS = 3


def _step(layer: str, before: str, after: str) -> dict:
    return {
        "layer": layer,
        "output": after,
        "changed": before != after,
    }


def decode_url_layers(text: str, max_rounds: int = MAX_URL_DECODE_ROUNDS) -> tuple[str, list[dict]]:
    steps = []
    current = text

    for i in range(max_rounds):
        decoded = unquote(current)
        steps.append(_step(f"url_decode_{i + 1}", current, decoded))
        if decoded == current:
            break
        current = decoded
    
    return current, steps


def decode_html_entities(text: str) -> tuple[str, list[dict]]:
    decoded = html.unescape(text)
    return decoded, [_step("html_entities", text, decoded)]


def normalize_unicode(text: str) -> tuple[str, list[dict]]:
    normalized = unicodedata.normalize("NFKC", text)
    return normalized, [_step("unicode_nfkc", text, normalized)]


def decode_hex_escapes(text: str) -> tuple[str, list[dict]]:
    def repl(match: re.Match) -> str:
        return chr(int(match.group(1), 16))

    decoded = re.sub(r"\\x([0-9A-fA-F]{2})", repl, text)
    return decoded, [_step("hex_escape", text, decoded)]


def normalize_payload(text: str) -> tuple[str, list[dict]]: # Hauptfunktion, alles zurueckgeben was Sophia braucht
    if not text or not str(text).strip():
        return {
            "original": text or "",
            "steps": [],
            "final": text or "",
        }

    original = str(text)
    steps: list[dict] = []

    # 1. URL decoding, braucht manchmal mehrere Runden
    current, url_steps = decode_url_layers(original)
    steps.extend(url_steps)

    # 2. HTML Entities aufloesen
    current, html_steps = decode_html_entities(current)
    steps.extend(html_steps)

    # 3. Hex-Escapes, nur wenn enthalten
    if "\\x" in current:
        current, hex_steps = decode_hex_escapes(current)
        steps.extend(hex_steps)

    # 4. Unicode NFKC normalisieren
    current, unicode_steps = normalize_unicode(current)
    steps.extend(unicode_steps)

    return {
        "original": original,
        "steps": steps,
        "final": current,
    }

        
