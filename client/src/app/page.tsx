"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import ChatPanel from "@/components/ChatPanel";
import SettingsPanel from "@/components/SettingsPanel";
import DiagramCanvas from "@/components/DiagramCanvas";
import { useChatStore } from "@/store/chatStore";

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const { isSettingsOpen } = useChatStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <main className="flex h-screen w-full bg-[#0A0A0A] overflow-hidden text-zinc-200" />;
  }

  return (
    <main className="flex h-screen w-full bg-[#0A0A0A] overflow-hidden text-zinc-200">
      <Sidebar />
      {isSettingsOpen ? <SettingsPanel /> : <ChatPanel />}
      <DiagramCanvas />
    </main>
  );
}

