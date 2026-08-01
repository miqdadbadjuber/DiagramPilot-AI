import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Message {
  role: 'user' | 'model';
  content: string;
  mermaidCode?: string;
}

interface ChatState {
  messages: Message[];
  currentMermaidCode: string;
  isGenerating: boolean;
  abortController: AbortController | null;
  addMessage: (msg: Message) => void;
  setMermaidCode: (code: string) => void;
  setGenerating: (status: boolean) => void;
  setAbortController: (controller: AbortController | null) => void;
  clearHistory: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      currentMermaidCode: '',
      isGenerating: false,
      abortController: null,
      
      addMessage: (msg) => set((state) => {
        // Only keep the last 10 messages (5 pairs of interactions)
        const newMessages = [...state.messages, msg];
        if (newMessages.length > 20) {
          return { messages: newMessages.slice(newMessages.length - 20) };
        }
        return { messages: newMessages };
      }),
      
      setMermaidCode: (code) => set({ currentMermaidCode: code }),
      setGenerating: (status) => set({ isGenerating: status }),
      setAbortController: (controller) => set({ abortController: controller }),
      clearHistory: () => set({ messages: [], currentMermaidCode: '' }),
    }),
    {
      name: 'diagrampilot-chat-storage',
      // DO NOT persist ephemeral state like 'isGenerating' or 'abortController'
      partialize: (state) => ({ 
        messages: state.messages,
        currentMermaidCode: state.currentMermaidCode 
      }),
    }
  )
);
