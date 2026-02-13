import { motion } from 'framer-motion'
import { ArrowRight, Database, FileText, Brain, MessageSquare } from 'lucide-react'
import Button from '../ui/Button'

const pipelineNodes = [
  { icon: FileText, label: 'Document', delay: 0 },
  { icon: Database, label: 'Chunks', delay: 0.2 },
  { icon: Brain, label: 'Embeddings', delay: 0.4 },
  { icon: Database, label: 'Vector DB', delay: 0.6 },
  { icon: Brain, label: 'LLM', delay: 0.8 },
  { icon: MessageSquare, label: 'Answer', delay: 1.0 },
]

function PipelineDiagram() {
  return (
    <div className="flex items-center justify-center gap-2 md:gap-4 flex-wrap py-8">
      {pipelineNodes.map((node, i) => (
        <motion.div
          key={node.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: node.delay + 0.5, duration: 0.5 }}
          className="flex items-center gap-2 md:gap-4"
        >
          <motion.div
            className="flex flex-col items-center gap-2"
            animate={{ y: [0, -5, 0] }}
            transition={{ delay: node.delay + 1, duration: 2, repeat: Infinity, repeatDelay: 1 }}
          >
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-accent/10 border border-accent/30 flex items-center justify-center">
              <node.icon size={22} className="text-accent-light" />
            </div>
            <span className="text-xs text-text-muted">{node.label}</span>
          </motion.div>
          {i < pipelineNodes.length - 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: node.delay + 0.7 }}
            >
              <ArrowRight size={16} className="text-text-muted mt-[-20px]" />
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  )
}

export default function Hero({ onTryRag }) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.15),transparent_50%)]" />
      <div className="relative max-w-5xl mx-auto px-4 pt-20 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent-light border border-accent/20 mb-6">
            Interactive Demo
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4">
            Explore{' '}
            <span className="bg-gradient-to-r from-accent to-purple-400 bg-clip-text text-transparent">
              RAG Architectures
            </span>
            <br />in Real Time
          </h1>
          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-8">
            Upload a document, pick a RAG strategy, and watch chunking, embedding, retrieval, and generation happen live — all in your browser.
          </p>
        </motion.div>

        <PipelineDiagram />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <Button size="lg" onClick={onTryRag} className="mt-4 text-base">
            Try RAG Live <ArrowRight size={18} />
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
