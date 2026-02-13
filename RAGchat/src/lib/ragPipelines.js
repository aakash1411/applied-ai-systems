import { fixedSizeChunk, sentenceWindowChunk, parentChildChunk, standardChunk } from './chunking'
import { embed, embedSingle, capChunks } from './embeddings'
import { VectorStore, reciprocalRankFusion } from './vectorStore'
import { generate } from './ollama'
import { checkConnection } from './ollama'

function buildPrompt(query, context) {
  return `You are a helpful assistant. Answer the question based only on the provided context. If the context doesn't contain enough information, say so.

Context:
${context}

Question: ${query}

Answer:`
}

async function embedChunks(chunks, onStep, label) {
  const useOllama = await checkConnection()
  const capped = capChunks(chunks)
  onStep?.('embed', `Embedding ${capped.length} ${label}${useOllama ? ' (via Ollama)' : ' (in-browser)'}...`)
  const embeddings = await embed(capped.map(c => c.text), { useOllama })
  return { capped, embeddings, useOllama }
}

export const pipelines = {
  basic: {
    name: 'Basic RAG',
    steps: ['chunk', 'embed', 'retrieve', 'generate'],
    async run(text, query, onStep) {
      onStep?.('chunk', 'Chunking document...')
      const allChunks = fixedSizeChunk(text, 512, 50)
      onStep?.('chunk', { chunks: allChunks, type: 'fixed' })

      const { capped, embeddings, useOllama } = await embedChunks(allChunks, onStep, 'chunks')
      onStep?.('embed', { count: capped.length, done: true })

      const store = new VectorStore()
      store.addBatch(embeddings, capped)

      onStep?.('retrieve', 'Searching for relevant chunks...')
      const queryEmb = await embedSingle(query, { useOllama })
      const results = store.search(queryEmb, 5)
      onStep?.('retrieve', { results, query })

      const context = results.map(r => r.text).join('\n\n')
      onStep?.('generate', 'Generating answer...')
      return { results, prompt: buildPrompt(query, context), context, chunks: allChunks }
    },
  },

  sentenceWindow: {
    name: 'Sentence Window',
    steps: ['chunk', 'embed', 'retrieve', 'expand', 'generate'],
    async run(text, query, onStep) {
      onStep?.('chunk', 'Splitting into sentences with windows...')
      const allChunks = sentenceWindowChunk(text, 2)
      onStep?.('chunk', { chunks: allChunks, type: 'sentence' })

      const { capped, embeddings, useOllama } = await embedChunks(allChunks, onStep, 'sentences')
      onStep?.('embed', { count: capped.length, done: true })

      const store = new VectorStore()
      store.addBatch(embeddings, capped)

      onStep?.('retrieve', 'Retrieving matching sentences...')
      const queryEmb = await embedSingle(query, { useOllama })
      const results = store.search(queryEmb, 5)
      onStep?.('retrieve', { results, query })

      onStep?.('expand', 'Expanding to sentence windows...')
      const context = results.map(r => r.window || r.text).join('\n\n')

      onStep?.('generate', 'Generating answer...')
      return { results, prompt: buildPrompt(query, context), context, chunks: allChunks }
    },
  },

  parentChild: {
    name: 'Parent-Child',
    steps: ['chunk', 'embed', 'retrieve', 'fetch-parent', 'generate'],
    async run(text, query, onStep) {
      onStep?.('chunk', 'Creating parent and child chunks...')
      const { parents, children } = parentChildChunk(text, 1024, 256)
      onStep?.('chunk', { chunks: children, parents, type: 'parent-child' })

      const { capped, embeddings, useOllama } = await embedChunks(children, onStep, 'child chunks')
      onStep?.('embed', { count: capped.length, done: true })

      const store = new VectorStore()
      store.addBatch(embeddings, capped)

      onStep?.('retrieve', 'Retrieving matching child chunks...')
      const queryEmb = await embedSingle(query, { useOllama })
      const results = store.search(queryEmb, 5)
      onStep?.('retrieve', { results, query })

      onStep?.('fetch-parent', 'Fetching parent chunks for context...')
      const parentIds = [...new Set(results.map(r => r.parentId))]
      const parentTexts = parentIds.map(id => parents[id]?.text).filter(Boolean)
      const context = parentTexts.join('\n\n')

      onStep?.('generate', 'Generating answer...')
      return { results, prompt: buildPrompt(query, context), context, chunks: children, parents }
    },
  },

  hyde: {
    name: 'HyDE',
    steps: ['chunk', 'embed', 'hypothesize', 'retrieve', 'generate'],
    async run(text, query, onStep) {
      onStep?.('chunk', 'Chunking document...')
      const allChunks = standardChunk(text, 512, 50)
      onStep?.('chunk', { chunks: allChunks, type: 'fixed' })

      const { capped, embeddings, useOllama } = await embedChunks(allChunks, onStep, 'chunks')
      onStep?.('embed', { count: capped.length, done: true })

      const store = new VectorStore()
      store.addBatch(embeddings, capped)

      onStep?.('hypothesize', 'Generating hypothetical answer...')
      const hypothetical = await generate(
        `Write a short passage that would answer this question: "${query}". Write it as if it were from a document.`
      )

      onStep?.('retrieve', 'Retrieving chunks similar to hypothetical...')
      const hypoEmb = await embedSingle(hypothetical, { useOllama })
      const results = store.search(hypoEmb, 5)
      onStep?.('retrieve', { results, query })

      const context = results.map(r => r.text).join('\n\n')
      onStep?.('generate', 'Generating final answer...')
      return { results, prompt: buildPrompt(query, context), context, hypothetical, chunks: allChunks }
    },
  },

  multiQuery: {
    name: 'Multi-Query',
    steps: ['chunk', 'embed', 'expand-queries', 'retrieve', 'merge', 'generate'],
    async run(text, query, onStep) {
      onStep?.('chunk', 'Chunking document...')
      const allChunks = standardChunk(text, 512, 50)
      onStep?.('chunk', { chunks: allChunks, type: 'fixed' })

      const { capped, embeddings, useOllama } = await embedChunks(allChunks, onStep, 'chunks')
      onStep?.('embed', { count: capped.length, done: true })

      const store = new VectorStore()
      store.addBatch(embeddings, capped)

      onStep?.('expand-queries', 'Generating query variations...')
      const variantsRaw = await generate(
        `Generate 3 different versions of this search query, each on a new line. Only output the queries, nothing else.\n\nQuery: "${query}"`
      )
      const variants = variantsRaw.split('\n').map(v => v.replace(/^\d+[.)]\s*/, '').trim()).filter(Boolean).slice(0, 3)
      const allQueries = [query, ...variants]

      onStep?.('retrieve', `Retrieving for ${allQueries.length} queries...`)
      const resultSets = []
      for (const q of allQueries) {
        const qEmb = await embedSingle(q, { useOllama })
        resultSets.push(store.search(qEmb, 5))
      }

      onStep?.('merge', 'Merging results with reciprocal rank fusion...')
      const merged = reciprocalRankFusion(resultSets)
      const topResults = merged.slice(0, 5)
      onStep?.('retrieve', { results: topResults, query })

      const context = topResults.map(r => r.text).join('\n\n')
      onStep?.('generate', 'Generating answer...')
      return { results: topResults, prompt: buildPrompt(query, context), context, variants: allQueries, chunks: allChunks }
    },
  },

  crag: {
    name: 'Corrective RAG',
    steps: ['chunk', 'embed', 'retrieve', 'evaluate', 'generate'],
    async run(text, query, onStep) {
      onStep?.('chunk', 'Chunking document...')
      const allChunks = standardChunk(text, 512, 50)
      onStep?.('chunk', { chunks: allChunks, type: 'fixed' })

      const { capped, embeddings, useOllama } = await embedChunks(allChunks, onStep, 'chunks')
      onStep?.('embed', { count: capped.length, done: true })

      const store = new VectorStore()
      store.addBatch(embeddings, capped)

      onStep?.('retrieve', 'Retrieving candidate chunks...')
      const queryEmb = await embedSingle(query, { useOllama })
      let results = store.search(queryEmb, 8)

      onStep?.('evaluate', 'Evaluating relevance of retrieved chunks...')
      const evaluations = []
      for (const r of results.slice(0, 5)) {
        const score = await generate(
          `Rate the relevance of this text to the question on a scale of 1-5. Only respond with a number.\n\nQuestion: "${query}"\n\nText: "${r.text.slice(0, 300)}"`
        )
        const numScore = parseInt(score) || 3
        evaluations.push({ ...r, relevanceScore: numScore })
      }

      const relevant = evaluations.filter(e => e.relevanceScore >= 3)
      let context
      if (relevant.length < 2) {
        onStep?.('evaluate', 'Low relevance — refining query...')
        const refined = await generate(`Rewrite this question to be more specific for document search: "${query}"`)
        const refinedEmb = await embedSingle(refined, { useOllama })
        results = store.search(refinedEmb, 5)
        context = results.map(r => r.text).join('\n\n')
      } else {
        context = relevant.map(r => r.text).join('\n\n')
      }

      onStep?.('generate', 'Generating answer...')
      return { results: relevant.length >= 2 ? relevant : results, prompt: buildPrompt(query, context), context, chunks: allChunks }
    },
  },

  selfRag: {
    name: 'Self-RAG',
    steps: ['chunk', 'embed', 'retrieve', 'generate', 'critique', 'refine'],
    async run(text, query, onStep) {
      onStep?.('chunk', 'Chunking document...')
      const allChunks = standardChunk(text, 512, 50)
      onStep?.('chunk', { chunks: allChunks, type: 'fixed' })

      const { capped, embeddings, useOllama } = await embedChunks(allChunks, onStep, 'chunks')
      onStep?.('embed', { count: capped.length, done: true })

      const store = new VectorStore()
      store.addBatch(embeddings, capped)

      onStep?.('retrieve', 'Retrieving relevant chunks...')
      const queryEmb = await embedSingle(query, { useOllama })
      const results = store.search(queryEmb, 5)
      onStep?.('retrieve', { results, query })
      let context = results.map(r => r.text).join('\n\n')

      onStep?.('generate', 'Generating initial answer...')
      const initialAnswer = await generate(buildPrompt(query, context))

      onStep?.('critique', 'Self-critiquing response...')
      const critique = await generate(
        `Evaluate this answer. Is it well-supported by the context? Is it complete? Respond with PASS or FAIL followed by a brief reason.\n\nQuestion: "${query}"\nContext: "${context.slice(0, 500)}"\nAnswer: "${initialAnswer.slice(0, 500)}"`
      )

      if (critique.toUpperCase().includes('FAIL')) {
        onStep?.('refine', 'Refining with additional retrieval...')
        const moreResults = store.search(queryEmb, 10).slice(5)
        const extraContext = moreResults.map(r => r.text).join('\n\n')
        context = context + '\n\n' + extraContext
        onStep?.('generate', 'Regenerating answer...')
      }

      return { results, prompt: buildPrompt(query, context), context, initialAnswer, critique, chunks: allChunks }
    },
  },
}
