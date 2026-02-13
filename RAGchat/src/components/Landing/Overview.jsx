import { motion } from 'framer-motion'

const steps = [
  {
    number: '01',
    title: 'Document Ingestion',
    desc: 'Your document is parsed and split into manageable chunks. Different strategies produce different chunk structures.',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    number: '02',
    title: 'Embedding',
    desc: 'Each chunk is converted to a vector embedding — a numerical representation that captures semantic meaning.',
    color: 'from-indigo-500 to-purple-500',
  },
  {
    number: '03',
    title: 'Retrieval',
    desc: 'When you ask a question, the most relevant chunks are found by comparing your query embedding to stored vectors.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    number: '04',
    title: 'Generation',
    desc: 'Retrieved chunks are fed as context to the LLM, which generates a grounded answer based on your actual data.',
    color: 'from-pink-500 to-red-500',
  },
]

export default function Overview() {
  return (
    <section className="max-w-5xl mx-auto px-4 py-20">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">How RAG Works</h2>
        <p className="text-text-secondary max-w-xl mx-auto">
          Retrieval-Augmented Generation grounds LLM responses in your actual data, reducing hallucinations and enabling domain-specific answers.
        </p>
      </motion.div>
      <div className="grid md:grid-cols-2 gap-6">
        {steps.map((step, i) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            className="relative p-6 rounded-xl bg-bg-card border border-border hover:border-accent/30 transition-colors group"
          >
            <div className={`inline-block text-3xl font-black bg-gradient-to-r ${step.color} bg-clip-text text-transparent mb-3`}>
              {step.number}
            </div>
            <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
            <p className="text-sm text-text-secondary leading-relaxed">{step.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
