import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useOSStore } from '../../store/useOSStore'
import { Search, Terminal, FolderCode, History, Wrench, FlaskConical, MessageSquare, CornerDownLeft } from 'lucide-react'

interface CommandItem {
  name: string
  shortcut: string
  action: () => void
  icon: React.ComponentType<{ className?: string }>
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const navigate = useNavigate()
  const { clearChat, addMessage, setActiveAgent } = useOSStore()
  const inputRef = useRef<HTMLInputElement>(null)

  // Listen for Ctrl+K / Cmd+K triggers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
      // Close on escape
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    };
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Auto-focus input when palette opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
      setSearchQuery('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  const commands: CommandItem[] = [
    { name: 'Navigate to Mission Control', shortcut: 'G + M', icon: Terminal, action: () => navigate('/') },
    { name: 'Inspect Projects Registry', shortcut: 'G + P', icon: FolderCode, action: () => navigate('/projects') },
    { name: 'Open Experience Timeline', shortcut: 'G + E', icon: History, action: () => navigate('/experience') },
    { name: 'Check Skills Inventory', shortcut: 'G + S', icon: Wrench, action: () => navigate('/skills') },
    { name: 'Open AI Lab Workspace', shortcut: 'G + L', icon: FlaskConical, action: () => navigate('/playground') },
    { name: 'Initiate Recruiter Interview', shortcut: 'A + I', icon: MessageSquare, action: () => {
      navigate('/')
      setActiveAgent('Recruiter Agent')
      addMessage({
        sender: 'agent',
        content: 'RECRUITER ENGINE INITIALIZED. Ask me any direct candidate vetting or hiring query.',
        routedTo: 'Recruiter Agent'
      })
    }},
    { name: 'Clear Session Memory logs', shortcut: 'S + C', icon: Terminal, action: () => clearChat() }
  ]

  const filteredCommands = commands.filter((cmd) =>
    cmd.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Handle keyboard selections
  useEffect(() => {
    const handleNavigation = (e: KeyboardEvent) => {
      if (!isOpen) return
      
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action()
          setIsOpen(false)
        }
      }
    };
    window.addEventListener('keydown', handleNavigation)
    return () => window.removeEventListener('keydown', handleNavigation)
  }, [isOpen, selectedIndex, filteredCommands])

  // Custom toggle event listener
  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev)
    window.addEventListener('toggle-command-palette', handleToggle)
    return () => window.removeEventListener('toggle-command-palette', handleToggle)
  }, [])

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Dark blur backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Modal Dialog */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -20 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="relative w-full max-w-lg glass-panel-glow rounded-2xl overflow-hidden font-mono"
            >
              {/* Search box */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border-glass bg-zinc-950/40">
                <Search className="w-5 h-5 text-text-secondary" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setSelectedIndex(0); }}
                  placeholder="Type a command or search shortcut..."
                  className="flex-1 bg-transparent text-text-primary text-xs focus:outline-none placeholder-zinc-500"
                />
                <span className="text-[9px] bg-zinc-800 px-1.5 py-0.5 rounded border border-border-glass text-zinc-500 select-none">ESC</span>
              </div>

              {/* Suggestions list */}
              <div className="max-h-64 overflow-y-auto p-2 space-y-0.5 scrollbar-thin">
                {filteredCommands.length > 0 ? (
                  filteredCommands.map((cmd, idx) => (
                    <div
                      key={cmd.name}
                      onClick={() => { cmd.action(); setIsOpen(false); }}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer select-none ${
                        idx === selectedIndex 
                          ? 'bg-accent-violet/15 text-accent-violet border border-accent-violet/25' 
                          : 'border border-transparent text-text-secondary hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <cmd.icon className={`w-4 h-4 ${idx === selectedIndex ? 'text-accent-violet' : 'text-zinc-500'}`} />
                        <span>{cmd.name}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] bg-zinc-900 border border-border-glass px-1.5 py-0.5 rounded text-zinc-400">
                          {cmd.shortcut}
                        </span>
                        {idx === selectedIndex && <CornerDownLeft className="w-3.5 h-3.5 text-accent-violet" />}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs text-zinc-600 select-none">
                    No matching action commands found.
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
