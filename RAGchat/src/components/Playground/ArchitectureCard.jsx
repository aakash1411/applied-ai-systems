import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Info } from 'lucide-react'
import FileUpload from './FileUpload'
import ChatBox from './ChatBox'
import ProcessingViz from './ProcessingViz'
import { useRAGPipeline } from '../../hooks/useRAGPipeline'
import { getDemoDocument } from '../../lib/fallback'

export default function ArchitectureCard({ arch, isSelected, onSelect, connected }) {
  const [documentText, setDocumentText] = useState(null)
  const [docName, setDocName] = useState(null)
  const pipeline = useRAGPipeline()

  const handleFileParsed = (text, name) => {
    setDocumentText(text)
    setDocName(name)
  }

  const handleSend = async (query) => {
    const text = documentText || (connected ? null : getDemoDocument())
    if (!text && !connected) return
    if (!text) return
    try {
      await pipeline.run(arch.id, text, query, connected)
    } catch (e) {
      console.error(`Pipeline error:`, e)
    }
  }

  const Icon = arch.icon

  return (
    <motion.div
      layout
      className={`rounded-xl border transition-all duration-300 overflow-hidden ${
        isSelected
          ? 'border-accent/50 bg-bg-secondary col-span-full'
          : 'border-border bg-bg-card hover:border-accent/30 hover:bg-bg-card-hover cursor-pointer'
      }`}
      onClick={() => !isSelected && onSelect(arch.id)}
    >
      <motion.div layout="position" className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${arch.color}15`, border: `1px solid ${arch.color}30` }}
            >
              <Icon size={20} style={{ color: arch.color }} />
            </div>
            <div>
              <h3 className="font-semibold text-base">{arch.name}</h3>
              <p className="text-xs text-text-muted mt-0.5">{arch.shortDesc}</p>
            </div>
          </div>
          {isSelected && (
            <button
              onClick={(e) => { e.stopPropagation(); onSelect(null) }}
              className="text-text-muted hover:text-text-primary p-1 cursor-pointer"
            >
              <ChevronDown size={18} />
            </button>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-5 pb-5">
              <div className="flex items-start gap-2 p-3 rounded-lg bg-accent/5 border border-accent/10 mb-4">
                <Info size={14} className="text-accent-light shrink-0 mt-0.5" />
                <p className="text-xs text-text-secondary leading-relaxed">{arch.description}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-text-secondary">Document</h4>
                  <FileUpload onFileParsed={handleFileParsed} disabled={pipeline.isRunning} />
                  {!connected && !documentText && (
                    <p className="text-xs text-text-muted">Demo mode: a sample document will be used automatically.</p>
                  )}

                  <h4 className="text-sm font-medium text-text-secondary mt-4">Pipeline Progress</h4>
                  <ProcessingViz
                    steps={arch.steps}
                    currentStep={pipeline.currentStep}
                    completedSteps={pipeline.completedSteps}
                    vizData={pipeline.vizData}
                    stepMessage={pipeline.stepMessage}
                  />
                </div>

                <div className="border border-border rounded-xl overflow-hidden bg-bg-primary">
                  <ChatBox
                    onSend={handleSend}
                    streamedAnswer={pipeline.streamedAnswer}
                    isRunning={pipeline.isRunning}
                    isDemo={!connected}
                    disabled={!documentText && connected}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
