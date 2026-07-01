import { motion } from 'framer-motion'
import { Wrench, Cpu, Layout, Server, Settings } from 'lucide-react'

interface SkillInfo {
  name: string
  level: string
  percentage: number
}

interface SkillDomain {
  name: string
  icon: React.ComponentType<{ className?: string }>
  skills: SkillInfo[]
}

const domains: SkillDomain[] = [
  {
    name: 'Machine Learning & AI Engineering',
    icon: Cpu,
    skills: [
      { name: 'LangGraph Orchestration', level: 'Expert', percentage: 95 },
      { name: 'Local LLM Fine-Tuning & Quantization', level: 'Advanced', percentage: 90 },
      { name: 'Computer Vision (Florence-2, DINO, YOLO)', level: 'Expert', percentage: 95 },
      { name: 'Vector Databases (ChromaDB, PgVector)', level: 'Expert', percentage: 92 },
      { name: 'Embeddings & Rerankers (BGE-M3, MiniLM)', level: 'Advanced', percentage: 88 }
    ]
  },
  {
    name: 'Backend Development',
    icon: Server,
    skills: [
      { name: 'Python & FastAPI', level: 'Expert', percentage: 96 },
      { name: 'Asynchronous SQLAlchemy', level: 'Expert', percentage: 92 },
      { name: 'PostgreSQL Database Design', level: 'Advanced', percentage: 88 },
      { name: 'Redis caching & pub-sub streams', level: 'Advanced', percentage: 85 },
      { name: 'WebSocket Real-time Connections', level: 'Expert', percentage: 94 }
    ]
  },
  {
    name: 'Frontend Architecture',
    icon: Layout,
    skills: [
      { name: 'React & TypeScript', level: 'Expert', percentage: 95 },
      { name: 'Vite & Build Optimization', level: 'Expert', percentage: 92 },
      { name: 'Tailwind CSS & Premium UI design', level: 'Expert', percentage: 94 },
      { name: 'Motion (Framer Motion) animations', level: 'Expert', percentage: 90 },
      { name: 'React Three Fiber & 3D canvases', level: 'Advanced', percentage: 80 }
    ]
  },
  {
    name: 'DevOps & Cloud Orchestration',
    icon: Settings,
    skills: [
      { name: 'Docker & Multi-stage container builds', level: 'Expert', percentage: 92 },
      { name: 'Docker Compose Multi-service setups', level: 'Expert', percentage: 95 },
      { name: 'GitHub Actions (CI/CD Automations)', level: 'Advanced', percentage: 85 },
      { name: 'Linux Shell scripting & admin', level: 'Advanced', percentage: 82 }
    ]
  }
]

export function Skills() {
  return (
    <div className="flex-1 overflow-y-auto p-6 pb-28 space-y-6 scrollbar-thin neural-grid">
      {/* Page Header */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3 border-b border-border-glass pb-4 select-none"
      >
        <Wrench className="w-6 h-6 text-accent-violet" />
        <div>
          <h1 className="text-lg md:text-xl font-bold font-mono tracking-tight text-text-primary">
            SKILLSET INVENTORY
          </h1>
          <p className="text-xs text-text-secondary font-mono">
            Categorized technical stack competencies with performance ratings and core execution details.
          </p>
        </div>
      </motion.div>

      {/* Grid of domains */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {domains.map((domain, domainIdx) => (
          <motion.div
            key={domain.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: domainIdx * 0.1 }}
            className="glass-panel p-5 rounded-2xl border border-border-glass space-y-4 font-mono"
          >
            {/* Domain Title */}
            <div className="flex items-center gap-2 border-b border-border-glass pb-2 select-none">
              <domain.icon className="w-5 h-5 text-accent-violet" />
              <h3 className="text-xs font-bold tracking-wider text-text-primary uppercase">{domain.name}</h3>
            </div>

            {/* List of Skills */}
            <div className="space-y-3.5">
              {domain.skills.map((skill, skillIdx) => (
                <div key={skill.name} className="space-y-1.5 text-xs text-text-secondary">
                  <div className="flex justify-between items-center">
                    <span className="text-text-primary font-medium">{skill.name}</span>
                    <span className="text-[10px] bg-zinc-950/60 border border-border-glass px-1.5 py-0.5 rounded text-accent-cyan select-none">{skill.level}</span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="h-2 w-full bg-zinc-800/40 border border-border-glass/40 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.percentage}%` }}
                      transition={{ duration: 1, delay: domainIdx * 0.1 + skillIdx * 0.05 }}
                      className="h-full bg-gradient-to-r from-accent-violet to-accent-cyan rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
