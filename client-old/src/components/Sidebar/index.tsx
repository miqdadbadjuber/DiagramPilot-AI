import { useChatStore } from '../../store/chatStore';
import { Trash2, MessageSquare, Plus, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

export default function Sidebar() {
  const { projects, currentProjectId, createNewProject, switchProject, deleteProject, toggleSidebar, isSidebarOpen } = useChatStore();

  return (
    <aside className="w-[260px] bg-zinc-950 text-zinc-300 hidden md:flex flex-col h-full relative z-20">
      
      {/* Header - Fixed height */}
      <div className="h-[73px] px-3 flex items-center gap-2 flex-shrink-0">
        <button 
          onClick={toggleSidebar}
          className="w-10 h-10 flex-shrink-0 flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50 rounded-xl transition-all duration-200"
          title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
        >
          {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
        </button>
        
        {/* Fade wrapper for Logo & App Name */}
        <div className={`flex items-center gap-2 overflow-hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <img src="/logo_diagrampilot.png" className="w-7 h-7 object-contain drop-shadow-md flex-shrink-0" alt="DiagramPilot Logo" />
          <h1 className="font-brand font-semibold text-zinc-100 text-[15px] tracking-tight leading-none whitespace-nowrap">DiagramPilot</h1>
        </div>
      </div>

      {/* New Project Button */}
      <div className={`px-4 pb-5 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <button 
          onClick={createNewProject}
          className="w-full bg-zinc-900/50 hover:bg-zinc-800 text-zinc-200 active:scale-[0.98] rounded-xl py-2.5 px-4 transition-all duration-200 flex items-center justify-between text-[13px] font-medium shadow-sm border border-zinc-800 hover:border-zinc-700/80 group"
        >
          <span className="whitespace-nowrap">New Project</span>
          <Plus className="w-4 h-4 flex-shrink-0 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
        </button>
      </div>

      {/* History List */}
      <div className={`flex-1 px-3 overflow-y-auto space-y-1 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <p className="text-[11px] font-semibold text-zinc-500/80 uppercase tracking-widest px-3 py-2 mb-1">
          Recent Layouts
        </p>
        
        {projects.length === 0 ? (
          <div className="px-3 py-4 text-sm text-zinc-600 font-medium whitespace-nowrap">
            No projects yet.
          </div>
        ) : (
          projects.map(project => (
            <div 
              key={project.id}
              onClick={() => switchProject(project.id)}
              className={`group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
                currentProjectId === project.id 
                  ? 'bg-zinc-800/50 text-zinc-100 shadow-sm border border-zinc-700/50 relative' 
                  : 'hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-transparent'
              }`}
            >
              {currentProjectId === project.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-zinc-400 rounded-r-full" />
              )}
              <div className="flex items-center gap-3 overflow-hidden ml-1">
                <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${currentProjectId === project.id ? 'text-zinc-300' : 'text-zinc-500 group-hover:text-zinc-400'}`} />
                <span className="text-[13px] font-medium truncate">{project.title}</span>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  deleteProject(project.id);
                }}
                className={`text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors p-1.5 rounded-md opacity-0 group-hover:opacity-100 ${
                  currentProjectId === project.id ? 'opacity-100' : ''
                }`}
                title="Delete Project"
              >
                <Trash2 className="w-3.5 h-3.5 shrink-0" />
              </button>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
