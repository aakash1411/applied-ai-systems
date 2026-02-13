import { useState, useEffect, useCallback } from 'react'
import { checkConnection } from '../lib/ollama'

export function useOllamaStatus(intervalMs = 10000) {
  const [connected, setConnected] = useState(false)
  const [checking, setChecking] = useState(true)

  const check = useCallback(async () => {
    setChecking(true)
    const ok = await checkConnection()
    setConnected(ok)
    setChecking(false)
  }, [])

  useEffect(() => {
    check()
    const id = setInterval(check, intervalMs)
    return () => clearInterval(id)
  }, [check, intervalMs])

  return { connected, checking, recheck: check }
}
