# Security Middleware.
# Die Datei schaut sich jeden Request an der reinkommt und checkt auf offensichtige Muster.
# Also z.B. SQL Injection, XSS, Path Traversal oder gefaehrliche Uploads.
# Wenn was auffaellig ist, wird daraus ein Event das spaeter im Dashboard auftauchen kann.

import re
from fastapi import Request
from sqlmodel import Session
from urllib.parse import unquote

from app.database import engine
from app.services.security.event_logger import log_security_event

SQL_INJECTION_PATTERNS = [
    re.compile(r"'\s*or\s*'?\d+'?\s*=\s*'?\d+", re.IGNORECASE),    # ' OR 1=1, ' OR '1'='1
    re.compile(r"union\s+select", re.IGNORECASE),                  # UNION SELECT
    re.compile(r"drop\s+table", re.IGNORECASE),                    # DROP TABLE
    re.compile(r";\s*delete\s+from", re.IGNORECASE),               # ; DELETE FROM
    re.compile(r"'\s*--", re.IGNORECASE),                          # ' --
]

def detect_sql_injection(text: str) -> str | None: 
    # überprueft ob ein SQL-Injection-Pattern vorkommt und gibt das erste gefundene Muster als String String zurueck
    if not text:
        return None
    for pattern in SQL_INJECTION_PATTERNS: 
        match = pattern.search(text)
        if match:
            return match.group(0)
    return None
    

async def security_middleware(request: Request, call_next):
    # wird von FastAPI bei jedem Request aufgerufen und checkt Request nach Angriffsmuster
    source_ip = request.client.host if request.client else "unknown"
    path = request.url.path
    
    full_url = unquote(str(request.url))        # unquote weil Browser URL kodiert (z.B. ' wird zu %27 )
    sql_hit = detect_sql_injection(full_url)

    if sql_hit:
        print(f"[Middleware] SQL-Injection in URL erkannt: {sql_hit}")
        with Session(engine) as session:
            log_security_event(
                session=session,
                event_type="sql_injection",
                source_ip=source_ip,
                path=path,
                detail=f"Muster '{sql_hit}' in URL erkannt",
                severity="high",
            )

    response = await call_next(request)
    return response

