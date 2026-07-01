import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FolderCode, ArrowRight, Layers } from 'lucide-react'
import { useMouseGlow } from '../hooks/useMouseGlow'
import gsap from 'gsap'

interface ProjectItem {
  id: string
  title: string
  subtitle: string
  summary: string
  tech: string[]
  metrics?: { label: string; value: string }
}

const projectsList: ProjectItem[] = [
  {
    id: 'visionvault',
    title: 'VisionVault',
    subtitle: 'Edge AI Computer Vision Platform',
    summary: 'A distributed edge computer vision platform running Grounding DINO and Florence-2 to ingest, process, and semantically index H.264 video streams.',
    tech: ['FastAPI', 'Florence-2', 'Grounding DINO', 'ChromaDB', 'Redis'],
    metrics: { label: 'Frame Latency', value: '42ms' }
  },
  {
    id: 'ats-resume',
    title: 'ATS Resume Evaluator',
    subtitle: 'AI Recruiter Pipeline Sandbox',
    summary: 'A microservice-based ATS analyzer that reads resumes, compares them semantically against target job profiles, and outputs matching recommendations.',
    tech: ['Python', 'Qwen3', 'SentenceTransformers', 'ChromaDB'],
    metrics: { label: 'Match Precision', value: '96%' }
  },
  {
    id: 'documind',
    title: 'DocuMind RAG',
    subtitle: 'Enterprise Document Intelligence',
    summary: 'An AI-powered document intelligence system capable of parsing unstructured PDFs and running semantic Q&A queries against local vector shards.',
    tech: ['React', 'FastAPI', 'PaddleOCR', 'ChromaDB'],
    metrics: { label: 'Indexing Time', value: '0.8s/pg' }
  },
  {
    id: 'momentum-ai',
    title: 'Momentum AI',
    subtitle: 'Agentic Product Planner',
    summary: 'A multi-agent development sandbox utilizing LangGraph to decompose user product proposals into requirements, system designs, and roadmaps.',
    tech: ['LangGraph', 'Mistral 7B', 'PostgreSQL', 'Docker'],
    metrics: { label: 'Graph Nodes', value: '9 nodes' }
  },
  {
    id: 'sympsense',
    title: 'SympSense',
    subtitle: 'Clinical Anomaly Classifier',
    summary: 'An open-source medical diagnostic helper model utilizing customized sequence-classification templates for clinical reports clustering.',
    tech: ['PyTorch', 'all-MiniLM-L6-v2', 'FastAPI'],
    metrics: { label: 'F1 Score', value: '0.942' }
  }
]

// Project Card Subcomponent binding useMouseGlow locally for individual hover coordinates
function ProjectCard({ project }: { project: ProjectItem }) {
  const cardRef = useMouseGlow()

  return (
    <div
      ref={cardRef}
      className="mouse-glow-card p-5 flex flex-col justify-between h-[250px] relative overflow-hidden group transition-all"
    >
      {/* Glow highlight spot */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent-violet/5 rounded-full blur-3xl group-hover:bg-accent-violet/10 transition-all pointer-events-none" />
      
      {/* Header metrics */}
      <div className="relative z-10">
        <div className="flex justify-between items-start gap-4 select-none">
          <div>
            <h3 className="text-md font-bold font-mono text-text-primary">{project.title}</h3>
            <span className="text-[10px] text-accent-cyan font-mono">{project.subtitle}</span>
          </div>
          {project.metrics && (
            <div className="bg-black/30 border border-border-glass px-2.5 py-1 rounded-lg text-right font-mono text-[9px]">
              <span className="text-text-secondary block">{project.metrics.label}</span>
              <strong className="text-accent-violet font-bold">{project.metrics.value}</strong>
            </div>
          )}
        </div>
        <p className="text-xs text-text-secondary leading-relaxed font-mono mt-3 line-clamp-3 select-text">
          {project.summary}
        </p>
      </div>

      {/* Tech tag elements */}
      <div className="space-y-4 relative z-10">
        <div className="flex flex-wrap gap-1.5 font-mono select-none">
          {project.tech.map((t) => (
            <span key={t} className="px-1.5 py-0.5 rounded bg-zinc-900 text-[9px] border border-border-glass text-text-secondary">
              {t}
            </span>
          ))}
        </div>

        <div className="flex justify-between items-center border-t border-border-glass pt-3 font-mono text-xs select-none">
          <Link 
            to={`/projects/${project.id}`}
            className="text-text-secondary hover:text-accent-violet flex items-center gap-1.5 transition-colors"
          >
            <Layers className="w-3.5 h-3.5" /> Architecture
          </Link>
          <Link 
            to={`/projects/${project.id}`}
            className="text-accent-violet hover:text-white flex items-center gap-1 transition-colors"
          >
            Inspect details <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export function Projects() {
  // GSAP animations on load
  useEffect(() => {
    gsap.fromTo('.mouse-glow-card',
      { opacity: 0, y: 35, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out', stagger: 0.08 }
    )
  }, [])

  return (
    <div className="flex-1 overflow-y-auto p-6 pb-28 space-y-6 scrollbar-thin neural-grid">
      {/* Header title */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3 border-b border-border-glass pb-4 select-none"
      >
        <FolderCode className="w-6 h-6 text-accent-violet" />
        <div>
          <h1 className="text-lg md:text-xl font-bold font-mono tracking-tight text-text-primary">
            PROJECT REGISTRY
          </h1>
          <p className="text-xs text-text-secondary font-mono">
            Interactive software showcase utilizing self-hosted models, Docker assemblies, and vector pipelines.
          </p>
        </div>
      </motion.div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projectsList.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  )
}
