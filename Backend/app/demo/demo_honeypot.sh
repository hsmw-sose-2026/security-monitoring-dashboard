#!/bin/bash
# Demo script fuer Honeypot endpoint detection
# Dieses Script simuliert einen reconnaissance scan mit mehreren honeypot endpoints
# und zeigt wie das system die Attacken detektiert

# Configuration
BACKEND_HOST="${BACKEND_HOST:-http://localhost:8000}"
SCAN_DELAY="${SCAN_DELAY:-0.2}"  # Delay zwischen requests in s

echo "Honeypot Detection Demo"
echo ""
echo "Backend: $BACKEND_HOST"
echo "Scan Interval: ${SCAN_DELAY}s"
echo ""

# Honeypot paths welche reconnaissance alerts triggern
HONEYPOT_PATHS=(
    "/.env",
    "/wp-admin",
    "/.git/config",
    "/admin/backup.sql",
    "/phpmyadmin",
    "/requirements.txt"
)

echo "Starting reconnaissance simulation..."
echo "Hitting honeypot endpoints to trigger alerts:"
echo ""

for path in "${HONEYPOT_PATHS[@]}"; do
    echo "[$(date '+%H:%M:%S')] Requesting: $path"
    curl -s -I "$BACKEND_HOST$path" > /dev/null
    sleep "$SCAN_DELAY"
done

echo ""
echo "Scan complete"
echo ""
echo "Expected behavior:"
echo "  1. Honeypot hit erzeugt 'honeypot_triggered' event (CRITICAL)"
echo "  2. Mehr als 2 hits in 5 minuten von der selben IP triggert 'reconnaissance' alert"
