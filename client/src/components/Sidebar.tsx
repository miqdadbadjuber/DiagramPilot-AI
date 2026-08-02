"use client";

import React from "react";
import { useChatStore } from "@/store/chatStore";
import {
  PanelLeftClose,
  PanelLeftOpen,
  MessageSquare,
  Plus,
  Trash2,
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

  return (
    <aside
      className={`flex flex-col h-full bg-[#0A0A0A] text-zinc-300 border-r border-zinc-800/50 transition-all duration-300 ease-in-out relative z-20 select-none shrink-0 ${
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
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 hover:text-black transition-all duration-200 text-[13px] font-medium shadow-sm group"
          >
            <Plus className="w-4 h-4 text-zinc-600 group-hover:text-black transition-colors" />
            <span>New Project</span>
          </button>
        ) : (
          <button
            onClick={createNewProject}
            title="New Project"
            className="w-full h-9 flex items-center justify-center rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 transition-all duration-200 shadow-sm group"
          >
            <Plus className="w-4 h-4 text-zinc-600 group-hover:text-black transition-colors" />
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
                <div
                  key={project.id}
                  onClick={() => switchProject(project.id)}
                  className={`group relative flex items-center justify-between px-2.5 py-2 rounded-md cursor-pointer transition-all duration-150 text-xs font-medium ${
                    isActive
                      ? "bg-zinc-900/90 text-zinc-100 border-l-2 border-white pl-2"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border-l-2 border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden min-w-0 flex-1 mr-1">
                    <MessageSquare
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isActive
                          ? "text-zinc-200"
                          : "text-zinc-500 group-hover:text-zinc-400"
                      }`}
                    />
                    <span className="truncate">{project.title || "Untitled Project"}</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteProject(project.id);
                    }}
                    className={`p-1 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors duration-150 ${
                      isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    }`}
                    title="Delete Project"
                  >
                    <Trash2 className="w-3.5 h-3.5 shrink-0" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}
    </aside>
  );
}
