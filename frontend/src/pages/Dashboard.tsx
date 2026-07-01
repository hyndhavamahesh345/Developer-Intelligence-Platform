import { useState, useEffect } from 'react'
import { useOSStore } from '../store/useOSStore'
import { motion, AnimatePresence } from 'framer-motion'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts'
import { Activity, Database, HardDrive, Cpu, Terminal, RefreshCw, LayoutTemplate } from 'lucide-react'
import { useMouseGlow } from '../hooks/useMouseGlow'
import gsap from 'gsap'

// Mock database for the interactive system architecture nodes
const architectureNodes = [
  {
    id: 'frontend',
    name: 'React Frontend',
    file: 'frontend/src/App.tsx',
    license: 'MIT',
    description: 'Single-page application powered by Vite, Zustand, Tailwind CSS v4, Motion, and React Three Fiber rendering the 3D dashboard interface.'
  },
  {
    id: 'backend',
    name: 'FastAPI Gateway',
    file: 'backend/app/main.py',
    license: 'MIT',
    description: 'REST and WebSocket gateway handling streaming completions, database storage, file uploads, and telemetry logging.'
  },
  {
    id: 'langgraph',
    name: 'LangGraph Orchestrator',
    file: 'backend/app/agents/graph.py',
    license: 'MIT',
    description: 'State machine graph compiler managing Planner, Router, and Specialized Sub-agents using raw multi-node state logic.'
  },
  {
    id: 'chromadb',
    name: 'ChromaDB Vector Store',
    file: 'backend/app/services/vector.py',
    license: 'Apache-2.0',
    description: 'Local vector store indexing segmented JSON files from the knowledge base, embedded using local sentence-transformers models.'
  },
  {
    id: 'llm',
    name: 'LLM Client (Ollama)',
    file: 'backend/app/services/llm.py',
    license: 'Apache-2.0 (Qwen/Mistral)',
    description: 'Pluggable model endpoint wrapper supporting local Ollama execution as well as external cloud completion APIs (Groq, Together AI).'
  }
]

export function Dashboard() {
  const { model, setModel, cpuLoad, latency, messages } = useOSStore()
  const [uptime, setUptime] = useState(0)
  const [indexing, setIndexing] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  
  // Real browser telemetry state
  const [browserMemory, setBrowserMemory] = useState('34.2 MB')
  
  // Active architecture node selected
  const [selectedArchNode, setSelectedArchNode] = useState<any>(null)

  // Mouse glow refs for each control card
  const card1 = useMouseGlow()
  const card2 = useMouseGlow()
  const card3 = useMouseGlow()
  const card4 = useMouseGlow()
  const card5 = useMouseGlow()
  const card6 = useMouseGlow()

  // Chart data matching performance latency
  const [latencyHistory, setLatencyHistory] = useState([
    { step: 1, latency: 42 },
    { step: 2, latency: 55 },
    { step: 3, latency: 48 },
    { step: 4, latency: 68 },
    { step: 5, latency: latency || 50 }
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setUptime((prev) => prev + 1)
      
      const perf = window.performance as any
      if (perf.memory) {
        const memMB = perf.memory.usedJSHeapSize / 1024 / 1024
        setBrowserMemory(`${memMB.toFixed(1)} MB`)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // GSAP Entrance Animations for cards
  useEffect(() => {
    gsap.fromTo('.mouse-glow-card',
      { opacity: 0, y: 35, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out', stagger: 0.08 }
    )
  }, [])

  useEffect(() => {
    if (latency) {
      setLatencyHistory((prev) => {
        const next = [...prev.slice(1)]
        next.push({ step: prev.length + 1, latency })
        return next
      })
    }
  }, [latency])

  useEffect(() => {
    setLogs([
      'MISSION_CONTROL: Boot sequence verified. Session logs online.',
      'SYSINIT: Parsed structured JSON schemas inside knowledge-base...',
      'DATABASE: Connected to PostgreSQL session registry at db:5432',
      'VECTOR: Active collection segments query completed successfully.',
      'MODEL: Local Ollama endpoint active at port 11434.'
    ])
  }, [])

  const triggerReindexing = () => {
    setIndexing(true)
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] COMMAND: Triggered vector store re-indexing...`])
    
    setTimeout(() => {
      setIndexing(false)
      setLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] INDEXER: Re-embedded 11 knowledge blocks in ChromaDB.`
      ])
    }, 2000)
  }

  const formatUptime = (sec: number) => {
    const h = Math.floor(sec / 3600).toString().padStart(2, '0')
    const m = Math.floor((sec % 3600) / 60).toString().padStart(2, '0')
    const s = (sec % 60).toString().padStart(2, '0')
    return `${h}:${m}:${s}`
  }

  const visitorMsgCount = messages.filter(m => m.sender === 'visitor').length

  return (
    <div className="flex-1 overflow-y-auto p-6 pb-28 space-y-6 scrollbar-thin neural-grid">
      {/* Welcome & Status Bar */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 rounded-2xl border-l-4 border-l-accent-violet flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-xl md:text-2xl font-bold font-mono tracking-tight text-text-primary">
            MISSION CONTROL CENTER
          </h1>
          <p className="text-xs md:text-sm text-text-secondary font-mono mt-1">
            State-of-the-Art Multi-Agent OS Dashboard streaming live telemetry logs and network metrics.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-zinc-900/50 px-3 py-1.5 rounded-lg border border-border-glass font-mono text-[11px] text-text-secondary select-none">
          <Activity className="w-3.5 h-3.5 text-accent-cyan animate-pulse" />
          Uptime: <span className="text-accent-cyan font-bold">{formatUptime(uptime)}</span>
        </div>
      </motion.div>

      {/* Main stats layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Model manager */}
        <div ref={card1} className="mouse-glow-card p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-border-glass pb-2 select-none relative z-10">
            <span className="text-xs font-mono font-bold tracking-wider text-text-secondary uppercase flex items-center gap-2">
              <Cpu className="w-4 h-4 text-accent-violet" /> Model Selector
            </span>
          </div>
          <div className="space-y-2 relative z-10">
            {[
              { id: 'qwen', label: 'Qwen 3.7 Instruct (Local)', desc: 'Active model: Qwen-3 Instruct' },
              { id: 'mistral', label: 'Mistral 7B Instruct (Local)', desc: 'Fallback model: Mistral-7B' }
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setModel(opt.label)}
                className={`w-full text-left p-3 rounded-xl border font-mono transition-all flex flex-col gap-1 cursor-pointer select-none ${
                  model === opt.label
                    ? 'bg-accent-violet/15 border-accent-violet/40 text-text-primary'
                    : 'bg-black/10 border-border-glass text-text-secondary hover:bg-white/5'
                }`}
              >
                <span className="text-xs font-bold">{opt.label}</span>
                <span className="text-[9px] opacity-75">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Vector DB Chroma metrics */}
        <div ref={card2} className="mouse-glow-card p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-border-glass pb-2 select-none relative z-10">
            <span className="text-xs font-mono font-bold tracking-wider text-text-secondary uppercase flex items-center gap-2">
              <Database className="w-4 h-4 text-accent-cyan" /> Vector Registry
            </span>
            <button 
              disabled={indexing}
              onClick={triggerReindexing}
              className="text-[10px] bg-zinc-900 border border-border-glass px-2 py-1 rounded font-mono hover:text-accent-cyan transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50 select-none"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${indexing ? 'animate-spin' : ''}`} />
              Index
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-center font-mono relative z-10">
            <div className="bg-black/30 border border-border-glass p-3 rounded-xl">
              <span className="text-[9px] text-text-secondary block">Collections</span>
              <strong className="text-md text-text-primary mt-1 block">5</strong>
            </div>
            <div className="bg-black/30 border border-border-glass p-3 rounded-xl">
              <span className="text-[9px] text-text-secondary block">Query count</span>
              <strong className="text-md text-accent-cyan mt-1 block">{visitorMsgCount}</strong>
            </div>
            <div className="bg-black/30 border border-border-glass p-3 rounded-xl col-span-2 select-none">
              <span className="text-[9px] text-text-secondary block">Embedding Engine</span>
              <strong className="text-[11px] text-text-primary mt-1 block">all-MiniLM-L6-v2 (Local)</strong>
            </div>
          </div>
        </div>

        {/* Browser + Client Telemetry */}
        <div ref={card3} className="mouse-glow-card p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-border-glass pb-2 select-none relative z-10">
            <span className="text-xs font-mono font-bold tracking-wider text-text-secondary uppercase flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-amber-400" /> Client Telemetry
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">ONLINE</span>
          </div>

          <div className="space-y-3 font-mono text-xs text-text-secondary relative z-10">
            <div>
              <div className="flex justify-between mb-1 select-none">
                <span>GPU Simulated Load</span>
                <span className="text-text-primary">{cpuLoad}%</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <motion.div className="h-full bg-accent-violet" style={{ width: `${cpuLoad}%` }} animate={{ width: `${cpuLoad}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1 select-none">
                <span>Browser JS Heap</span>
                <span className="text-text-primary">{browserMemory}</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <motion.div className="h-full bg-accent-cyan" style={{ width: '45%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Latency History Chart & Interactive Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recharts Latency area */}
        <div ref={card4} className="mouse-glow-card p-5 flex flex-col gap-3 h-[280px]">
          <div className="text-xs font-mono font-bold tracking-wider text-text-secondary uppercase select-none relative z-10">
            Inference Latency history (ms)
          </div>
          <div className="flex-1 w-full min-h-0 text-[10px] font-mono relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={latencyHistory} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="step" stroke="#52525b" />
                <YAxis stroke="#52525b" />
                <Tooltip contentStyle={{ backgroundColor: '#09090b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#f4f4f7' }} />
                <Area type="monotone" dataKey="latency" stroke="#a855f7" fillOpacity={1} fill="url(#colorLatency)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Interactive Architecture Schema */}
        <div ref={card5} className="mouse-glow-card p-5 flex flex-col gap-4 h-[280px] justify-between relative overflow-hidden">
          <div className="text-xs font-mono font-bold tracking-wider text-text-secondary uppercase flex items-center gap-1.5 select-none relative z-10">
            <LayoutTemplate className="w-4 h-4 text-accent-cyan" /> Interactive Architecture Nodes
          </div>
          
          {/* Node flows */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 py-2 font-mono text-[9px] relative z-10">
            {architectureNodes.map((node) => (
              <button
                key={node.id}
                onClick={() => setSelectedArchNode(node)}
                className={`px-2 py-2.5 rounded-lg border transition-all cursor-pointer select-none text-center ${
                  selectedArchNode?.id === node.id
                    ? 'border-accent-cyan bg-accent-cyan/15 text-accent-cyan font-bold'
                    : 'border-border-glass bg-zinc-950/40 text-text-primary hover:border-accent-cyan'
                }`}
              >
                {node.name}
              </button>
            ))}
          </div>

          {/* Node explanations popover drawer */}
          <div className="bg-zinc-950/60 p-3 rounded-xl border border-border-glass h-[110px] overflow-y-auto font-mono text-[10px] relative z-10">
            <AnimatePresence mode="wait">
              {selectedArchNode ? (
                <motion.div
                  key={selectedArchNode.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-1"
                >
                  <div className="flex justify-between items-center select-none">
                    <strong className="text-accent-cyan uppercase">{selectedArchNode.name}</strong>
                    <span className="text-[8px] bg-zinc-800 border border-border-glass text-zinc-500 px-1.5 py-0.5 rounded">
                      {selectedArchNode.license}
                    </span>
                  </div>
                  <div className="text-zinc-500 select-all">Path: {selectedArchNode.file}</div>
                  <p className="text-text-secondary mt-1 leading-normal select-text">{selectedArchNode.description}</p>
                </motion.div>
              ) : (
                <div className="text-zinc-600 flex items-center justify-center h-full select-none">
                  Click any node above to inspect code files and licenses.
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Telemetry log stream */}
      <div ref={card6} className="mouse-glow-card p-5 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-text-secondary uppercase select-none relative z-10">
          <Terminal className="w-4 h-4 text-accent-violet animate-pulse" /> System Logs Stream
        </div>
        <div className="bg-zinc-950/80 p-4 rounded-xl border border-border-glass font-mono text-[11px] text-zinc-400 h-32 overflow-y-auto space-y-1.5 select-text relative z-10">
          {logs.map((log, idx) => (
            <div key={idx} className={log.includes('COMMAND') ? 'text-accent-cyan' : log.includes('INDEXER') ? 'text-accent-violet' : ''}>
              &gt; {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

