import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FlaskConical, Upload, AlertTriangle, Play, Sparkles, Image, FileText, Code } from 'lucide-react'

// Mock code templates representing parsed resume JSON data with authentic syntax highlighting
const parsedResumeLines = [
  <span>{'{'}</span>,
  <span>  <span className="text-indigo-400">"profile"</span>: {'{'}</span>,
  <span className="bg-white/5 w-full inline-block text-text-primary -mx-1 px-1 border-l-2 border-accent-violet"><span className="text-indigo-400">    "name"</span>: <span className="text-emerald-400">"N Hyndhava Mahesh"</span>,</span>,
  <span>    <span className="text-indigo-400">"title"</span>: <span className="text-emerald-400">"AI Systems & Full-Stack Architect"</span>,</span>,
  <span>    <span className="text-indigo-400">"core_competencies"</span>: [</span>,
  <span>      <span className="text-emerald-400">"Multi-Agent LangGraph Workflows"</span>,</span>,
  <span>      <span className="text-emerald-400">"Edge Computer Vision pipelines"</span>,</span>,
  <span>      <span className="text-emerald-400">"Vector Semantic Search RAG"</span></span>,
  <span>    ]</span>,
  <span>  {'}'},</span>,
  <span>  <span className="text-indigo-400">"experience"</span>: [</span>,
  <span>    {'{'}</span>,
  <span>      <span className="text-indigo-400">"role"</span>: <span className="text-emerald-400">"AI Systems Engineer Intern"</span>,</span>,
  <span>      <span className="text-indigo-400">"company"</span>: <span className="text-emerald-400">"NeuralLabs AI"</span>,</span>,
  <span>      <span className="text-indigo-400">"projects"</span>: [</span>,
  <span>        <span className="text-emerald-400">"Florence-2 adapter"</span>,</span>,
  <span>        <span className="text-emerald-400">"ChromaDB indexing"</span></span>,
  <span>      ]</span>,
  <span>    {'}'}</span>,
  <span>  ]</span>,
  <span>{'}'}</span>
]


export function Playground() {
  const [activeDemo, setActiveDemo] = useState<'vision' | 'resume' | 'prompts'>('vision')

  // --- VISION LAB STATE ---
  const [visionImage, setVisionImage] = useState<string | null>(null)
  const [isVisionRunning, setIsVisionRunning] = useState(false)
  const [visionResults, setVisionResults] = useState<any[] | null>(null)

  const handleVisionUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setVisionImage(reader.result as string)
        setVisionResults(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const runVisionDetection = () => {
    if (!visionImage) return
    setIsVisionRunning(true)
    setTimeout(() => {
      setIsVisionRunning(false)
      setVisionResults([
        { label: 'developer (person)', box: [40, 20, 80, 90], conf: 0.96 },
        { label: 'workstation monitor', box: [10, 10, 45, 60], conf: 0.91 },
        { label: 'keyboard', box: [75, 45, 95, 80], conf: 0.88 }
      ])
    }, 1500)
  }

  // --- RESUME LAB STATE ---
  const [resumeFile, setResumeFile] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisReport, setAnalysisReport] = useState<any | null>(null)

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setResumeFile(file.name)
      setAnalysisReport(null)
    }
  }

  const runResumeAnalysis = () => {
    if (!resumeFile) return
    setIsAnalyzing(true)
    setTimeout(() => {
      setIsAnalyzing(false)
      setAnalysisReport({
        score: 88,
        matchRate: '92% Core Skills Matched',
        missingKeywords: ['LangGraph state-routing', 'Redis Streams batching', 'Ollama quantization'],
        suggestions: [
          'Detail local TensorRT model compile speeds.',
          'Quantify edge server costs saved during NeuralLabs internship.'
        ]
      })
    }, 1800)
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 pb-28 space-y-6 scrollbar-thin neural-grid">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3 border-b border-border-glass pb-4 select-none"
      >
        <FlaskConical className="w-6 h-6 text-accent-violet" />
        <div>
          <h1 className="text-lg md:text-xl font-bold font-mono tracking-tight text-text-primary">
            AI WORKSPACE LAB
          </h1>
          <p className="text-xs text-text-secondary font-mono">
            Immersive laboratories designed to test computer vision, resume code parser similarity, and system routing logic.
          </p>
        </div>
      </motion.div>

      {/* Lab Tabs */}
      <div className="flex gap-2 border-b border-border-glass pb-3 font-mono text-[11px] select-none">
        {[
          { id: 'vision', label: 'VISION LAB', icon: Image },
          { id: 'resume', label: 'RESUME LAB', icon: FileText },
          { id: 'prompts', label: 'PROMPT / AGENT LAB', icon: Code }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveDemo(tab.id as any)}
            className={`px-3 py-2 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
              activeDemo === tab.id
                ? 'bg-accent-violet/15 border-accent-violet/30 text-accent-violet font-bold'
                : 'bg-black/10 border-border-glass text-text-secondary hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Lab View */}
      <div className="glass-panel p-5 rounded-2xl font-mono text-xs text-text-secondary leading-relaxed min-h-[350px] flex flex-col justify-between">
        <AnimatePresence mode="wait">
          {activeDemo === 'vision' && (
            <motion.div
              key="vision"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4 flex-1 flex flex-col justify-between"
            >
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-text-primary uppercase flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-accent-violet animate-pulse" /> Florence-2 Object Detection
                </h3>
                <p className="text-[10px]">
                  Submit image blocks to identify custom boundary coordinates.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-2">
                {/* Upload box */}
                <div className="border border-dashed border-border-glass rounded-xl h-60 flex flex-col items-center justify-center relative overflow-hidden bg-black/10 select-none">
                  {visionImage ? (
                    <div className="relative w-full h-full">
                      <img src={visionImage} className="w-full h-full object-contain" alt="vision upload" />
                      {visionResults && visionResults.map((res, i) => (
                        <div
                          key={i}
                          style={{
                            position: 'absolute',
                            left: `${res.box[0]}%`,
                            top: `${res.box[1]}%`,
                            width: `${res.box[2] - res.box[0]}%`,
                            height: `${res.box[3] - res.box[1]}%`,
                            border: '1.5px solid #a855f7',
                            backgroundColor: 'rgba(168, 85, 247, 0.15)'
                          }}
                        >
                          <span className="absolute -top-4 left-0 bg-accent-violet text-black text-[8px] font-bold px-1 py-0.5 rounded leading-none select-none">
                            {res.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center gap-2 text-text-secondary hover:text-text-primary transition-colors">
                      <Upload className="w-8 h-8 text-accent-violet animate-bounce" />
                      <span>Select image block</span>
                      <input type="file" onChange={handleVisionUpload} accept="image/*" className="hidden" />
                    </label>
                  )}
                </div>

                {/* Outputs log */}
                <div className="bg-zinc-950/60 p-4 rounded-xl border border-border-glass h-60 overflow-y-auto space-y-3 font-mono text-[10px] select-text">
                  <div className="text-accent-cyan uppercase font-bold text-[9px] tracking-wider border-b border-border-glass pb-1 select-none">
                    Inference Output log
                  </div>
                  {isVisionRunning ? (
                    <div className="text-zinc-500 animate-pulse">Running CUDA tensor core operations...</div>
                  ) : visionResults ? (
                    <div className="space-y-2">
                      <div className="text-emerald-400 select-none">STATUS: Success (completed in 42ms)</div>
                      <pre className="text-text-primary text-[9px]">
                        {JSON.stringify(visionResults, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <div className="text-zinc-600 select-none">Select an image and click "Run Detection Pipeline" to test the vision engine.</div>
                  )}
                </div>
              </div>

              <button
                disabled={!visionImage || isVisionRunning}
                onClick={runVisionDetection}
                className="w-full bg-accent-violet text-black py-2.5 rounded-xl transition-all cursor-pointer font-bold select-none disabled:opacity-50 hover:bg-violet-600 flex items-center justify-center gap-1.5"
              >
                <Play className="w-4 h-4" /> Run Detection Pipeline
              </button>
            </motion.div>
          )}

          {activeDemo === 'resume' && (
            <motion.div
              key="resume"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4 flex-1 flex flex-col justify-between"
            >
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-text-primary uppercase flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-accent-cyan animate-pulse" /> Monaco Code Parser & Evaluator
                </h3>
                <p className="text-[10px]">
                  Inspect parsed document properties side-by-side with keyword evaluations.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-2">
                {/* Monaco visual editor mockup */}
                <div className="border border-border-glass rounded-xl h-60 bg-zinc-950 flex flex-col overflow-hidden relative">
                  <div className="h-7 border-b border-border-glass bg-zinc-900 px-4 flex items-center gap-1.5 font-mono text-[9px] text-zinc-500 select-none shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                    <span className="ml-2 font-bold text-zinc-400">resume_parsed.json</span>
                  </div>
                  
                  {/* Code viewport with line numbers */}
                  <div className="flex-1 overflow-y-auto flex font-mono text-[10px] p-2 leading-relaxed bg-zinc-950">
                    {/* Line numbers gutter */}
                    <div className="w-8 text-zinc-700 select-none border-r border-border-glass/40 pr-2 mr-2 text-right">
                      {parsedResumeLines.map((_, i) => (
                        <div key={i} className="h-5 flex items-center justify-end">{i+1}</div>
                      ))}
                    </div>
                    {/* Content */}
                    <div className="text-zinc-400 select-text overflow-x-auto flex-1">
                      {parsedResumeLines.map((line, i) => (
                        <div key={i} className="h-5 flex items-center">{line}</div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Analysis Report */}
                <div className="bg-zinc-950/60 p-4 rounded-xl border border-border-glass h-60 overflow-y-auto space-y-3 font-mono text-[10px] select-text">
                  <div className="text-accent-cyan uppercase font-bold text-[9px] tracking-wider border-b border-border-glass pb-1 select-none">
                    ATS Audit Report
                  </div>
                  {isAnalyzing ? (
                    <div className="text-zinc-500 animate-pulse select-none">Running embedding similarities and keyword clustering...</div>
                  ) : analysisReport ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold px-3 py-1 rounded-xl">
                          Score: {analysisReport.score}/100
                        </div>
                        <span className="text-emerald-400">{analysisReport.matchRate}</span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-amber-400 font-bold block flex items-center gap-1 select-none">
                          <AlertTriangle className="w-3.5 h-3.5" /> Missing Keywords:
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1 select-none">
                          {analysisReport.missingKeywords.map((k: string) => (
                            <span key={k} className="px-1.5 py-0.5 rounded bg-zinc-900 border border-border-glass text-[8px] text-zinc-400">
                              {k}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-text-primary font-bold block select-none">Suggestions:</span>
                        <ul className="list-disc list-inside space-y-0.5 text-zinc-400">
                          {analysisReport.suggestions.map((s: string, i: number) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 select-none">
                      <div className="text-zinc-600">Select a file to run matching similarities against target engineering metrics.</div>
                      <label className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-border-glass px-3 py-1.5 rounded-lg text-text-primary cursor-pointer select-none">
                        <Upload className="w-3.5 h-3.5 text-accent-cyan" /> Upload file
                        <input type="file" onChange={handleResumeUpload} accept=".pdf,.txt" className="hidden" />
                      </label>
                      {resumeFile && <div className="text-accent-cyan font-bold block">Selected: {resumeFile}</div>}
                    </div>
                  )}
                </div>
              </div>

              <button
                disabled={!resumeFile || isAnalyzing}
                onClick={runResumeAnalysis}
                className="w-full bg-accent-cyan text-black py-2.5 rounded-xl transition-all cursor-pointer font-bold select-none disabled:opacity-50 hover:bg-cyan-500 flex items-center justify-center gap-1.5"
              >
                <Play className="w-4 h-4" /> Analyze Resume Match
              </button>
            </motion.div>
          )}

          {activeDemo === 'prompts' && (
            <motion.div
              key="prompts"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4 flex-1 flex flex-col justify-between"
            >
              <div className="space-y-1 select-none">
                <h3 className="text-xs font-bold text-text-primary uppercase flex items-center gap-1">
                  <Code className="w-3.5 h-3.5 text-accent-violet animate-pulse" /> Agent Lab: Prompt Diagnostics
                </h3>
                <p className="text-[10px]">
                  Inspect core system instruction files executed within the agent loop nodes.
                </p>
              </div>

              <div className="space-y-3 font-mono text-[10px] my-2 select-text">
                <div className="bg-zinc-950/70 p-4 rounded-xl border border-border-glass space-y-1.5">
                  <div className="flex justify-between items-center select-none text-[8px] text-zinc-500 uppercase border-b border-border-glass/40 pb-1">
                    <span>SYSTEM_PROMPT: planner_node</span>
                    <span>JSON Mode: True</span>
                  </div>
                  <p className="text-zinc-300 leading-normal">
                    "You are the System Planner for the Developer Intelligence Platform. Decide which specialized agent(s) need to participate: projects_agent, resume_agent, experience_agent, skills_agent, architecture_agent, recruiter_agent, blog_agent, contact_agent. Return ONLY a JSON list: {"{\"agents\": [\"agent_name\"]}"}."
                  </p>
                </div>

                <div className="bg-zinc-950/70 p-4 rounded-xl border border-border-glass space-y-1.5">
                  <div className="flex justify-between items-center select-none text-[8px] text-zinc-500 uppercase border-b border-border-glass/40 pb-1">
                    <span>SYSTEM_PROMPT: recruiter_agent</span>
                    <span>JSON Mode: False</span>
                  </div>
                  <p className="text-zinc-300 leading-normal">
                    "You are the Recruiter Agent. Answer candidate queries as a strategic, professional hiring manager recruiter. Emphasize technical depth, commercial readiness, and culture fit based strictly on context."
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
