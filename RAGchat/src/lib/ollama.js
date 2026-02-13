const DEFAULT_URL = 'http://localhost:11434'

function getBaseUrl() {
  return localStorage.getItem('ollama_url') || DEFAULT_URL
}

export function setOllamaUrl(url) {
  localStorage.setItem('ollama_url', url.replace(/\/+$/, ''))
}

export function getOllamaUrl() {
  return getBaseUrl()
}

export async function checkConnection() {
  try {
    const res = await fetch(`${getBaseUrl()}/api/tags`, {
      signal: AbortSignal.timeout(3000),
    })
    return res.ok
  } catch {
    return false
  }
}

export async function generate(prompt, options = {}) {
  const res = await fetch(`${getBaseUrl()}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: options.model || 'llama3.1:8b',
      prompt,
      stream: false,
      ...options,
    }),
  })
  if (!res.ok) throw new Error(`Ollama error: ${res.status}`)
  const data = await res.json()
  return data.response
}

export async function* generateStream(prompt, options = {}) {
  const res = await fetch(`${getBaseUrl()}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: options.model || 'llama3.1:8b',
      prompt,
      stream: true,
      ...options,
    }),
  })
  if (!res.ok) throw new Error(`Ollama error: ${res.status}`)
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''
    for (const line of lines) {
      if (!line.trim()) continue
      try {
        const json = JSON.parse(line)
        if (json.response) yield json.response
      } catch { /* skip malformed lines */ }
    }
  }
}
