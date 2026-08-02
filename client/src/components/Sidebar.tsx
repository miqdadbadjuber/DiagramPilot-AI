"use client";

import React from "react";
import { useChatStore } from "@/store/chatStore";
import {
  PanelLeftClose,
  PanelLeftOpen,
  MessageSquare,
  Plus,
  Trash2,
  Settings,
  X,
  Palette,
  UserCircle,
  Key,
  Globe,
  Battery,
  Info,
} from "lucide-react";

export default function Sidebar() {
  const {
    projects,
    currentProjectId,
    createNewProject,
    switchProject,
    deleteProject,
    toggleSidebar,
    isSidebarOpen,
  } = useChatStore();

  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = React.useState("language");
  const [quotaInfo, setQuotaInfo] = React.useState({ remaining: 5, limit: 5, percentage: 100 });

  React.useEffect(() => {
    if (isSettingsOpen && activeSettingsTab === 'quota') {
      fetch('/api/quota')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.quota) {
            setQuotaInfo(data.quota);
          }
        })
        .catch(() => {});
    }
  }, [isSettingsOpen, activeSettingsTab]);

  return (
    <aside
      className={`flex flex-col h-full bg-zinc-950/50 backdrop-blur-2xl text-zinc-300 border-r border-white/5 transition-all duration-300 ease-in-out relative z-20 select-none shrink-0 ${
        isSidebarOpen ? "w-[260px]" : "w-[68px]"
      }`}
    >
      {/* Header */}
      <div className="h-16 px-4 flex items-center justify-between flex-shrink-0 border-b border-transparent">
        <div className="flex items-center gap-3 overflow-hidden">
          <button
            onClick={toggleSidebar}
            className="w-9 h-9 flex-shrink-0 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-md transition-all duration-200 focus:outline-none"
            title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="w-[18px] h-[18px]" />
            ) : (
              <PanelLeftOpen className="w-[18px] h-[18px]" />
            )}
          </button>

          {isSidebarOpen && (
            <div className="flex items-center gap-3 overflow-hidden transition-opacity duration-200">
              <img
                src="/logo_diagrampilot.png"
                alt="DiagramPilot Logo"
                className="w-[22px] h-[22px] object-contain flex-shrink-0"
              />
              <span className="font-medium text-[15px] text-zinc-100 tracking-tight whitespace-nowrap">
                DiagramPilot
              </span>
            </div>
          )}
        </div>
      </div>

      {/* New Project Button */}
      <div className="p-4 flex-shrink-0">
        {isSidebarOpen ? (
          <button
            onClick={createNewProject}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 hover:text-white transition-all duration-200 text-[13px] font-medium shadow-sm border border-white/5 group"
          >
            <Plus className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
            <span>New Project</span>
          </button>
        ) : (
          <button
            onClick={createNewProject}
            title="New Project"
            className="w-full h-10 flex items-center justify-center rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 hover:text-white transition-all duration-200 shadow-sm border border-white/5 group"
          >
            <Plus className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
          </button>
        )}
      </div>

      {/* History List */}
      {isSidebarOpen && (
        <div className="flex-1 px-3 py-1 overflow-y-auto space-y-1 transition-opacity duration-200">
          <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest px-2.5 py-1 mb-1">
            Recent Layouts
          </p>

          {projects.length === 0 ? (
            <div className="px-2.5 py-4 text-xs text-zinc-600 font-medium whitespace-nowrap">
              No projects yet.
            </div>
          ) : (
            projects.map((project) => {
              const isActive = currentProjectId === project.id;
              return (
                <button
                  key={project.id}
                  onClick={() => switchProject(project.id)}
                  className={`w-full flex flex-col gap-1 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group relative overflow-hidden ${
                    isActive
                      ? "bg-white/[0.08] text-white shadow-sm ring-1 ring-white/10"
                      : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-medium text-[13px] truncate tracking-wide">
                        {project.title || "Untitled Diagram"}
                      </span>
                    </div>
                    
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteProject(project.id);
                      }}
                      className={`p-1.5 rounded-md hover:bg-red-500/20 hover:text-red-400 transition-colors ${
                        isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      }`}
                      title="Delete project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
      {/* Footer / Settings */}
      <div className="p-3 border-t border-white/5 mt-auto">
        <button
          onClick={() => setIsSettingsOpen(true)}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all duration-200 group relative overflow-hidden text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0">
              <Settings className="w-[18px] h-[18px] text-zinc-400 group-hover:text-zinc-200 transition-colors" />
            </div>
            {isSidebarOpen && (
              <span className="font-medium text-[13px] truncate tracking-wide">
                Settings
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Premium Settings Popover (Floating next to button) */}
      {isSettingsOpen && (
        <>
          {/* Invisible overlay to close when clicking outside */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsSettingsOpen(false)}
          />
          
          <div 
            className={`fixed z-50 bottom-4 ${isSidebarOpen ? 'left-[270px]' : 'left-[85px]'} w-[380px] max-h-[85vh] bg-zinc-950/95 backdrop-blur-3xl border border-white/10 shadow-2xl rounded-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200`}
          >
            {/* Header & Tabs */}
            <div className="flex items-center gap-1 p-2 bg-white/[0.02] border-b border-white/5">
              <button 
                onClick={() => setActiveSettingsTab('language')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${activeSettingsTab === 'language' ? 'bg-white/10 text-white font-medium shadow-sm' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'}`}
              >
                <Globe className="w-3.5 h-3.5" /> Bahasa
              </button>
              <button 
                onClick={() => setActiveSettingsTab('quota')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${activeSettingsTab === 'quota' ? 'bg-white/10 text-white font-medium shadow-sm' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'}`}
              >
                <Battery className="w-3.5 h-3.5" /> Kuota
              </button>
              <button 
                onClick={() => setActiveSettingsTab('about')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${activeSettingsTab === 'about' ? 'bg-white/10 text-white font-medium shadow-sm' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'}`}
              >
                <Info className="w-3.5 h-3.5" /> Tentang
              </button>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="p-2 ml-1 text-zinc-500 hover:text-white rounded-lg hover:bg-white/10 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Content Area */}
            <div className="p-5 overflow-y-auto">
              {activeSettingsTab === 'language' && (
                <div className="animate-in fade-in duration-300">
                  <h2 className="text-base font-medium text-white mb-4">Pilihan Bahasa</h2>
                  <div className="space-y-3">
                    <button className="w-full flex items-center justify-between p-3.5 rounded-xl border border-emerald-500/50 bg-emerald-500/10 text-left transition-all">
                      <div>
                        <p className="text-sm font-medium text-emerald-400">Bahasa Indonesia</p>
                        <p className="text-xs text-zinc-400 mt-0.5">Bahasa utama aplikasi</p>
                      </div>
                      <div className="w-4 h-4 rounded-full border-[4px] border-emerald-500 bg-zinc-950" />
                    </button>
                    
                    <button className="w-full flex items-center justify-between p-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-left transition-all">
                      <div>
                        <p className="text-sm font-medium text-zinc-300">English</p>
                        <p className="text-xs text-zinc-500 mt-0.5">International language</p>
                      </div>
                      <div className="w-4 h-4 rounded-full border-2 border-zinc-600" />
                    </button>
                  </div>
                </div>
              )}

              {activeSettingsTab === 'quota' && (
                <div className="animate-in fade-in duration-300">
                  <h2 className="text-base font-medium text-white mb-4">Kuota Pembuatan Diagram</h2>
                  
                  <div className="p-4 rounded-xl border border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-950 shadow-inner relative overflow-hidden">
                    <div className="flex justify-between items-end mb-3">
                      <div>
                        <p className="text-xs text-zinc-400 mb-1">Sisa Kuota Anda</p>
                        <p className="text-2xl font-bold text-white tracking-tight">{Math.round(quotaInfo.percentage)}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-zinc-500">{quotaInfo.remaining}/{quotaInfo.limit} Diagram</p>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden mb-3 border border-zinc-700/50">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500" 
                        style={{ width: `${quotaInfo.percentage}%` }}
                      />
                    </div>
                    
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Satu kali pembuatan diagram akan mengurangi kuota sebesar <span className="text-zinc-200 font-medium">20%</span>. Chatting biasa gratis tanpa memotong kuota.
                    </p>
                  </div>
                </div>
              )}

              {activeSettingsTab === 'about' && (
                <div className="animate-in fade-in duration-300">
                  <h2 className="text-base font-medium text-white mb-4">Tentang Aplikasi</h2>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                        <Info className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-zinc-100">DiagramPilot AI</h3>
                        <p className="text-xs text-emerald-400">Versi 1.0.0 (Beta)</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div className="p-2.5 rounded-lg border border-white/5 bg-white/[0.02]">
                        <p className="text-[10px] text-zinc-500 mb-0.5 uppercase tracking-wider font-semibold">Dibuat Pada</p>
                        <p className="text-xs text-zinc-300 font-medium">2 Agustus 2026</p>
                      </div>
                      <div className="p-2.5 rounded-lg border border-white/5 bg-white/[0.02]">
                        <p className="text-[10px] text-zinc-500 mb-0.5 uppercase tracking-wider font-semibold">Pembaruan</p>
                        <p className="text-xs text-zinc-300 font-medium">2 Agustus 2026</p>
                      </div>
                      <div className="col-span-2 p-2.5 rounded-lg border border-white/5 bg-white/[0.02]">
                        <p className="text-[10px] text-zinc-500 mb-0.5 uppercase tracking-wider font-semibold">Developer</p>
                        <p className="text-xs text-zinc-300 font-medium">Miqdad (Haktiv8 Proyek)</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </aside>
  );
}
