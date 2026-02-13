# RAG Explorer

Interactive web application for exploring **7 RAG architectures** with live in-browser processing and local LLM inference.

[![Live Demo](https://img.shields.io/badge/Live_Demo-rag--explorer.pages.dev-6366f1?style=flat-square)](https://rag-explorer.pages.dev)

---

## Overview

Upload any document (PDF, TXT, Markdown) and run it through different RAG pipelines in real time. Watch chunking, embedding, vector retrieval, and LLM generation happen live with step-by-step visual animations.

### Architecture

```
┌─────────────────────────────────────────────────┐
│              User's Browser                      │
│                                                  │
│  Document ──→ Chunking ──→ Embedding ──→ Vector  │
│  (pdf.js)     (JS)        (transformers.js      │
│                            or Ollama)            │
│                                 │                │
│  Chat UI  ←── Stream  ←── Retrieval             │
│  (React)      Response     (cosine sim)          │
└───────────────────┬─────────────────────────────┘
                    │ LLM calls only (HTTPS)
        ┌───────────▼───────────┐
        │  Cloudflare Tunnel    │
        │  (free, encrypted)    │
        └───────────┬───────────┘
        ┌───────────▼───────────┐
        │  Ollama (llama3.1:8b) │
        │  Local machine        │
        └───────────────────────┘
```

All heavy processing (parsing, chunking, embedding, vector search) runs client-side. Only LLM text generation hits the server — keeping the backend stateless.

### 7 RAG Architectures

| # | Architecture | Differentiator | Key Technique |
|---|---|---|---|
| 1 | **Basic RAG** | Baseline approach | Fixed-size chunks, top-k cosine retrieval |
| 2 | **Sentence Window** | Precision + context | Sentence-level retrieval, ±2 sentence expansion |
| 3 | **Parent-Child** | Hierarchical chunking | Small chunks retrieve, large parent chunks provide context |
| 4 | **HyDE** | Query transformation | LLM generates hypothetical answer, embeds that instead |
| 5 | **Multi-Query** | Query expansion | 3 query variants + Reciprocal Rank Fusion |
| 6 | **Corrective RAG** | Self-correcting retrieval | LLM scores chunk relevance, retries on low quality |
| 7 | **Self-RAG** | Self-reflecting generation | Generate → critique → re-retrieve if needed |

### Tech Stack

| Layer | Technology | Why |
|---|---|---|
| UI Framework | React 19 + Vite | Fast dev, optimized builds |
| Styling | TailwindCSS 4 | Utility-first, zero runtime |
| Animations | Framer Motion | Layout animations, step-by-step pipeline viz |
| In-Browser Embeddings | `@xenova/transformers` | Runs all-MiniLM-L6-v2 in WebAssembly |
| PDF Parsing | pdfjs-dist | Mozilla's PDF engine, client-side |
| Vector Search | Custom implementation | Cosine similarity + RRF, no external DB |
| LLM Inference | Ollama via Cloudflare Tunnel | Free, secure, local-first |
| Hosting | Cloudflare Pages | Free tier, unlimited bandwidth |

### Features

- **Real-time pipeline visualization** — animated chunking, embedding (blocks → vector dots), retrieval with similarity scores, streaming generation
- **Hybrid mode** — live inference when Ollama is running, graceful demo fallback when offline
- **File support** — PDF, TXT, Markdown up to 5 MB, parsed entirely in-browser
- **Configurable endpoint** — paste any Ollama URL (localhost or tunnel) via settings panel

### Run Locally

```bash
cd RAGchat
npm install
npm run dev
```

To enable live LLM inference:

```bash
brew install ollama cloudflared
ollama pull llama3.1:8b
cd LocalInference && ./start.sh
```

### Project Structure

```
src/
├── lib/                    # Core RAG engine
│   ├── ragPipelines.js     # 7 pipeline implementations
│   ├── chunking.js         # Fixed, sentence-window, parent-child strategies
│   ├── embeddings.js       # Ollama + transformers.js dual-path embedding
│   ├── vectorStore.js      # In-memory cosine similarity + RRF
│   ├── ollama.js           # Ollama API client with streaming
│   ├── fileParser.js       # PDF/TXT/MD parsing
│   └── fallback.js         # Demo mode with pre-recorded responses
├── components/
│   ├── Landing/            # Hero, overview, CTA
│   └── Playground/         # Architecture cards, chat, file upload, pipeline viz
├── hooks/                  # useOllamaStatus, useRAGPipeline
└── data/                   # Architecture metadata and descriptions
```
