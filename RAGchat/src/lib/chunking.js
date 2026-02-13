function splitIntoSentences(text) {
  return text.match(/[^.!?]+[.!?]+[\s]*/g) || [text]
}

export function fixedSizeChunk(text, size = 512, overlap = 50) {
  const words = text.split(/\s+/)
  const chunks = []
  for (let i = 0; i < words.length; i += size - overlap) {
    const chunk = words.slice(i, i + size).join(' ')
    if (chunk.trim()) chunks.push({ text: chunk, start: i, end: Math.min(i + size, words.length) })
  }
  return chunks
}

export function sentenceWindowChunk(text, windowSize = 2) {
  const sentences = splitIntoSentences(text)
  return sentences.map((sentence, i) => {
    const start = Math.max(0, i - windowSize)
    const end = Math.min(sentences.length, i + windowSize + 1)
    return {
      text: sentence.trim(),
      window: sentences.slice(start, end).join(' ').trim(),
      index: i,
    }
  })
}

export function parentChildChunk(text, parentSize = 1024, childSize = 256) {
  const words = text.split(/\s+/)
  const parents = []
  const children = []

  for (let pi = 0; pi < words.length; pi += parentSize) {
    const parentText = words.slice(pi, pi + parentSize).join(' ')
    const parentId = parents.length
    parents.push({ id: parentId, text: parentText })

    for (let ci = pi; ci < Math.min(pi + parentSize, words.length); ci += childSize) {
      const childText = words.slice(ci, ci + childSize).join(' ')
      if (childText.trim()) {
        children.push({ text: childText, parentId })
      }
    }
  }

  return { parents, children }
}

export function standardChunk(text, size = 512, overlap = 50) {
  return fixedSizeChunk(text, size, overlap)
}
