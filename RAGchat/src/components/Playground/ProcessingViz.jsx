import { motion, AnimatePresence } from 'framer-motion'
import { Check, Loader2, FileText, Box, Cpu, Search, ArrowRight, Sparkles } from 'lucide-react'

function StepBadges({ steps, currentStep, completedSteps }) {
  return (
    <div className="flex flex-wrap items-center gap-1 mb-3">
      {steps.map((step, i) => {
        const isComplete = completedSteps.includes(step.id)
        const isCurrent = currentStep === step.id
        return (
          <div key={step.id} className="flex items-center gap-1">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
              isComplete ? 'bg-success/10 text-success border border-success/20'
                : isCurrent ? 'bg-accent/10 text-accent-light border border-accent/30 animate-pulse-glow'
                  : 'bg-bg-card text-text-muted border border-border'
            }`}>
              {isComplete && <Check size={10} />}
              {isCurrent && <Loader2 size={10} className="animate-spin" />}
              {step.label}
            </div>
            {i < steps.length - 1 && (
              <div className={`w-3 h-px ${isComplete ? 'bg-success/40' : 'bg-border'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function ChunkingViz({ chunks, type }) {
  const display = chunks?.slice(0, 12) || []
  const colors = {
    fixed: 'bg-indigo-500/20 border-indigo-500/40',
    sentence: 'bg-violet-500/20 border-violet-500/40',
    'parent-child': 'bg-pink-500/20 border-pink-500/40',
  }
  const color = colors[type] || colors.fixed

  return (
    <div className="rounded-lg bg-bg-primary/50 border border-border p-3">
      <div className="flex items-center gap-2 mb-2">
        <FileText size={13} className="text-accent-light" />
        <span className="text-xs font-medium text-text-secondary">
          Document → {chunks?.length || 0} chunks ({type})
        </span>
      </div>
      <div className="relative">
        <motion.div
          initial={{ width: '100%', opacity: 1 }}
          animate={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 bg-accent/10 rounded"
        />
        <div className="flex flex-wrap gap-1">
          {display.map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.05, type: 'spring', stiffness: 300 }}
              className={`h-6 rounded border text-[9px] flex items-center px-1.5 ${color}`}
              style={{ width: `${Math.max(28, Math.min(60, 200 / display.length))}px` }}
            >
              <span className="truncate text-text-muted">#{i + 1}</span>
            </motion.div>
          ))}
          {chunks && chunks.length > 12 && (
            <div className="h-6 flex items-center px-1.5 text-[9px] text-text-muted">
              +{chunks.length - 12}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function EmbeddingViz({ count, done }) {
  const dots = Array.from({ length: Math.min(count || 0, 12) })
  return (
    <div className="rounded-lg bg-bg-primary/50 border border-border p-3">
      <div className="flex items-center gap-2 mb-2">
        <Cpu size={13} className="text-accent-light" />
        <span className="text-xs font-medium text-text-secondary">
          Chunks → {count || 0} vector embeddings
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          {dots.map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, borderRadius: '2px' }}
              animate={{
                scale: 1,
                borderRadius: '50%',
                backgroundColor: done
                  ? 'rgba(99, 102, 241, 0.6)'
                  : 'rgba(99, 102, 241, 0.3)',
              }}
              transition={{ delay: i * 0.06, duration: 0.4, type: 'spring' }}
              className="w-3.5 h-3.5 border border-accent/40"
            />
          ))}
        </div>
        {!done && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 size={14} className="text-accent-light" />
          </motion.div>
        )}
        {done && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
            <Check size={14} className="text-success" />
          </motion.div>
        )}
      </div>
    </div>
  )
}

function RetrievalViz({ results, query }) {
  const topResults = results?.slice(0, 4) || []
  return (
    <div className="rounded-lg bg-bg-primary/50 border border-border p-3">
      <div className="flex items-center gap-2 mb-2">
        <Search size={13} className="text-accent-light" />
        <span className="text-xs font-medium text-text-secondary">
          Query matched {results?.length || 0} chunks
        </span>
      </div>
      {query && (
        <div className="text-[10px] text-accent-light bg-accent/5 border border-accent/20 rounded px-2 py-1 mb-2 truncate">
          "{query}"
        </div>
      )}
      <div className="space-y-1">
        {topResults.map((r, i) => (
          <motion.div
            key={i}
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-2"
          >
            <div className="flex items-center gap-1 shrink-0">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1 + 0.2, type: 'spring' }}
                className="w-2.5 h-2.5 rounded-full bg-accent"
                style={{ opacity: 1 - i * 0.2 }}
              />
              <span className="text-[9px] text-text-muted w-8">
                {(r.score * 100).toFixed(0)}%
              </span>
            </div>
            <div className="text-[10px] text-text-secondary truncate flex-1">
              {r.text?.slice(0, 60)}...
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function GeneratingViz() {
  return (
    <div className="rounded-lg bg-bg-primary/50 border border-border p-3">
      <div className="flex items-center gap-2">
        <Sparkles size={13} className="text-accent-light" />
        <span className="text-xs font-medium text-text-secondary">Generating response</span>
        <motion.div className="flex gap-0.5 ml-1">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              className="w-1 h-1 rounded-full bg-accent-light"
            />
          ))}
        </motion.div>
      </div>
    </div>
  )
}

export default function ProcessingViz({ steps, currentStep, completedSteps, vizData, stepMessage }) {
  if (!steps?.length) return null

  const chunkData = vizData?.chunk
  const embedData = vizData?.embed
  const retrieveData = vizData?.retrieve
  const showChunking = chunkData?.chunks
  const showEmbedding = completedSteps.includes('embed') || currentStep === 'embed'
  const showRetrieval = retrieveData?.results
  const showGenerating = currentStep === 'generate'

  return (
    <div className="space-y-2">
      <StepBadges steps={steps} currentStep={currentStep} completedSteps={completedSteps} />

      {stepMessage && (
        <p className="text-xs text-text-muted italic">{stepMessage}</p>
      )}

      <AnimatePresence mode="popLayout">
        {showChunking && (
          <motion.div key="chunk-viz" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <ChunkingViz chunks={chunkData.chunks} type={chunkData.type} />
          </motion.div>
        )}
        {showEmbedding && (
          <motion.div key="embed-viz" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <EmbeddingViz count={embedData?.count} done={embedData?.done} />
          </motion.div>
        )}
        {showRetrieval && (
          <motion.div key="retrieve-viz" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <RetrievalViz results={retrieveData.results} query={retrieveData.query} />
          </motion.div>
        )}
        {showGenerating && (
          <motion.div key="gen-viz" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <GeneratingViz />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
