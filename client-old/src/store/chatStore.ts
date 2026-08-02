import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
  role: 'user' | 'model';
  content: string;
  mermaidCode?: string;
}

export interface Project {
  id: string;
  title: string;
  messages: Message[];
  currentMermaidCode: string;
  updatedAt: number;
}

interface ChatState {
  projects: Project[];
  currentProjectId: string | null;
  isGenerating: boolean;
  isSidebarOpen: boolean;
  abortController: AbortController | null;
  
  // Actions
  addMessage: (msg: Message) => void;
  setMermaidCode: (code: string) => void;
  setGenerating: (status: boolean) => void;
  setAbortController: (controller: AbortController | null) => void;
  
  // Project Actions
  createNewProject: () => void;
  switchProject: (id: string) => void;
  deleteProject: (id: string) => void;
  toggleSidebar: () => void;
  
  // Getters
  getMessages: () => Message[];
  getCurrentMermaidCode: () => string;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProjectId: null,
      isGenerating: false,
      isSidebarOpen: true,
      abortController: null,
      
      addMessage: (msg) => set((state) => {
        let projectId = state.currentProjectId;
        let projects = [...state.projects];
        
        // If no active project, create one
        if (!projectId) {
          projectId = generateId();
          const title = msg.role === 'user' ? msg.content.substring(0, 30) + (msg.content.length > 30 ? '...' : '') : 'New Diagram';
          projects.unshift({
            id: projectId,
            title,
            messages: [],
            currentMermaidCode: '',
            updatedAt: Date.now()
          });
        }
        
        // Find and update the project
        const projectIndex = projects.findIndex(p => p.id === projectId);
        if (projectIndex >= 0) {
          const project = { ...projects[projectIndex] };
          
          // Generate title from first user message if it's default
          if (project.messages.length === 0 && msg.role === 'user') {
             project.title = msg.content.substring(0, 30) + (msg.content.length > 30 ? '...' : '');
          }
          
          let newMessages = [...project.messages, msg];
          // Keep last 20
          if (newMessages.length > 20) {
            newMessages = newMessages.slice(newMessages.length - 20);
          }
          
          project.messages = newMessages;
          project.updatedAt = Date.now();
          projects[projectIndex] = project;
          
          // Sort so newest updated is at top
          projects.sort((a, b) => b.updatedAt - a.updatedAt);
        }
        
        return { projects, currentProjectId: projectId };
      }),
      
      setMermaidCode: (code) => set((state) => {
        if (!state.currentProjectId) return state;
        const projects = [...state.projects];
        const index = projects.findIndex(p => p.id === state.currentProjectId);
        if (index >= 0) {
          projects[index] = { ...projects[index], currentMermaidCode: code, updatedAt: Date.now() };
        }
        return { projects };
      }),
      
      setGenerating: (status) => set({ isGenerating: status }),
      setAbortController: (controller) => set({ abortController: controller }),
      
      createNewProject: () => set({ currentProjectId: null }),
      
      switchProject: (id) => set((state) => {
        if (state.projects.some(p => p.id === id)) {
          return { currentProjectId: id };
        }
        return state;
      }),
      
      deleteProject: (id) => set((state) => {
        const projects = state.projects.filter(p => p.id !== id);
        return { 
          projects,
          currentProjectId: state.currentProjectId === id ? null : state.currentProjectId
        };
      }),
      
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      
      getMessages: () => {
        const state = get();
        if (!state.currentProjectId) return [];
        const project = state.projects.find(p => p.id === state.currentProjectId);
        return project ? project.messages : [];
      },
      
      getCurrentMermaidCode: () => {
        const state = get();
        if (!state.currentProjectId) return '';
        const project = state.projects.find(p => p.id === state.currentProjectId);
        return project ? project.currentMermaidCode : '';
      }
    }),
    {
      name: 'diagrampilot-chat-storage',
      partialize: (state) => ({ 
        projects: state.projects,
        currentProjectId: state.currentProjectId,
        isSidebarOpen: state.isSidebarOpen
      }),
    }
  )
);
