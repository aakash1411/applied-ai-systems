import { useState, useCallback, useRef } from 'react'
import { pipelines } from '../lib/ragPipelines'
import { generateStream } from '../lib/ollama'
import { runFallbackPipeline } from '../lib/fallback'

export function useRAGPipeline() {
  const [currentStep, setCurrentStep] = useState(null)
  const [stepMessage, setStepMessage] = useState('')
  const [completedSteps, setCompletedSteps] = useState([])
  const [isRunning, setIsRunning] = useState(false)
  const [streamedAnswer, setStreamedAnswer] = useState('')
  const [vizData, setVizData] = useState({})
  const stepsSeen = useRef(new Set())

  const onStep = useCallback((step, data) => {
    setCurrentStep(step)
    if (typeof data === 'string') {
      setStepMessage(data)
    } else if (data && typeof data === 'object') {
      setVizData(prev => ({ ...prev, [step]: { ...prev[step], ...data } }))
    }
    if (!stepsSeen.current.has(step)) {
      stepsSeen.current.add(step)
      setCompletedSteps(prev => [...prev, step])
    }
  }, [])

  const run = useCallback(async (pipelineId, text, query, isConnected) => {
    setIsRunning(true)
    setCurrentStep(null)
    setStepMessage('')
    setCompletedSteps([])
    setStreamedAnswer('')
    setVizData({})
    stepsSeen.current = new Set()

    try {
      if (!isConnected) {
        const result = await runFallbackPipeline(pipelineId, query, onStep)
        setStreamedAnswer(result.answer)
        return { answer: result.answer, isDemo: true }
      }

      const pipeline = pipelines[pipelineId]
      if (!pipeline) throw new Error(`Unknown pipeline: ${pipelineId}`)

      const result = await pipeline.run(text, query, onStep)

      let answer = ''
      for await (const token of generateStream(result.prompt)) {
        answer += token
        setStreamedAnswer(answer)
      }

      return { answer, ...result, isDemo: false }
    } catch (err) {
      throw err
    } finally {
      setIsRunning(false)
    }
  }, [onStep])

  const reset = useCallback(() => {
    setCurrentStep(null)
    setStepMessage('')
    setCompletedSteps([])
    setIsRunning(false)
    setStreamedAnswer('')
    setVizData({})
    stepsSeen.current = new Set()
  }, [])

  return {
    run, reset, currentStep, stepMessage,
    completedSteps, isRunning, streamedAnswer, vizData,
  }
}
