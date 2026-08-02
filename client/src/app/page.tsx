"use client";

import Sidebar from "@/components/Sidebar";
import ChatPanel from "@/components/ChatPanel";
import DiagramCanvas from "@/components/DiagramCanvas";

export default function Home() {
  return (
    <main className="flex h-screen w-full bg-[#0A0A0A] overflow-hidden text-zinc-200">
      <Sidebar />
      <ChatPanel />
      <DiagramCanvas />
    </main>
  );
}

