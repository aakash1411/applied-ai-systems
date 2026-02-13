#!/bin/bash
set -e

echo "=== Starting Ollama with CORS enabled ==="
export OLLAMA_ORIGINS="*"
ollama serve &
OLLAMA_PID=$!
sleep 2

echo "=== Starting Cloudflare Quick Tunnel ==="
cloudflared tunnel --url http://localhost:11434 &
CF_PID=$!

echo "$OLLAMA_PID $CF_PID" > /tmp/localinference.pids
echo ""
echo "Ollama PID: $OLLAMA_PID"
echo "Cloudflare Tunnel PID: $CF_PID"
echo ""
echo "Look for the tunnel URL in the output above (*.trycloudflare.com)"
echo "Paste that URL into the RAG demo website settings."
echo ""
echo "Press Ctrl+C to stop both services."

trap "kill $OLLAMA_PID $CF_PID 2>/dev/null; rm -f /tmp/localinference.pids; echo 'Stopped.'" EXIT
wait
