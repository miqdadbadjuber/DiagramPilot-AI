import { lazy, Suspense } from 'react'
import Sidebar from './components/Sidebar'
import ChatPanel from './components/ChatPanel'
import { Toaster } from 'sonner'

const DiagramCanvas = lazy(() => import('./components/DiagramCanvas'))

function DiagramCanvasFallback() {
  return (
    <div className="flex-1 bg-zinc-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-zinc-500">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin" />
        <span className="text-sm font-medium">Loading diagram engine...</span>
      </div>
    </div>
  )
}

function App() {
  return (
    <div className="flex h-screen w-full bg-zinc-950 font-sans overflow-hidden">
      <Toaster theme="dark" position="top-right" />
      <Sidebar />
      <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
        <ChatPanel />
        <Suspense fallback={<DiagramCanvasFallback />}>
          <DiagramCanvas />
        </Suspense>
      </div>
    </div>
  )
}

export default App
