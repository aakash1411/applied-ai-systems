import { useState, useRef } from 'react'
import { Upload, File, X, AlertCircle } from 'lucide-react'
import { validateFile, parseFile } from '../../lib/fileParser'
import Button from '../ui/Button'

export default function FileUpload({ onFileParsed, disabled }) {
  const [dragOver, setDragOver] = useState(false)
  const [fileName, setFileName] = useState(null)
  const [fileSize, setFileSize] = useState(0)
  const [error, setError] = useState(null)
  const [parsing, setParsing] = useState(false)
  const inputRef = useRef()

  const handleFile = async (file) => {
    setError(null)
    const validation = validateFile(file)
    if (!validation.valid) {
      setError(validation.error)
      return
    }
    setFileName(file.name)
    setFileSize(file.size)
    setParsing(true)
    try {
      const text = await parseFile(file)
      onFileParsed?.(text, file.name)
    } catch (e) {
      setError(`Parse error: ${e.message}`)
    } finally {
      setParsing(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleChange = (e) => {
    const file = e.target.files[0]
    if (file) handleFile(file)
  }

  const clear = () => {
    setFileName(null)
    setFileSize(0)
    setError(null)
    onFileParsed?.(null, null)
  }

  if (fileName && !error) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/5 border border-accent/20">
        <File size={18} className="text-accent-light shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{fileName}</p>
          <p className="text-xs text-text-muted">{(fileSize / 1024).toFixed(1)} KB</p>
        </div>
        {!disabled && (
          <button onClick={clear} className="text-text-muted hover:text-text-primary cursor-pointer">
            <X size={16} />
          </button>
        )}
      </div>
    )
  }

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-2 p-6 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
          dragOver ? 'border-accent bg-accent/5' : 'border-border hover:border-text-muted'
        } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      >
        {parsing ? (
          <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full" />
        ) : (
          <Upload size={24} className="text-text-muted" />
        )}
        <p className="text-sm text-text-secondary">
          {parsing ? 'Parsing document...' : 'Drop a file or click to upload'}
        </p>
        <p className="text-xs text-text-muted">PDF, TXT, MD — max 5 MB</p>
      </div>
      <input ref={inputRef} type="file" accept=".pdf,.txt,.md" onChange={handleChange} className="hidden" />
      {error && (
        <div className="flex items-center gap-2 mt-2 text-sm text-danger">
          <AlertCircle size={14} />
          {error}
        </div>
      )}
    </div>
  )
}
