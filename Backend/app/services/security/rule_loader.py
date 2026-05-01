"""Load JSON based security detection rules."""

# TODO(Tim): JSON-Regeln aus services/security/rules/*.json laden.
# Ziel: sqli.json, xss.json, path_traversal.json und upload_extensions.json sollen
# zentral eingelesen werden, damit Detektoren keine Regex-Listen mehr hart im Code haben.
# Fertig, wenn fehlerhafte JSON-Dateien eine verstaendliche Fehlermeldung ausloesen.
