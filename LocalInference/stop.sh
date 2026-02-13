#!/bin/bash

if [ -f /tmp/localinference.pids ]; then
  kill $(cat /tmp/localinference.pids) 2>/dev/null
  rm -f /tmp/localinference.pids
  echo "Stopped Ollama and Cloudflare Tunnel."
else
  echo "No running services found. Trying pkill..."
  pkill -f "ollama serve" 2>/dev/null
  pkill -f "cloudflared tunnel" 2>/dev/null
  echo "Done."
fi
