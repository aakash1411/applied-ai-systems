import { useState } from 'react'
import { Settings, Github, Wifi, WifiOff } from 'lucide-react'
import Button from './ui/Button'
import { useOllamaStatus } from '../hooks/useOllamaStatus'
import { getOllamaUrl, setOllamaUrl } from '../lib/ollama'

function SettingsModal({ open, onClose }) {
  const [url, setUrl] = useState(getOllamaUrl())

  const handleSave = () => {
    setOllamaUrl(url)
    onClose()
    window.location.reload()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-bg-secondary rounded-xl border border-border p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-4">Ollama Settings</h3>
        <label className="block text-sm text-text-secondary mb-2">Ollama Server URL</label>
        <input
          type="text"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="http://localhost:11434"
          className="w-full px-3 py-2 rounded-lg bg-bg-card border border-border text-text-primary focus:outline-none focus:border-accent mb-2"
        />
        <p className="text-xs text-text-muted mb-4">
          Use a Cloudflare Tunnel URL (e.g., https://abc-xyz.trycloudflare.com) for remote access.
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
    </div>
  )
}

export default function Layout({ children }) {
  const { connected } = useOllamaStatus()
  const [showSettings, setShowSettings] = useState(false)

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="sticky top-0 z-40 bg-bg-primary/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold text-sm">R</div>
            <span className="font-semibold text-lg">RAG Explorer</span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${connected ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
              {connected ? <Wifi size={14} /> : <WifiOff size={14} />}
              {connected ? 'Live' : 'Demo Mode'}
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowSettings(true)}>
              <Settings size={16} />
            </Button>
            <a href="https://github.com/aakash1411/applied-ai-systems" target="_blank" rel="noreferrer">
              <Button variant="ghost" size="sm"><Github size={16} /></Button>
            </a>
          </div>
        </div>
      </nav>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border py-6 text-center text-sm text-text-muted">
        Built to explore RAG architectures. Powered by Ollama + Transformers.js
      </footer>
      <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  )
}
