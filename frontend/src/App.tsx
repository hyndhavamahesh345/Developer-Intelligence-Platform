import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MetricsBar } from './components/dashboard/MetricsBar'
import { ChatConsole } from './components/console/ChatConsole'
import { SystemDock } from './components/layout/SystemDock'
import { NeuralCanvas } from './components/canvas/NeuralCanvas'
import { Dashboard } from './pages/Dashboard'
import { Projects } from './pages/Projects'
import { ProjectDetails } from './pages/ProjectDetails'
import { Experience } from './pages/Experience'
import { Skills } from './pages/Skills'
import { Playground } from './pages/Playground'
import { Contact } from './pages/Contact'
import { StartupLoader } from './components/ui/StartupLoader'
import { CommandPalette } from './components/ui/CommandPalette'

function App() {
  return (
    <BrowserRouter>
      {/* Visual diagnostic diagnostic loader */}
      <StartupLoader />
      
      {/* Global Action Command Palette */}
      <CommandPalette />

      <div className="relative flex flex-col h-screen w-screen overflow-hidden bg-bg-dark text-text-primary">
        {/* 3D R3F Neural canvas backdrop */}
        <NeuralCanvas />

        {/* Top metrics bar */}
        <MetricsBar />

        {/* Workspace split view */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 relative">
          
          {/* Main OS page panels */}
          <div className="flex-1 flex flex-col min-h-0 min-w-0 relative">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:projectId" element={<ProjectDetails />} />
              <Route path="/experience" element={<Experience />} />
              <Route path="/skills" element={<Skills />} />
              <Route path="/playground" element={<Playground />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </div>

          {/* Right agent chat console */}
          <ChatConsole />
        </div>

        {/* Bottom navigation dock */}
        <SystemDock />
      </div>
    </BrowserRouter>
  )
}

export default App
