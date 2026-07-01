import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Layers, ShieldCheck, Cpu } from 'lucide-react'
import { useMouseGlow } from '../hooks/useMouseGlow'
import gsap from 'gsap'

// Simple mock loader matching our knowledge base JSON structures
const projectDataDetails: Record<string, any> = {
  visionvault: {
    title: 'VisionVault',
    subtitle: 'Edge AI Computer Vision Platform',
    tabs: {
      overview: {
        title: 'System Overview',
        content: 'VisionVault is a distributed computer vision intelligence engine designed to process multiple high-definition video streams concurrently. By integrating Florence-2 for dense image captioning and Grounding DINO for zero-shot detection, it provides sub-100ms analytics and spatial mapping.',
        features: [
          'Multi-stream real-time object tracking',
          'Zero-shot open-vocabulary detection using Grounding DINO',
          'Dense vision-to-text image captioning using Florence-2',
          'Edge-optimized deployment via Docker container orchestration',
          'Vector-based video query interface'
        ],
        tech_stack: ['React', 'TypeScript', 'FastAPI', 'Florence-2', 'Grounding DINO', 'Redis', 'Docker', 'ChromaDB']
      },
      architecture: {
        title: 'Microservices & Pipeline Architecture',
        components: {
          'Ingestion Gateway': 'FastAPI WebSocket gateway handling H.264 frame ingestion and clients connections.',
          'Message Broker': 'Redis Queue managing frame distribution to Vision worker pools, acting as a rate limiter and buffer.',
          'Inference Engine': 'Dockerized Python workers hosting Florence-2 and Grounding DINO, utilizing TensorRT runtime compilation for GPU acceleration.',
          'Vector Database': 'ChromaDB indexing spatial/text features extracted from video frames for semantic natural language video search.',
          'Storage': 'MinIO S3-compatible store caching keyframes, events metadata saved in PostgreSQL.'
        },
        data_flow: [
          'IP Camera streams H.264 frames to FastAPI Gateway via WebSocket.',
          'Gateway downsamples frames and pushes them into Redis stream queues.',
          'Worker instances dequeue frames and run concurrent inference using Grounding DINO for tracking and Florence-2 for captioning.',
          'Extracted text descriptions are embedded using all-MiniLM-L6-v2 and stored in ChromaDB alongside coordinates.',
          'Client dashboard receives live detections and bounding boxes via client WebSockets.'
        ]
      },
      challenges: {
        title: 'Technical Challenges & Solutions',
        items: [
          {
            issue: 'Inference Latency Bottleneck',
            impact: 'Concurrent processing of multiple 30 FPS streams caused memory overflows on a single RTX 4090.',
            solution: 'Implemented keyframe delta comparison. Frames are only sent to the inference worker if the pixel-wise difference exceeds 12%. Created an execution batch size of 8 on Florence-2 to maximize GPU core utilization.'
          },
          {
            issue: 'Zero-Shot Coordinate Drift',
            impact: 'Grounding DINO bounding box predictions drifted during rapid movements.',
            solution: 'Coupled Grounding DINO with ByteTrack (a lightweight multi-object tracking algorithm). Grounding DINO runs every 5th frame, and ByteTrack handles tracking in between, reducing GPU compute requirements by 80%.'
          },
          {
            issue: 'Embedding Search Overhead',
            impact: 'Queries on millisecond video frames degraded performance as the database scaled.',
            solution: 'Partitioned ChromaDB collections by hourly chunks. Queries are localized based on chronological metadata filters before running vector similarities.'
          }
        ]
      },
      deployment: {
        title: 'Production Deployment blueprint',
        environment: 'Ubuntu Server 22.04 LTS (Nvidia Docker Container Toolkit)',
        hardware: {
          'CPU': 'Intel Xeon or AMD EPYC (minimum 8 cores)',
          'RAM': '32GB DDR4 System RAM',
          'GPU': 'Nvidia RTX 4090 or Nvidia A10G (minimum 16GB VRAM)',
          'Storage': '500GB NVMe SSD'
        },
        steps: [
          'Install Nvidia Container Toolkit to enable Docker access to GPU cores.',
          'Clone service configurations and mount models directory: models/florence-2 and models/grounding-dino.',
          'Execute docker compose -f docker-compose.prod.yml up --build -d to launch broker, database, worker clusters, and web app.',
          'Run DB migration scripts and perform warm-up inference calls to compile TensorRT engines.'
        ]
      },
      roadmap: {
        title: 'Development Timeline',
        milestones: [
          { quarter: 'Q3 2026', title: 'Custom Fine-Tuning Support', desc: 'Implement Low-Rank Adaptation (LoRA) pipelines for Florence-2 to adapt captioning outputs to custom corporate domains (e.g. medical tools, specialized factory machinery).' },
          { quarter: 'Q4 2026', title: 'Edge-Deployment Hubs', desc: 'Develop native executable builds for Nvidia Jetson Orin Nano modules to run local vision pipelines directly on cheap edge hardware.' },
          { quarter: 'Q1 2027', title: 'Live Web3 Streams', desc: 'Integrate decentralized stream protocols (e.g., Livepeer) to guarantee end-to-end encrypted distribution of video feeds.' }
        ]
      }
    }
  }
}

export function ProjectDetails() {
  const { projectId } = useParams<{ projectId: string }>()
  const project = projectDataDetails[projectId || ''] || projectDataDetails.visionvault
  const [activeTab, setActiveTab] = useState<'overview' | 'architecture' | 'challenges' | 'deployment' | 'roadmap'>('overview')

  // Mouse glows refs for documentation cards
  const headerCard = useMouseGlow()
  const contentCard = useMouseGlow()

  // GSAP animation triggers
  useEffect(() => {
    gsap.fromTo('.mouse-glow-card',
      { opacity: 0, y: 25 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.1 }
    )
  }, [activeTab]) // Trigger anim on tab updates as well

  if (!project) {
    return (
      <div className="flex-1 p-6 text-center font-mono">
        <p className="text-red-400">Project index not found in local environment state.</p>
        <Link to="/projects" className="text-accent-violet hover:underline mt-4 block">Return to Registry</Link>
      </div>
    )
  }

  const renderTabContent = () => {
    const tabData = project.tabs[activeTab]
    
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6 relative z-10">
            <div className="space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-accent-violet">{tabData.title}</h3>
              <p className="text-xs leading-relaxed text-text-secondary select-text">{tabData.content}</p>
            </div>
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-text-primary">Key Architectures:</h4>
              <ul className="space-y-1 text-xs text-text-secondary select-text">
                {tabData.features.map((f: string, i: number) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-violet" /> {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap gap-1.5 select-none">
              {tabData.tech_stack.map((t: string) => (
                <span key={t} className="px-2 py-0.5 rounded bg-zinc-950/60 border border-border-glass text-[10px] text-accent-cyan">
                  {t}
                </span>
              ))}
            </div>
          </div>
        )
      case 'architecture':
        return (
          <div className="space-y-6 relative z-10">
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-accent-violet">{tabData.title}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(tabData.components).map(([k, v]: [string, any]) => (
                  <div key={k} className="p-3.5 bg-black/20 border border-border-glass rounded-xl space-y-1 select-text">
                    <h4 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-accent-cyan animate-pulse" /> {k}
                    </h4>
                    <p className="text-[11px] text-text-secondary leading-relaxed">{v}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2.5 select-text">
              <h4 className="text-xs font-bold text-text-primary">Pipeline Flow:</h4>
              <ol className="space-y-1.5 text-xs text-text-secondary list-decimal list-inside">
                {tabData.data_flow.map((f: string, i: number) => (
                  <li key={i} className="leading-relaxed">{f}</li>
                ))}
              </ol>
            </div>
          </div>
        )
      case 'challenges':
        return (
          <div className="space-y-5 relative z-10">
            <h3 className="text-sm font-bold uppercase tracking-wider text-accent-violet">{tabData.title}</h3>
            <div className="space-y-4">
              {tabData.items.map((item: any, i: number) => (
                <div key={i} className="p-4 bg-black/25 border border-border-glass rounded-xl space-y-2 border-l-2 border-l-amber-400 select-text">
                  <div className="flex justify-between items-center select-none">
                    <h4 className="text-xs font-bold text-text-primary">{item.issue}</h4>
                    <span className="text-[9px] bg-amber-400/10 border border-amber-400/20 text-amber-400 px-1.5 py-0.5 rounded">RESOLVED</span>
                  </div>
                  <p className="text-[11px] text-text-secondary leading-relaxed"><strong className="text-text-primary">Impact:</strong> {item.impact}</p>
                  <p className="text-[11px] text-accent-cyan leading-relaxed"><strong className="text-text-primary">Fix:</strong> {item.solution}</p>
                </div>
              ))}
            </div>
          </div>
        )
      case 'deployment':
        return (
          <div className="space-y-5 relative z-10">
            <h3 className="text-sm font-bold uppercase tracking-wider text-accent-violet">{tabData.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-black/30 border border-border-glass rounded-xl space-y-2 select-text">
                <h4 className="text-xs font-bold text-text-primary flex items-center gap-1.5 select-none">
                  <Cpu className="w-4 h-4 text-accent-cyan" /> Hardware Architecture
                </h4>
                <div className="space-y-1.5 font-mono text-[10px] text-text-secondary">
                  {Object.entries(tabData.hardware).map(([k, v]: [string, any]) => (
                    <div key={k} className="flex justify-between">
                      <span>{k}:</span> <span className="text-text-primary">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-black/30 border border-border-glass rounded-xl space-y-2 select-text">
                <h4 className="text-xs font-bold text-text-primary flex items-center gap-1.5 select-none">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Target OS
                </h4>
                <p className="text-xs text-text-secondary font-mono leading-relaxed">{tabData.environment}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-text-primary select-none">Execution Steps:</h4>
              <pre className="bg-zinc-950/80 p-4 rounded-xl border border-border-glass text-[10px] text-accent-cyan font-mono overflow-x-auto select-all">
                {tabData.steps.map((s: string, i: number) => `${i+1}. ${s}`).join('\n')}
              </pre>
            </div>
          </div>
        )
      case 'roadmap':
        return (
          <div className="space-y-5 relative z-10">
            <h3 className="text-sm font-bold uppercase tracking-wider text-accent-violet">{tabData.title}</h3>
            <div className="relative border-l border-zinc-800 ml-4 pl-6 space-y-6 select-text">
              {tabData.milestones.map((m: any, i: number) => (
                <div key={i} className="relative">
                  <span className="absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full bg-accent-violet border-4 border-bg-dark ring-2 ring-accent-violet/30" />
                  <div className="space-y-1">
                    <span className="text-[10px] bg-accent-violet/10 text-accent-violet px-2 py-0.5 rounded font-mono font-bold">{m.quarter}</span>
                    <h4 className="text-xs font-bold text-text-primary mt-1">{m.title}</h4>
                    <p className="text-[11px] text-text-secondary leading-relaxed">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 pb-28 space-y-6 scrollbar-thin neural-grid">
      {/* Back button and breadcrumbs */}
      <div className="flex items-center justify-between font-mono text-[10px] select-none text-text-secondary">
        <Link to="/projects" className="flex items-center gap-1 hover:text-accent-violet transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Registry
        </Link>
        <span>PROJECTS / {project.title.toUpperCase()}</span>
      </div>

      {/* Project title block */}
      <div 
        ref={headerCard}
        className="mouse-glow-card p-6 border-l-4 border-l-accent-cyan"
      >
        <div className="relative z-10">
          <h2 className="text-lg md:text-xl font-bold font-mono tracking-tight text-text-primary">{project.title}</h2>
          <p className="text-xs text-text-secondary font-mono mt-1">{project.subtitle}</p>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border-glass pb-3 font-mono text-[11px] select-none">
        {(['overview', 'architecture', 'challenges', 'deployment', 'roadmap'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              activeTab === tab
                ? 'bg-accent-violet/15 border-accent-violet/30 text-accent-violet font-bold'
                : 'bg-black/10 border-border-glass text-text-secondary hover:bg-white/5'
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Tab panel display container */}
      <div 
        ref={contentCard}
        className="mouse-glow-card p-5 font-mono"
      >
        {renderTabContent()}
      </div>
    </div>
  )
}
