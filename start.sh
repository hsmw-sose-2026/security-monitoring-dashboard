#!/bin/sh

# Start Bun server in the background
bun fe/server.js &

# Start Uvicorn in the background
PYTHONPATH=$PYTHONPATH:/be uvicorn be.app.main:app --host 0.0.0.0 --port 8000 &

# Wait for all background processes to finish (keeps container running)
wait

# Exit with the status of the process that exited first
exit $?