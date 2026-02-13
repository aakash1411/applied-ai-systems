const DEMO_DATA = {
  document: 'Artificial Intelligence (AI) is transforming industries worldwide. Machine learning, a subset of AI, enables systems to learn from data. Deep learning uses neural networks with many layers. Natural Language Processing (NLP) allows machines to understand human language. Computer vision enables machines to interpret visual data. Reinforcement learning trains agents through rewards and penalties. Transfer learning allows models to apply knowledge from one task to another. RAG (Retrieval-Augmented Generation) combines retrieval and generation for more accurate AI responses.',
  queries: {
    'What is machine learning?': 'Machine learning is a subset of AI that enables systems to learn from data without being explicitly programmed. It is one of the fundamental technologies driving AI transformation across industries.',
    'How does RAG work?': 'RAG (Retrieval-Augmented Generation) works by combining retrieval and generation. It first retrieves relevant information from a knowledge base, then uses that information to generate more accurate and grounded AI responses.',
    'What is deep learning?': 'Deep learning is a technique that uses neural networks with many layers (deep neural networks) to learn complex patterns from data. It is a subset of machine learning and has been particularly successful in areas like computer vision and natural language processing.',
  },
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function runFallbackPipeline(pipelineId, query, onStep) {
  const steps = {
    basic: ['chunk', 'embed', 'retrieve', 'generate'],
    sentenceWindow: ['chunk', 'embed', 'retrieve', 'expand', 'generate'],
    parentChild: ['chunk', 'embed', 'retrieve', 'fetch-parent', 'generate'],
    hyde: ['chunk', 'embed', 'hypothesize', 'retrieve', 'generate'],
    multiQuery: ['chunk', 'embed', 'expand-queries', 'retrieve', 'merge', 'generate'],
    crag: ['chunk', 'embed', 'retrieve', 'evaluate', 'generate'],
    selfRag: ['chunk', 'embed', 'retrieve', 'generate', 'critique', 'refine'],
  }

  const pipelineSteps = steps[pipelineId] || steps.basic
  for (const step of pipelineSteps) {
    onStep?.(step, `[Demo] Processing: ${step}...`)
    await delay(800 + Math.random() * 400)
  }

  const answers = DEMO_DATA.queries
  const bestMatch = Object.entries(answers).reduce((best, [q, a]) => {
    const overlap = q.split(' ').filter(w => query.toLowerCase().includes(w.toLowerCase())).length
    return overlap > best.overlap ? { q, a, overlap } : best
  }, { q: '', a: '', overlap: 0 })

  return {
    answer: bestMatch.a || 'This is a demo response. Connect to Ollama for live inference.',
    isDemo: true,
  }
}

export function getDemoDocument() {
  return DEMO_DATA.document
}
