"use client";

import React from "react";
import { Plus, Settings, Trash2, History, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useChatStore } from "@/store/chatStore";
import { useShallow } from 'zustand/react/shallow';

interface SidebarProps {
  onNavigate?: () => void;
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const { 
    isSidebarOpen, 
    toggleSidebar, 
    projects, 
    currentProjectId,
    createNewProject,
    switchProject,
    deleteProject,
    setSettingsOpen
  } = useChatStore(useShallow(state => ({
    isSidebarOpen: state.isSidebarOpen,
    toggleSidebar: state.toggleSidebar,
    projects: state.projects,
    currentProjectId: state.currentProjectId,
    createNewProject: state.createNewProject,
    switchProject: state.switchProject,
    deleteProject: state.deleteProject,
    setSettingsOpen: state.setSettingsOpen
  })));

  const handleProjectClick = (id: string) => {
    switchProject(id);
    if (onNavigate) onNavigate();
  };

  const handleNewProject = () => {
    createNewProject();
    if (onNavigate) onNavigate();
  };

  const handleSettingsClick = () => {
    setSettingsOpen(true);
    if (onNavigate) onNavigate();
  };

  return (
    <>
      <aside
        className={`flex flex-col h-full bg-zinc-950 md:bg-zinc-950/50 backdrop-blur-2xl text-zinc-300 md:border-r border-white/5 transition-all duration-300 ease-in-out relative z-50 select-none shrink-0 w-full ${
          isSidebarOpen ? "md:w-[260px]" : "md:w-[68px]"
        }`}
      >
      {/* Header */}
      <div className="h-16 px-4 flex items-center justify-between flex-shrink-0 border-b border-transparent md:border-white/5">
        <div className="flex items-center gap-3 overflow-hidden">
          <button
            onClick={toggleSidebar}
            className="w-9 h-9 flex-shrink-0 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-md transition-all duration-200 focus:outline-none md:flex hidden"
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
        <button
          onClick={handleNewProject}
          title="New Project"
          className={`w-full flex items-center gap-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 hover:text-white transition-all duration-200 shadow-sm border border-white/5 group ${
            isSidebarOpen ? "justify-center px-4 py-2.5" : "h-10 justify-center md:px-0 md:py-0 px-4 py-2.5"
          }`}
        >
          <Plus className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
          <span className={`text-[13px] font-medium ${isSidebarOpen ? "inline" : "inline md:hidden"}`}>New Project</span>
        </button>
      </div>

      {/* History List */}
      <div className={`flex-1 px-3 py-1 overflow-y-auto space-y-1 transition-opacity duration-200 ${isSidebarOpen ? 'block' : 'block md:hidden'}`}>
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
                onClick={() => handleProjectClick(project.id)}
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

      {/* Footer / Settings */}
      <div className="p-3 border-t border-white/5 mt-auto">
        <button
          onClick={() => setSettingsOpen(true)}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all duration-200 group relative overflow-hidden text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0">
              <Settings className="w-[18px] h-[18px] text-zinc-400 group-hover:text-zinc-200 transition-colors" />
            </div>
            <span className={`font-medium text-[13px] truncate tracking-wide ${isSidebarOpen ? "inline" : "inline md:hidden"}`}>
              Settings
            </span>
          </div>
        </button>
      </div>
    </aside>
    </>
  );
}
