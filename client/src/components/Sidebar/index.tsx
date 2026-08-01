import { useChatStore } from '../../store/chatStore';
import { Trash2 } from 'lucide-react';

export default function Sidebar() {
  const { messages, clearHistory } = useChatStore();
  
  // Count interactions (user messages)
  const interactions = messages.filter(m => m.role === 'user').length;

  return (
    <aside className="w-[260px] bg-[#0f0f11] text-zinc-300 hidden md:flex flex-col h-full relative z-20">
      <div className="p-6 flex items-center gap-3">
        <img src="/logo.png" className="w-9 h-9 object-contain drop-shadow-md" alt="DiagramPilot Logo" />
        <div className="flex flex-col justify-center">
          <h1 className="font-brand font-bold text-white text-lg tracking-tight leading-none mb-1">DiagramPilot AI</h1>
          <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-medium">Architecture Assistant</p>
        </div>
      </div>
      <div className="flex-1 px-4 overflow-y-auto">
        <button 
          onClick={clearHistory}
          className="w-full bg-white text-black hover:bg-zinc-200 hover:scale-[1.02] active:scale-[0.98] rounded-full py-2.5 px-4 transition-all mb-8 flex items-center justify-center gap-2 text-sm font-semibold shadow-md"
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
            <div className="text-sm text-zinc-400 p-3 bg-zinc-900/40 rounded-xl border border-zinc-800/30">
              {interactions} interaction{interactions > 1 ? 's' : ''} in current session.
            </div>
            <p className="text-xs text-zinc-600 mt-3 px-1">
              History is limited to the last 10 interactions to optimize token usage.
            </p>
          </div>
        )}
      </div>

    </aside>
  );
}
