# Local Inference Setup

Run Ollama + Cloudflare Tunnel to serve LLM inference for the RAG demo website.

## Prerequisites
- macOS with Homebrew

## Quick Start

```bash
# One-time setup
chmod +x setup.sh start.sh stop.sh
./setup.sh

# Start services (prints a public tunnel URL)
./start.sh

# Stop services
./stop.sh
```

## How It Works
1. `start.sh` launches Ollama on `localhost:11434` with CORS enabled
2. A Cloudflare Quick Tunnel exposes it at a random `*.trycloudflare.com` URL
3. Paste that URL into the RAG demo website's settings panel
4. Anyone visiting the site can now use live inference through the tunnel
5. When you stop the tunnel, visitors see a demo fallback
