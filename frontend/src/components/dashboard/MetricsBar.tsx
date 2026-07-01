import { useOSStore } from '../../store/useOSStore'
import { Cpu, Database, Zap, Activity, Search } from 'lucide-react'

export function MetricsBar() {
  const { model, latency, activeAgent, cpuLoad, memoryUsage, isThinking } = useOSStore()

  return (
    <div className="w-full glass-panel h-12 flex items-center justify-between px-6 text-xs font-mono border-b border-border-glass select-none shrink-0 z-20">
      {/* Platform Branding & Status */}
      <div className="flex items-center gap-3">
        <div className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isThinking ? 'bg-accent-violet' : 'bg-emerald-400'}`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${isThinking ? 'bg-accent-violet' : 'bg-emerald-500'}`}></span>
        </div>
        <span className="text-text-primary tracking-wider uppercase font-bold text-[10px]">
          Developer Intelligence Platform v1.0
        </span>
      </div>

      {/* Real-time Telemetry Metrics */}
      <div className="hidden md:flex items-center gap-6 text-text-secondary">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-accent-violet" />
          <span>Active Agent: <strong className="text-text-primary">{activeAgent}</strong></span>
        </div>

        <div className="flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-accent-cyan" />
          <span>Inference: <strong className="text-text-primary">{model}</strong></span>
        </div>

        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Latency: <strong className="text-text-primary">{latency} ms</strong></span>
        </div>

        <div className="flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-blue-400" />
          <span>Sys metrics: <strong className="text-text-primary">{cpuLoad}% GPU | {memoryUsage} GB VRAM</strong></span>
        </div>
      </div>

      {/* Command Palette trigger integrated inside metrics flow */}
      <div 
        onClick={() => window.dispatchEvent(new Event('toggle-command-palette'))}
        className="cursor-pointer hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-950/40 hover:bg-zinc-800/40 text-[9px] font-mono text-text-secondary select-none transition-colors border border-border-glass shrink-0"
      >
        <Search className="w-3.5 h-3.5 text-accent-violet animate-pulse" />
        <span>Command Palette</span>
        <span className="bg-zinc-900 px-1 py-0.5 rounded text-[7px] border border-border-glass text-zinc-500 select-none">Ctrl K</span>
      </div>

      {/* Mobile view model status */}
      <div className="flex md:hidden text-text-primary font-bold">
        {activeAgent} &bull; {latency}ms
      </div>
    </div>
  )
}
