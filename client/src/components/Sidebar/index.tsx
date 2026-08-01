import { useChatStore } from '../../store/chatStore';
import { Trash2 } from 'lucide-react';

export default function Sidebar() {
  const { messages, clearHistory } = useChatStore();
  
  // Count interactions (user messages)
  const interactions = messages.filter(m => m.role === 'user').length;

  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-800 text-zinc-300 hidden md:flex flex-col h-full">
      <div className="p-4 border-b border-zinc-800">
        <h1 className="font-bold text-white text-lg">DiagramPilot AI</h1>
        <p className="text-xs text-zinc-500">AI Architecture Assistant</p>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        <button 
          onClick={clearHistory}
          className="w-full bg-zinc-800 hover:bg-zinc-700 text-white rounded-md py-2 px-4 transition-colors mb-4 flex items-center justify-center gap-2 text-sm"
        >
          + New Chat
        </button>
        
        {interactions > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">History</p>
              <button onClick={clearHistory} className="text-zinc-500 hover:text-red-400 transition-colors" title="Clear History">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="text-sm text-zinc-400 p-2 bg-zinc-900/50 rounded border border-zinc-800/50">
              {interactions} interaction{interactions > 1 ? 's' : ''} in current session.
            </div>
            <p className="text-xs text-zinc-600 mt-2">
              History is limited to the last 10 interactions to optimize token usage.
            </p>
          </div>
        )}
      </div>
      <div className="p-4 border-t border-zinc-800 text-sm flex flex-col gap-2">
        <a href="#" className="hover:text-white transition-colors">Settings</a>
        <a href="#" className="hover:text-white transition-colors">GitHub</a>
        <a href="#" className="hover:text-white transition-colors">About</a>
      </div>
    </aside>
  );
}
