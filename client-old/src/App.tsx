import { lazy, Suspense } from 'react'
import Sidebar from './components/Sidebar'
import ChatPanel from './components/ChatPanel'
import { Toaster } from 'sonner'
import { useChatStore } from './store/chatStore'

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
  const { isSidebarOpen } = useChatStore();
  
  return (
    <div className="flex h-screen w-full bg-zinc-950 font-sans overflow-hidden">
      <Toaster theme="dark" position="top-right" />
      
      {/* Sidebar - controlled by isSidebarOpen */}
      <div 
        className={`flex-shrink-0 h-full transition-all duration-300 ease-in-out flex overflow-hidden border-r border-zinc-800/80 relative z-30 ${
          isSidebarOpen ? 'w-[260px]' : 'w-[64px]'
        }`}
      >
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden transition-all duration-300 relative z-10">
        <div 
          className={`w-full flex-shrink-0 h-full flex flex-col border-r border-zinc-800/80 bg-zinc-950 relative z-20 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? 'md:w-[400px] lg:w-[450px]' : 'md:w-[500px] lg:w-[600px]'
          }`}
        >
          <ChatPanel />
        </div>
        <Suspense fallback={<DiagramCanvasFallback />}>
          <DiagramCanvas />
        </Suspense>
      </div>
    </div>
  );
}

export default App;
