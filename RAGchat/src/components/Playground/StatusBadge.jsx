import { Wifi, WifiOff, AlertTriangle } from 'lucide-react'

export default function StatusBadge({ connected }) {
  if (connected) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success/10 text-success text-xs font-medium">
        <Wifi size={14} />
        <span>Ollama Connected — Live Mode</span>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-warning/10 text-warning text-xs font-medium">
      <AlertTriangle size={14} />
      <span>Ollama Offline — Demo Mode (pre-recorded responses)</span>
    </div>
  )
}
