import { create } from 'zustand'

export interface Message {
  id: string
  sender: 'visitor' | 'agent'
  content: string
  timestamp: Date
  routedTo?: string
  latency?: number
  thinkingSteps?: string[]
}

interface OSState {
  activeAgent: string
  model: string
  latency: number
  cpuLoad: number
  memoryUsage: number
  messages: Message[]
  thinkingSteps: string[]
  isThinking: boolean
  
  setActiveAgent: (agent: string) => void
  setModel: (model: string) => void
  updateMetrics: (latency: number, cpuLoad?: number, memoryUsage?: number) => void
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void
  setThinkingSteps: (steps: string[]) => void
  setIsThinking: (isThinking: boolean) => void
  clearChat: () => void
}

export const useOSStore = create<OSState>((set) => ({
  activeAgent: 'Router',
  model: 'Qwen 3.7 Instruct (Local)',
  latency: 42,
  cpuLoad: 24,
  memoryUsage: 3.8,
  messages: [
    {
      id: 'welcome',
      sender: 'agent',
      content: 'Welcome to the Developer Intelligence Platform. I am the Agentic Router. Ask me anything about my projects, research, resume, or engineering background, and I will orchestrate the appropriate specialized sub-agents to answer your query.',
      timestamp: new Date(),
      routedTo: 'Router'
    }
  ],
  thinkingSteps: [],
  isThinking: false,

  setActiveAgent: (activeAgent) => set({ activeAgent }),
  setModel: (model) => set({ model }),
  updateMetrics: (latency, cpuLoad, memoryUsage) => set(() => ({
    latency,
    cpuLoad: cpuLoad !== undefined ? cpuLoad : Math.floor(Math.random() * 20) + 15,
    memoryUsage: memoryUsage !== undefined ? memoryUsage : +(Math.random() * 0.5 + 3.6).toFixed(1)
  })),
  addMessage: (msg) => set((state) => ({
    messages: [
      ...state.messages,
      {
        ...msg,
        id: Math.random().toString(36).substring(7),
        timestamp: new Date()
      }
    ]
  })),
  setThinkingSteps: (thinkingSteps) => set({ thinkingSteps }),
  setIsThinking: (isThinking) => set({ isThinking }),
  clearChat: () => set(() => ({
    messages: [
      {
        id: 'welcome',
        sender: 'agent',
        content: 'System conversation memory cleared. Ready for new instructions.',
        timestamp: new Date(),
        routedTo: 'Router'
      }
    ],
    thinkingSteps: []
  }))
}))
