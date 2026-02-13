import { useState } from 'react'
import { motion } from 'framer-motion'
import { architectures } from '../../data/architectures'
import { useOllamaStatus } from '../../hooks/useOllamaStatus'
import ArchitectureCard from './ArchitectureCard'
import StatusBadge from './StatusBadge'

export default function ArchitectureGrid() {
  const [selectedId, setSelectedId] = useState(null)
  const { connected } = useOllamaStatus()

  return (
    <section id="playground" className="max-w-6xl mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-3">Choose a RAG Architecture</h2>
        <p className="text-text-secondary max-w-xl mx-auto mb-4">
          Select an architecture to explore. Upload a document and see how each approach processes your data differently.
        </p>
        <div className="flex justify-center">
          <StatusBadge connected={connected} />
        </div>
      </motion.div>

      <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {architectures.map((arch, i) => (
          <motion.div
            key={arch.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className={selectedId === arch.id ? 'col-span-full' : ''}
          >
            <ArchitectureCard
              arch={arch}
              isSelected={selectedId === arch.id}
              onSelect={setSelectedId}
              connected={connected}
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
