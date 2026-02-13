#!/bin/bash
cd "$(dirname "$0")"
echo "Starting GrecoTime Server..."
# Kill any existing python server on port 8000 to avoid conflicts
lsof -ti:8000 | xargs kill -9 2>/dev/null

# Start server in background
python3 -m http.server 8000 &
SERVER_PID=$!

echo "Server started with PID $SERVER_PID"
echo "Opening game in browser..."
sleep 2
open "http://localhost:8000"

echo "Press Ctrl+C to stop the server."
wait $SERVER_PID
