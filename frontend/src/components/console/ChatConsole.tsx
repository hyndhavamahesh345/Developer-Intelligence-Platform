import React, { useState, useRef, useEffect } from 'react'
import { useOSStore } from '../../store/useOSStore'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Terminal, Trash2, ArrowRight, Loader2, Sparkles } from 'lucide-react'

// Simple helper to parse basic markdown (code blocks, bold, bullet points, file links)
function parseMarkdown(text: string) {
  if (!text) return ''
  
  // Format code blocks
  let formatted = text.replace(/```([\s\S]*?)```/g, (_, code) => {
    return `<pre class="bg-black/40 p-3 rounded-lg border border-border-glass font-mono text-xs overflow-x-auto my-2 text-accent-cyan">${code.trim()}</pre>`
  })

  // Format inline code
  formatted = formatted.replace(/`([^`]+)`/g, '<code class="bg-zinc-800 px-1 py-0.5 rounded font-mono text-accent-cyan">$1</code>')

  // Format bold text
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')

  // Format bullets
  formatted = formatted.replace(/^\s*-\s+(.+)$/gm, '<li class="ml-4 list-disc">$1</li>')

  // Format links (custom pattern for workspace files)
  formatted = formatted.replace(/\[([^\]]+)\]\((file:\/\/\/[^\)]+)\)/g, '<a href="$2" class="text-accent-violet hover:underline" target="_blank">$1</a>')

  return <div dangerouslySetInnerHTML={{ __html: formatted }} className="space-y-1.5 break-words" />
}

export function ChatConsole() {
  const { messages, thinkingSteps, isThinking, addMessage, setIsThinking, setThinkingSteps, setActiveAgent, updateMetrics, clearChat } = useOSStore()
  const [inputValue, setInputValue] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isThinking])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isThinking) return

    const userQuery = inputValue.trim()
    setInputValue('')
    setIsThinking(true)
    setActiveAgent('Router')
    setThinkingSteps(['Intent Router'])

    // Add user message
    addMessage({
      sender: 'visitor',
      content: userQuery,
      routedTo: 'Router'
    })

    // Simulate Agent Orchestration Pipeline
    try {
      const startTime = performance.now()
      
      // Step 1: Planning
      await new Promise(r => setTimeout(r, 800))
      setThinkingSteps(['Intent Router', 'Planner'])
      setActiveAgent('Planner')

      // Step 2: Route to specialized agents & retrieve
      await new Promise(r => setTimeout(r, 900))
      let targetAgent = 'Projects Agent'
      if (userQuery.toLowerCase().includes('resume') || userQuery.toLowerCase().includes('education')) {
        targetAgent = 'Resume Agent'
      } else if (userQuery.toLowerCase().includes('experience') || userQuery.toLowerCase().includes('intern')) {
        targetAgent = 'Experience Agent'
      } else if (userQuery.toLowerCase().includes('skills') || userQuery.toLowerCase().includes('code')) {
        targetAgent = 'Skills Agent'
      } else if (userQuery.toLowerCase().includes('contact') || userQuery.toLowerCase().includes('email')) {
        targetAgent = 'Contact Agent'
      }
      
      setThinkingSteps(['Intent Router', 'Planner', targetAgent])
      setActiveAgent(targetAgent)

      // Step 3: Vector search / Retrieval
      await new Promise(r => setTimeout(r, 600))
      setThinkingSteps(['Intent Router', 'Planner', targetAgent, 'Vector Database'])
      
      // Step 4: Synthesize Response
      await new Promise(r => setTimeout(r, 700))
      setThinkingSteps(['Intent Router', 'Planner', targetAgent, 'Vector Database', 'Response Aggregator'])
      setActiveAgent('Response Aggregator')
      
      await new Promise(r => setTimeout(r, 500))
      const endTime = performance.now()
      const totalLatency = Math.floor(endTime - startTime)

      // Generate a mock response based on the agent type (until backend is connected)
      let agentContent = ''
      if (targetAgent === 'Projects Agent') {
        agentContent = 'Based on the system knowledge base, I found **VisionVault**. It is an Edge AI Vision platform that runs zero-shot object detection using Grounding DINO and dense image captioning using Florence-2. Check out the [Projects Page](file:///projects) for detailed architecture blueprints and deployment configuration.'
      } else if (targetAgent === 'Resume Agent') {
        agentContent = 'N Hyndhava Mahesh holds a B.Tech in Computer Science & Engineering from **IIT Hyderabad** with a GPA of 9.4/10.0. I can activate the `Resume Tool` to prepare a secure download token for his PDF resume if needed.'
      } else if (targetAgent === 'Experience Agent') {
        agentContent = ' Mahesh completed an AI Systems Engineer internship at **NeuralLabs AI**, where he migrated cloud vision workflows to fine-tuned local Florence-2 models, resulting in a 100% reduction in API bills.'
      } else if (targetAgent === 'Skills Agent') {
        agentContent = 'I have queried the Skills index. Core domains include:\n- **AI & ML**: LangGraph, local LLMs (Qwen/Mistral), Florence-2, ChromaDB, HuggingFace embeddings\n- **Backend**: FastAPI, Async SQLAlchemy, PostgreSQL, Redis\n- **Frontend**: React, TypeScript, Vite, Tailwind CSS v4, Motion'
      } else if (targetAgent === 'Contact Agent') {
        agentContent = 'You can reach N Hyndhava Mahesh via email at **mahesh.nh@gmail.com** or connect on [LinkedIn](https://linkedin.com/in/nhmahesh). You can also run the Contact Form terminal node.'
      } else {
        agentContent = 'I have searched the knowledge database for your query. The general consensus is that this Developer Intelligence Platform is configured using a 100% open-source stack.'
      }

      addMessage({
        sender: 'agent',
        content: agentContent,
        routedTo: targetAgent,
        latency: totalLatency,
        thinkingSteps: ['Intent Router', 'Planner', targetAgent, 'Vector Database', 'Response Aggregator']
      })
      updateMetrics(totalLatency)

    } catch (err) {
      addMessage({
        sender: 'agent',
        content: 'System error: Failed to parse instruction. Please check backend server status.',
        routedTo: 'System'
      })
    } finally {
      setIsThinking(false)
      setThinkingSteps([])
    }
  }

  return (
    <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-border-glass flex flex-col h-full bg-black/20 shrink-0 z-10 relative">
      {/* Console Title */}
      <div className="h-12 border-b border-border-glass flex items-center justify-between px-4 shrink-0 font-mono text-xs select-none">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-accent-violet animate-pulse" />
          <span className="text-text-primary uppercase tracking-wider font-bold">Agent Terminal</span>
        </div>
        <button 
          onClick={clearChat}
          className="text-text-secondary hover:text-red-400 p-1 rounded transition-colors"
          title="Clear session history"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Window */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-[13px] scrollbar-thin">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-xl border flex flex-col gap-1.5 max-w-[90%] ${
                msg.sender === 'visitor'
                  ? 'bg-accent-violet/10 border-accent-violet/20 self-end ml-auto'
                  : 'bg-zinc-900/50 border-border-glass self-start mr-auto'
              }`}
            >
              <div className="flex justify-between items-center gap-4 text-[10px] text-text-secondary select-none">
                <span>{msg.sender === 'visitor' ? 'VISITOR' : `AGENT [${msg.routedTo || 'System'}]`}</span>
                {msg.latency && <span>{msg.latency}ms</span>}
              </div>
              <div className="text-text-primary leading-relaxed">
                {parseMarkdown(msg.content)}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Thinking State Loader */}
        {isThinking && (
          <div className="bg-zinc-900/40 border border-border-glass p-3 rounded-xl self-start mr-auto max-w-[90%] space-y-2">
            <div className="flex items-center gap-2 text-[10px] text-accent-violet font-mono select-none">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>AGENT ORCHESTRATION PIPELINE IN ACTION...</span>
            </div>
            <div className="h-1.5 w-40 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-accent-violet"
                animate={{ x: [-100, 200] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                style={{ width: '40%' }}
              />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Live Thinking Visualizer Panel */}
      {isThinking && thinkingSteps.length > 0 && (
        <div className="p-3 bg-black/40 border-t border-border-glass font-mono text-[10px] space-y-2 shrink-0 select-none">
          <div className="text-text-secondary flex items-center gap-1.5 uppercase font-bold text-[9px] tracking-wider">
            <Sparkles className="w-3 h-3 text-accent-cyan" /> Pipeline Graph
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-text-secondary">
            {thinkingSteps.map((step, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <ArrowRight className="w-3 h-3 text-zinc-600" />}
                <span className={`px-1.5 py-0.5 rounded border ${
                  idx === thinkingSteps.length - 1
                    ? 'bg-accent-violet/20 border-accent-violet/40 text-accent-violet font-bold animate-pulse'
                    : 'bg-zinc-900 border-border-glass text-zinc-400'
                }`}>
                  {step}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Chat Input Area */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-border-glass shrink-0 bg-black/30 flex items-center gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={isThinking ? 'Analyzing query context...' : 'Ask about projects, skills, or resume...'}
          disabled={isThinking}
          className="flex-1 bg-zinc-950/60 border border-border-glass rounded-xl px-4 py-2 text-xs font-mono text-text-primary focus:outline-none focus:border-accent-violet/50 transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isThinking || !inputValue.trim()}
          className="bg-accent-violet hover:bg-violet-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-black p-2.5 rounded-xl transition-all cursor-pointer select-none"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  )
}
