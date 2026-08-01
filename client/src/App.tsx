import Sidebar from './components/Sidebar'
import ChatPanel from './components/ChatPanel'
import DiagramCanvas from './components/DiagramCanvas'
import { Toaster } from 'sonner'

function App() {
  return (
    <div className="flex h-screen w-full bg-zinc-950 font-sans overflow-hidden">
      <Toaster theme="dark" position="top-right" />
      <Sidebar />
      <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
        <ChatPanel />
        <DiagramCanvas />
      </div>
    </div>
  )
}

export default App
