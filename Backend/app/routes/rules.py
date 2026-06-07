"""Rules API fuer den Dashboard Prototyp.

Die Detektor-Engine speichert Regex-Regeln als JSON-Dateien in
`app/services/security/rules`. Dieser Router stellt diese Dateien in der Form
bereit, die vom Dashboard Rules UI erwartet wird.
"""

import json
import re
from pathlib import Path
from typing import Any

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field


router = APIRouter(prefix="/rules", tags=["rules"])

RULES_DIR = Path(__file__).resolve().parents[1] / "services" / "security" / "rules"
DISPLAY_NAMES = {
    "sqli": "SQL Injection",
    "xss": "XSS",
    "path_traversal": "Path Traversal",
}


class RuleResponse(BaseModel):
    id: int
    classId: int
    name: str
    eventType: str
    target: str
    regex: str
    severity: str
    enabled: bool
    description: str


class RuleClassResponse(BaseModel):
    id: int
    name: str
    description: str
    rules: list[RuleResponse]


class RuleClassCreate(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    description: str = ""


class RuleCreate(BaseModel):
    class_id: int
    name: str = Field(min_length=1, max_length=120)
    event_type: str = Field(min_length=1, max_length=80)
    target: str = "request"
    regex: str = Field(min_length=1)
    severity: str = "medium"
    enabled: bool = True
    description: str = ""


class RuleUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    event_type: str = Field(min_length=1, max_length=80)
    target: str = "request"
    regex: str = Field(min_length=1)
    severity: str = "medium"
    enabled: bool = True
    description: str = ""


def _slugify(value: str) -> str:
    # Macht aus einem Anzeigenamen einen sicheren Dateinamen, z.B.
    # "SQL Injection" -> "sql_injection".
    slug = re.sub(r"[^a-zA-Z0-9]+", "_", value.strip().lower()).strip("_")
    return slug or "custom_rule"


def _rule_files() -> list[Path]:
    # Nur normale Regex-Regeldateien laden. upload_extensions.json hat ein
    # anderes Format und wird vom Bad-Upload-Detector direkt gelesen.
    return sorted(
        path
        for path in RULES_DIR.glob("*.json")
        if _load_rule_file(path).get("patterns") is not None
    )


def _load_rule_file(path: Path) -> dict[str, Any]:
    with path.open(encoding="utf-8") as file:
        data = json.load(file)
    if not isinstance(data, dict):
        raise HTTPException(status_code=500, detail=f"Ungueltige Regeldatei: {path.name}")
    return data


def _write_rule_file(path: Path, data: dict[str, Any]) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def _class_description(rule_name: str, data: dict[str, Any]) -> str:
    event_type = data.get("event_type", rule_name)
    return f"Regeln fuer {event_type}"


def _to_rule_response(class_id: int, pattern_index: int, data: dict[str, Any], pattern: dict[str, Any]) -> RuleResponse:
    # Die UI braucht numerische IDs. Die JSON-Dateien haben keine IDs, deshalb
    # leiten wir stabile IDs aus Klassen-ID und Pattern-Position ab.
    return RuleResponse(
        id=class_id * 100 + pattern_index + 1,
        classId=class_id,
        name=str(pattern.get("name", f"pattern_{pattern_index + 1}")),
        eventType=str(data.get("event_type", "")),
        target=str(pattern.get("target", "request")),
        regex=str(pattern.get("regex", "")),
        severity=str(data.get("severity", "medium")),
        enabled=bool(data.get("enabled", True)),
        description=str(pattern.get("description", "")),
    )


def _to_class_response(class_id: int, path: Path) -> RuleClassResponse:
    # Eine JSON-Datei entspricht in der UI einer Regelklasse.
    # Die einzelnen pattern-Eintraege werden als Regeln angezeigt.
    data = _load_rule_file(path)
    rule_name = path.stem
    patterns = data.get("patterns") or []

    return RuleClassResponse(
        id=class_id,
        name=DISPLAY_NAMES.get(rule_name, rule_name.replace("_", " ").title()),
        description=_class_description(rule_name, data),
        rules=[
            _to_rule_response(class_id, pattern_index, data, pattern)
            for pattern_index, pattern in enumerate(patterns)
            if isinstance(pattern, dict)
        ],
    )


def _classes_with_paths() -> list[tuple[int, Path, RuleClassResponse]]:
    # Hilfsstruktur, damit wir beim Bearbeiten neben der UI-Klasse auch den
    # echten Dateipfad zur passenden JSON-Regel kennen.
    classes = []
    for index, path in enumerate(_rule_files(), start=1):
        classes.append((index, path, _to_class_response(index, path)))
    return classes


def _find_class(class_id: int) -> tuple[Path, dict[str, Any], RuleClassResponse]:
    for current_id, path, rule_class in _classes_with_paths():
        if current_id == class_id:
            return path, _load_rule_file(path), rule_class
    raise HTTPException(status_code=404, detail="Regelklasse nicht gefunden")


def _find_rule(rule_id: int) -> tuple[Path, dict[str, Any], int, RuleClassResponse]:
    # Regel-ID wieder in Klassen-ID und Pattern-Index zurueckrechnen.
    # Beispiel: 203 -> Klasse 2, drittes Pattern.
    class_id = rule_id // 100
    pattern_index = (rule_id % 100) - 1
    path, data, rule_class = _find_class(class_id)

    patterns = data.get("patterns") or []
    if pattern_index < 0 or pattern_index >= len(patterns):
        raise HTTPException(status_code=404, detail="Regel nicht gefunden")

    return path, data, pattern_index, rule_class


@router.get("", response_model=list[RuleClassResponse])
def list_rules():
    return [rule_class for _, _, rule_class in _classes_with_paths()]


@router.post("/classes", response_model=RuleClassResponse, status_code=status.HTTP_201_CREATED)
def create_rule_class(payload: RuleClassCreate):
    rule_name = _slugify(payload.name)
    path = RULES_DIR / f"{rule_name}.json"

    if path.exists():
        raise HTTPException(status_code=409, detail="Regelklasse existiert bereits")

    data = {
        "event_type": rule_name,
        "enabled": True,
        "severity": "medium",
        "patterns": [],
    }
    _write_rule_file(path, data)

    for class_id, class_path, rule_class in _classes_with_paths():
        if class_path == path:
            return RuleClassResponse(
                id=class_id,
                name=payload.name.strip(),
                description=payload.description.strip(),
                rules=rule_class.rules,
            )

    raise HTTPException(status_code=500, detail="Regelklasse konnte nicht geladen werden")


@router.delete("/classes/{class_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_rule_class(class_id: int):
    path, _, _ = _find_class(class_id)
    path.unlink()


@router.post("", response_model=RuleResponse, status_code=status.HTTP_201_CREATED)
def create_rule(payload: RuleCreate):
    path, data, _ = _find_class(payload.class_id)

    patterns = data.setdefault("patterns", [])
    pattern = {
        "name": payload.name,
        "regex": payload.regex,
        "description": payload.description,
        "target": payload.target,
    }
    patterns.append(pattern)

    data["event_type"] = payload.event_type
    data["severity"] = payload.severity
    data["enabled"] = payload.enabled
    _write_rule_file(path, data)

    return _to_rule_response(payload.class_id, len(patterns) - 1, data, pattern)


@router.patch("/{rule_id}", response_model=RuleResponse)
def update_rule(rule_id: int, payload: RuleUpdate):
    path, data, pattern_index, rule_class = _find_rule(rule_id)

    patterns = data.get("patterns") or []
    patterns[pattern_index] = {
        "name": payload.name,
        "regex": payload.regex,
        "description": payload.description,
        "target": payload.target,
    }

    data["event_type"] = payload.event_type
    data["severity"] = payload.severity
    data["enabled"] = payload.enabled
    _write_rule_file(path, data)

    return _to_rule_response(rule_class.id, pattern_index, data, patterns[pattern_index])


@router.delete("/{rule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_rule(rule_id: int):
    path, data, pattern_index, _ = _find_rule(rule_id)
    patterns = data.get("patterns") or []
    del patterns[pattern_index]
    data["patterns"] = patterns
    _write_rule_file(path, data)
