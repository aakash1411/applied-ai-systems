function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}

export class VectorStore {
  constructor() {
    this.vectors = []
    this.metadata = []
  }

  add(embedding, meta) {
    this.vectors.push(embedding)
    this.metadata.push(meta)
  }

  addBatch(embeddings, metas) {
    for (let i = 0; i < embeddings.length; i++) {
      this.add(embeddings[i], metas[i])
    }
  }

  search(queryEmbedding, topK = 5) {
    const scored = this.vectors.map((vec, i) => ({
      score: cosineSimilarity(queryEmbedding, vec),
      ...this.metadata[i],
    }))
    scored.sort((a, b) => b.score - a.score)
    return scored.slice(0, topK)
  }

  clear() {
    this.vectors = []
    this.metadata = []
  }

  get size() {
    return this.vectors.length
  }
}

export function reciprocalRankFusion(resultSets, k = 60) {
  const scores = new Map()
  for (const results of resultSets) {
    results.forEach((item, rank) => {
      const key = item.text
      const prev = scores.get(key) || { score: 0, item }
      prev.score += 1 / (k + rank + 1)
      scores.set(key, prev)
    })
  }
  return Array.from(scores.values())
    .sort((a, b) => b.score - a.score)
    .map(({ item, score }) => ({ ...item, score }))
}
