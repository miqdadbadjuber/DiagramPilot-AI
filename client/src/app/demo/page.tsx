"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import ChatPanel from "@/components/ChatPanel";
import SettingsPanel from "@/components/SettingsPanel";
import DiagramCanvas from "@/components/DiagramCanvas";
import { useChatStore } from "@/store/chatStore";
import { MessageSquare, LayoutTemplate, Menu } from "lucide-react";

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'diagram' | 'menu'>('chat');
  const { isSettingsOpen } = useChatStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <main className="flex h-screen w-full bg-[#0A0A0A] overflow-hidden text-zinc-200" />;
  }

  return (
    <main className="flex h-screen w-full bg-[#0A0A0A] overflow-hidden text-zinc-200 relative">
      
      {/* Sidebar - Desktop & Mobile Menu */}
      <div className={`h-full w-full md:w-auto md:static absolute inset-0 z-30 bg-zinc-950 md:bg-transparent pb-[calc(68px_+_env(safe-area-inset-bottom))] md:pb-0 ${activeTab === 'menu' ? 'flex' : 'hidden md:flex'}`}>
        <Sidebar onNavigate={() => setActiveTab('chat')} />
      </div>

      {isSettingsOpen && <SettingsPanel />}
      
      <div className="flex flex-1 overflow-hidden relative md:flex-row pb-[calc(68px_+_env(safe-area-inset-bottom))] md:pb-0">
        {/* ChatPanel - Desktop & Mobile Chat */}
        <div className={`h-full w-full md:w-auto ${activeTab === 'chat' ? 'flex' : 'hidden md:flex'}`}>
          <ChatPanel />
        </div>

        {/* DiagramCanvas - Desktop & Mobile Diagram */}
        <div className={`h-full w-full flex-1 ${activeTab === 'diagram' ? 'flex' : 'hidden md:flex'}`}>
          <DiagramCanvas />
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden absolute bottom-0 left-0 right-0 h-[68px] pb-[env(safe-area-inset-bottom)] bg-[#090909]/95 backdrop-blur-2xl border-t border-white/10 flex items-center justify-around z-50 px-2">
        <button 
          onClick={() => setActiveTab('menu')} 
          className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${activeTab === 'menu' ? 'text-white' : 'text-zinc-500 hover:text-zinc-400'}`}
        >
          <Menu className={`w-5 h-5 transition-transform ${activeTab === 'menu' ? 'scale-110' : ''}`} />
          <span className="text-[10px] font-medium tracking-wide">History</span>
        </button>
        <button 
          onClick={() => setActiveTab('chat')} 
          className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${activeTab === 'chat' ? 'text-white' : 'text-zinc-500 hover:text-zinc-400'}`}
        >
          <MessageSquare className={`w-5 h-5 transition-transform ${activeTab === 'chat' ? 'scale-110' : ''}`} />
          <span className="text-[10px] font-medium tracking-wide">Chat</span>
        </button>
        <button 
          onClick={() => setActiveTab('diagram')} 
          className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${activeTab === 'diagram' ? 'text-white' : 'text-zinc-500 hover:text-zinc-400'}`}
        >
          <LayoutTemplate className={`w-5 h-5 transition-transform ${activeTab === 'diagram' ? 'scale-110' : ''}`} />
          <span className="text-[10px] font-medium tracking-wide">Preview</span>
        </button>
      </div>
    </main>
  );
}
