import { getOllamaUrl } from './ollama'

const MAX_CHUNKS = 25
let pipeline = null
let loadingPromise = null
let _progressCallback = null

export function onProgress(callback) {
  _progressCallback = callback
}

async function loadBrowserPipeline() {
  if (pipeline) return pipeline
  if (loadingPromise) return loadingPromise
  loadingPromise = (async () => {
    const { pipeline: createPipeline } = await import('@xenova/transformers')
    pipeline = await createPipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
      progress_callback: (p) => _progressCallback?.(p),
    })
    return pipeline
  })()
  return loadingPromise
}

async function ollamaEmbed(texts) {
  const res = await fetch(`${getOllamaUrl()}/api/embed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'llama3.1:8b', input: texts }),
  })
  if (!res.ok) throw new Error('ollama-embed-fail')
  const data = await res.json()
  return data.embeddings
}

async function browserEmbed(texts) {
  const model = await loadBrowserPipeline()
  const results = []
  for (const text of texts) {
    const out = await model(text, { pooling: 'mean', normalize: true })
    results.push(Array.from(out.data))
  }
  return results
}

export function capChunks(chunks) {
  if (chunks.length <= MAX_CHUNKS) return chunks
  const step = Math.ceil(chunks.length / MAX_CHUNKS)
  return chunks.filter((_, i) => i % step === 0).slice(0, MAX_CHUNKS)
}

export async function embed(texts, { useOllama = false } = {}) {
  const items = Array.isArray(texts) ? texts : [texts]
  const capped = items.slice(0, MAX_CHUNKS)
  if (useOllama) {
    try {
      return await ollamaEmbed(capped)
    } catch {
      return await browserEmbed(capped)
    }
  }
  return await browserEmbed(capped)
}

export async function embedSingle(text, opts = {}) {
  const results = await embed([text], opts)
  return results[0]
}

export function isModelLoaded() {
  return pipeline !== null
}
