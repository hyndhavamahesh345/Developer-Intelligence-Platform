import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, FolderCode, History, Wrench, FlaskConical, Mail } from 'lucide-react'

interface DockItem {
  name: string
  path: string
  icon: React.ComponentType<{ className?: string }>
}

const dockItems: DockItem[] = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Projects', path: '/projects', icon: FolderCode },
  { name: 'Experience', path: '/experience', icon: History },
  { name: 'Skills', path: '/skills', icon: Wrench },
  { name: 'Playground', path: '/playground', icon: FlaskConical },
  { name: 'Contact', path: '/contact', icon: Mail },
]

export function SystemDock() {
  return (
    <div className="fixed bottom-6 left-0 right-0 flex justify-center items-center pointer-events-none select-none z-30">
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="glass-panel px-4 py-2.5 rounded-2xl flex items-end gap-3 pointer-events-auto shadow-2xl relative border border-border-glass max-w-full"
      >
        {dockItems.map((item) => (
          <NavLink 
            key={item.name} 
            to={item.path}
            className={({ isActive }) => `
              relative group flex flex-col items-center justify-center rounded-xl p-2.5 transition-all
              ${isActive ? 'bg-accent-violet/20 border border-accent-violet/30' : 'hover:bg-white/5 border border-transparent'}
            `}
          >
            {({ isActive }) => (
              <>
                <motion.div
                  whileHover={{ scale: 1.15, y: -4 }}
                  className={`w-6 h-6 flex items-center justify-center transition-colors ${isActive ? 'text-accent-violet' : 'text-text-secondary group-hover:text-text-primary'}`}
                >
                  <item.icon className="w-5 h-5" />
                </motion.div>
                
                {/* Active dot indicator */}
                {isActive && (
                  <motion.div 
                    layoutId="activeDot"
                    className="absolute -bottom-1 w-1 h-1 bg-accent-violet rounded-full"
                  />
                )}

                {/* Tooltip */}
                <span className="absolute bottom-14 opacity-0 pointer-events-none scale-90 group-hover:scale-100 group-hover:opacity-100 transition-all duration-150 px-2 py-1 rounded-md bg-zinc-900 border border-border-glass text-[10px] font-mono tracking-wider text-text-primary whitespace-nowrap">
                  {item.name}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </motion.div>
    </div>
  )
}
