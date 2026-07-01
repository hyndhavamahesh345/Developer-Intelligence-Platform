import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal } from 'lucide-react'

interface LogEntry {
  text: string
  status: 'pending' | 'ok' | 'fail'
}

export function StartupLoader() {
  const [isVisible, setIsVisible] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [logs, setLogs] = useState<LogEntry[]>([
    { text: 'SYSINIT: Launching Developer Intelligence Platform OS kernel...', status: 'pending' },
    { text: 'SYSINIT: Parsing structured JSON schemas inside knowledge-base...', status: 'pending' },
    { text: 'DATABASE: Resolving persistent vector shards in ChromaDB...', status: 'pending' },
    { text: 'MODEL: Instantiating pluggable LLM interfaces (Ollama/Groq/Together)...', status: 'pending' },
    { text: 'ORCHESTRATOR: Connecting LangGraph node sequences and Planner...', status: 'pending' },
    { text: 'CANVAS: Loading Three.js neural mesh coordinates...', status: 'pending' }
  ])

  useEffect(() => {
    // Session state caching to avoid repeated loads on route changes or refreshes
    const isBooted = sessionStorage.getItem('platform_booted')
    if (isBooted) {
      setIsVisible(false)
      return
    }
    
    setIsVisible(true)
  }, [])

  useEffect(() => {
    if (!isVisible || activeStep >= logs.length) {
      if (isVisible && activeStep >= logs.length) {
        // Hold for a moment then fade out
        const timer = setTimeout(() => {
          setIsVisible(false)
          sessionStorage.setItem('platform_booted', 'true')
        }, 1000)
        return () => clearTimeout(timer)
      }
      return
    }

    // Process logs step by step
    const interval = setTimeout(() => {
      setLogs((prev) => {
        const next = [...prev]
        next[activeStep].status = 'ok'
        return next
      })
      setActiveStep((prev) => prev + 1)
    }, 450)

    return () => clearTimeout(interval)
  }, [isVisible, activeStep, logs.length])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 bg-[#080710] flex flex-col items-center justify-center p-6 font-mono select-none"
        >
          {/* Subtle neural grid background */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(rgba(168,85,247,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
          
          <div className="w-full max-w-lg space-y-8 z-10">
            {/* Branding Logo */}
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
              <Terminal className="w-6 h-6 text-accent-violet animate-pulse" />
              <div className="text-left">
                <h1 className="text-xs font-bold text-text-primary uppercase tracking-widest leading-none">
                  AI-OS Kernel Init
                </h1>
                <span className="text-[9px] text-zinc-500 block mt-1">SECURE TERMINAL CONSOLE NODE</span>
              </div>
            </div>

            {/* Diagnostic Logs */}
            <div className="space-y-2 text-left text-[11px] min-h-[140px]">
              {logs.map((log, idx) => (
                <div 
                  key={idx} 
                  className={`flex justify-between items-center transition-all ${
                    idx < activeStep 
                      ? 'text-zinc-400' 
                      : idx === activeStep 
                        ? 'text-accent-cyan font-bold' 
                        : 'text-zinc-700'
                  }`}
                >
                  <span className="truncate pr-4">&gt; {log.text}</span>
                  {log.status === 'ok' && (
                    <span className="text-emerald-400 font-bold shrink-0">[OK]</span>
                  )}
                  {log.status === 'pending' && idx === activeStep && (
                    <span className="text-accent-cyan font-bold shrink-0 animate-pulse">Running...</span>
                  )}
                  {log.status === 'pending' && idx > activeStep && (
                    <span className="text-zinc-800 font-bold shrink-0">[WAIT]</span>
                  )}
                </div>
              ))}
            </div>

            {/* Progress Telemetry */}
            <div className="space-y-1.5 text-left text-[10px] text-text-secondary">
              <div className="flex justify-between select-none">
                <span>Kernel Bootstrap Progress</span>
                <span>{Math.min(Math.round((activeStep / logs.length) * 100), 100)}%</span>
              </div>
              <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden border border-border-glass">
                <motion.div 
                  className="h-full bg-gradient-to-r from-accent-violet to-accent-cyan"
                  style={{ width: `${(activeStep / logs.length) * 100}%` }}
                  animate={{ width: `${(activeStep / logs.length) * 100}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
