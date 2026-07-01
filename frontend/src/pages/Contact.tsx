import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Terminal, CornerDownLeft } from 'lucide-react'

interface TerminalLog {
  text: string
  type: 'input' | 'output' | 'error' | 'success'
}

export function Contact() {
  const [inputVal, setInputVal] = useState('')
  const [terminalHistory, setTerminalHistory] = useState<TerminalLog[]>([
    { text: 'AI-OS [Version 1.0.2026]', type: 'output' },
    { text: 'Type "help" to view a list of available system console commands.', type: 'output' },
    { text: '', type: 'output' }
  ])
  const terminalEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [terminalHistory])

  const executeCommand = (commandStr: string) => {
    const cmd = commandStr.trim().toLowerCase()
    
    // Add command input to history log
    const newLogs: TerminalLog[] = [
      { text: `visitor@ai-os:~$ ${commandStr}`, type: 'input' }
    ]

    switch (cmd) {
      case 'help':
        newLogs.push(
          { text: 'Available System Commands:', type: 'success' },
          { text: '  about        - Displays platform and builder descriptions.', type: 'output' },
          { text: '  contact      - Prints direct email and connection profiles.', type: 'output' },
          { text: '  projects     - Lists current active software repositories.', type: 'output' },
          { text: '  skills       - Prints out developer technical skills inventory.', type: 'output' },
          { text: '  resume       - Generates a secure download link for the PDF Resume.', type: 'output' },
          { text: '  github       - Launches GitHub profile in a new browser tab.', type: 'output' },
          { text: '  linkedin     - Launches LinkedIn profile in a new browser tab.', type: 'output' },
          { text: '  clear        - Clears the terminal screen buffer.', type: 'output' }
        )
        break
      case 'about':
        newLogs.push(
          { text: 'Developer Intelligence Platform (AI OS) v1.0', type: 'success' },
          { text: 'Built by N Hyndhava Mahesh, utilizing a 100% open-source multi-agent stack.', type: 'output' },
          { text: 'Features local LLMs (Qwen/Mistral) orchestrated via LangGraph, with visual OCR/DINO.', type: 'output' }
        )
        break
      case 'contact':
        newLogs.push(
          { text: 'Communication Channels:', type: 'success' },
          { text: '  Email    : mahesh.nh@gmail.com', type: 'output' },
          { text: '  Phone    : +91 98765 43210', type: 'output' },
          { text: '  Location : Hyderabad, India', type: 'output' },
          { text: 'Type "github" or "linkedin" to open profiles.', type: 'output' }
        )
        break
      case 'projects':
        newLogs.push(
          { text: 'Active Project Index:', type: 'success' },
          { text: '  - VisionVault : Edge computer vision with Florence-2 & Grounding DINO.', type: 'output' },
          { text: '  - ATS Resume  : Recruiter parser and resume scoring similarities.', type: 'output' },
          { text: '  - DocuMind    : Document RAG indexing unstructured PDFs.', type: 'output' }
        )
        break
      case 'skills':
        newLogs.push(
          { text: 'Technical Skills Directory Tree:', type: 'success' },
          { text: '  ├── Machine Learning : LangGraph, SentenceTransformers, ChromaDB, Florence-2', type: 'output' },
          { text: '  ├── Backend Development: Python, FastAPI, Async SQLAlchemy, PostgreSQL, Redis', type: 'output' },
          { text: '  └── Frontend Design   : React, TypeScript, Vite, Tailwind CSS v4, Motion, R3F', type: 'output' }
        )
        break
      case 'resume':
        newLogs.push(
          { text: 'Generating download token...', type: 'output' },
          { text: 'Resume download ready: https://nhmahesh.dev/api/resume/download?token=secure_temp_4829', type: 'success' }
        )
        break
      case 'github':
        newLogs.push({ text: 'Opening GitHub profile...', type: 'output' })
        window.open('https://github.com/nhmahesh', '_blank')
        break
      case 'linkedin':
        newLogs.push({ text: 'Opening LinkedIn profile...', type: 'output' })
        window.open('https://linkedin.com/in/nhmahesh', '_blank')
        break
      case 'clear':
        setTerminalHistory([])
        return
      default:
        newLogs.push(
          { text: `shell: command not found: "${cmd}". Type "help" to see available instructions.`, type: 'error' }
        )
        break
    }

    setTerminalHistory((prev) => [...prev, ...newLogs])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const input = inputVal.trim()
    setInputVal('')
    if (!input) return
    executeCommand(input)
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 pb-28 space-y-6 scrollbar-thin neural-grid">
      {/* Page Title */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3 border-b border-border-glass pb-4 select-none"
      >
        <Terminal className="w-6 h-6 text-accent-violet" />
        <div>
          <h1 className="text-lg md:text-xl font-bold font-mono tracking-tight text-text-primary">
            SYSTEM CONSOLE SHELL
          </h1>
          <p className="text-xs text-text-secondary font-mono">
            Interactive command interpreter communicating directly with OS assets and profile credentials.
          </p>
        </div>
      </motion.div>

      {/* Terminal Interface */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 bg-black/85 border border-border-glass rounded-2xl p-5 font-mono text-[12px] h-[400px] flex flex-col justify-between overflow-hidden shadow-2xl relative"
      >
        {/* Command Output Buffer */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-2 scrollbar-thin select-text">
          {terminalHistory.map((log, idx) => (
            <div 
              key={idx} 
              className={`leading-relaxed whitespace-pre-wrap ${
                log.type === 'input' 
                  ? 'text-accent-cyan font-bold' 
                  : log.type === 'error' 
                    ? 'text-red-400' 
                    : log.type === 'success' 
                      ? 'text-accent-violet font-bold' 
                      : 'text-zinc-300'
              }`}
            >
              {log.text}
            </div>
          ))}
          <div ref={terminalEndRef} />
        </div>

        {/* Command Input Bar */}
        <form onSubmit={handleSubmit} className="border-t border-border-glass pt-3 mt-3 flex items-center gap-2 select-none shrink-0 bg-black/40">
          <span className="text-accent-cyan font-bold">visitor@ai-os:~$</span>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder='Type "help" and press Enter...'
            className="flex-1 bg-transparent text-text-primary focus:outline-none border-none caret-accent-violet"
          />
          <button 
            type="submit" 
            className="text-zinc-500 hover:text-accent-violet transition-colors cursor-pointer"
            title="Execute instruction"
          >
            <CornerDownLeft className="w-4 h-4" />
          </button>
        </form>
      </motion.div>
    </div>
  )
}
