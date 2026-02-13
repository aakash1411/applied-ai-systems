#!/bin/bash
set -e

echo "=== Installing Ollama + cloudflared ==="
brew install ollama cloudflared 2>/dev/null || echo "Already installed"

echo "=== Pulling llama3.1:8b ==="
ollama pull llama3.1:8b

echo "=== Verifying ==="
ollama list
echo "Setup complete."
