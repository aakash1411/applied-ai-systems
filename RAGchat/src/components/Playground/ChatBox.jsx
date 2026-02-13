import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '../ui/Button'

export default function ChatBox({ onSend, streamedAnswer, isRunning, isDemo, disabled }) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const scrollRef = useRef()

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, streamedAnswer])

  useEffect(() => {
    if (!isRunning && streamedAnswer && messages.length > 0) {
      const last = messages[messages.length - 1]
      if (last.role === 'user') {
        setMessages(prev => [...prev, { role: 'assistant', content: streamedAnswer, isDemo }])
      }
    }
  }, [isRunning])

  const handleSend = () => {
    const q = input.trim()
    if (!q || isRunning) return
    setMessages(prev => [...prev, { role: 'user', content: q }])
    setInput('')
    onSend?.(q)
  }

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[400px]">
        {messages.length === 0 && !isRunning && (
          <div className="flex items-center justify-center h-full text-sm text-text-muted">
            Ask a question about your document
          </div>
        )}
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot size={14} className="text-accent-light" />
                </div>
              )}
              <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-accent text-white rounded-br-sm'
                  : 'bg-bg-card border border-border rounded-bl-sm'
              }`}>
                {msg.content}
                {msg.isDemo && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-warning">
                    <AlertTriangle size={10} /> Demo response
                  </div>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-bg-card border border-border flex items-center justify-center shrink-0 mt-0.5">
                  <User size={14} className="text-text-secondary" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {isRunning && streamedAnswer && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
              <Bot size={14} className="text-accent-light" />
            </div>
            <div className="max-w-[80%] px-3 py-2 rounded-xl rounded-bl-sm bg-bg-card border border-border text-sm leading-relaxed">
              {streamedAnswer}
              <span className="inline-block w-1.5 h-4 bg-accent-light ml-0.5 animate-pulse" />
            </div>
          </motion.div>
        )}
      </div>
      <div className="p-3 border-t border-border">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder={disabled ? 'Upload a document first...' : 'Ask a question...'}
            disabled={disabled || isRunning}
            className="flex-1 px-3 py-2 rounded-lg bg-bg-card border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent disabled:opacity-50"
          />
          <Button onClick={handleSend} disabled={disabled || isRunning || !input.trim()} size="md">
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  )
}
