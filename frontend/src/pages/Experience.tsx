import { motion } from 'framer-motion'
import { History, Calendar, MapPin, Briefcase } from 'lucide-react'

interface ExperienceItem {
  company: string
  role: string
  period: string
  location: string
  description: string
  highlights: string[]
}

const experienceList: ExperienceItem[] = [
  {
    company: 'NeuralLabs AI',
    role: 'AI Systems Engineer Intern',
    period: 'June 2024 - April 2025',
    location: 'Bengaluru, India (Remote)',
    description: 'Led the development and optimization of local vision-language workflows for industrial inspections.',
    highlights: [
      'Reduced cloud model reliance by 100% by migrating vision classification pipelines to fine-tuned Florence-2 models hosted on local clusters.',
      'Engineered high-throughput batching engines that accelerated image annotation pipelines by 3.5x.',
      'Configured multi-tenant vector searches with ChromaDB, maintaining sub-15ms metadata query responses over million-record tables.'
    ]
  },
  {
    company: 'AlphaTech Solutions',
    role: 'Full-Stack Software Engineer Intern',
    period: 'October 2023 - May 2024',
    location: 'Hyderabad, India',
    description: 'Architected low-latency administration panels and metrics dashboards for hardware monitoring systems.',
    highlights: [
      'Constructed React+Vite SPA dashboard using WebSocket channels to stream live system CPU/RAM and database queue state in real-time.',
      'Re-engineered FastAPI database interaction logic using SQLAlchemy async sessions, increasing concurrent request limits by 2.2x.',
      'Created containerized local development scripts using Docker Compose to orchestrate frontend, backend, PostgreSQL, and Redis cache modules.'
    ]
  },
  {
    company: 'IIT Hyderabad Machine Learning Club',
    role: 'Technical Coordinator & Lead Developer',
    period: 'September 2022 - May 2024',
    location: 'IIT Hyderabad',
    description: 'Organized workshops, managed open-source contributions, and led developer teams for regional hackathons.',
    highlights: [
      'Won 1st place in Smart City Hackathon 2023 by building a computer-vision based vehicle volume controller using YOLOv8 and FastAPI.',
      'Conducted developer bootcamps covering Git workflows, Docker deployment, and FastAPI integration, training over 150+ student developers.'
    ]
  }
]

export function Experience() {
  return (
    <div className="flex-1 overflow-y-auto p-6 pb-28 space-y-6 scrollbar-thin neural-grid">
      {/* Page Header */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3 border-b border-border-glass pb-4 select-none"
      >
        <History className="w-6 h-6 text-accent-violet" />
        <div>
          <h1 className="text-lg md:text-xl font-bold font-mono tracking-tight text-text-primary">
            ENGINEERING TIMELINE
          </h1>
          <p className="text-xs text-text-secondary font-mono">
            Professional records detailing corporate internships, systems engineering milestones, and developer lead roles.
          </p>
        </div>
      </motion.div>

      {/* Experience Timeline */}
      <div className="relative border-l border-zinc-800 ml-4 pl-6 space-y-8 mt-4 font-mono">
        {experienceList.map((exp, idx) => (
          <motion.div
            key={exp.company}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="relative"
          >
            {/* Timeline dot */}
            <span className="absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full bg-accent-violet border-4 border-bg-dark ring-2 ring-accent-violet/30" />
            
            {/* Experience Panel */}
            <div className="glass-panel p-5 rounded-2xl border border-border-glass space-y-3">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 pb-2 border-b border-border-glass/40 select-none">
                <div>
                  <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-accent-cyan" /> {exp.role}
                  </h3>
                  <strong className="text-xs text-accent-violet font-semibold block mt-0.5">{exp.company}</strong>
                </div>
                
                <div className="flex flex-wrap gap-3 text-[10px] text-text-secondary">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-zinc-500" /> {exp.period}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-zinc-500" /> {exp.location}</span>
                </div>
              </div>

              <p className="text-xs text-text-secondary leading-relaxed">
                {exp.description}
              </p>

              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] text-text-primary font-bold uppercase tracking-wider block mb-1.5 select-none">Key Contributions:</span>
                <ul className="space-y-1.5 text-[11px] text-text-secondary leading-relaxed">
                  {exp.highlights.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
