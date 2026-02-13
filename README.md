# Applied AI Systems

> Hands-on implementations of production-oriented LLM systems — retrieval architectures, evaluation frameworks, and deterministic output design.

[![Medium](https://img.shields.io/badge/Writing-Medium-000?style=for-the-badge&logo=medium)](https://medium.com/@aakashs11)

---

## Projects

| Project | Description | Stack | Demo |
|---|---|---|---|
| **[RAGchat](./RAGchat)** | Interactive demo of 7 RAG architectures with live in-browser processing | React, Vite, TailwindCSS, Ollama, Transformers.js | [Live](https://rag-explorer.pages.dev) |

---

## Philosophy

- **Retrieval-first architectures** — ground LLM outputs in real data
- **LLMs as routers, not authors** — use models for reasoning and selection, not unconstrained generation
- **Deterministic outputs** — reproducible, testable, auditable results
- **Explicit evaluation** — every system includes measurable quality checks
- **Build to learn** — each project explores a specific technique end-to-end

---

## Repository Structure

```
applied-ai-systems/
├── RAGchat/                # Interactive RAG architecture explorer
│   ├── src/                # React app + RAG engine
│   ├── package.json
│   └── README.md           # Project-specific docs
├── LocalInference/         # Ollama + Cloudflare Tunnel setup scripts
└── README.md               # This file
```

New projects will be added as top-level folders with their own README.

---

## Author

**Aakash** — [Medium](https://medium.com/@aakashs11) · [GitHub](https://github.com/aakash1411)
