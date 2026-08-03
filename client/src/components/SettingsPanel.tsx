"use client";

import React from "react";
import { useChatStore } from "@/store/chatStore";
import { X, Globe, Zap, Info } from "lucide-react";

export default function SettingsPanel() {
  const { isSettingsOpen, setSettingsOpen } = useChatStore();
  const [activeSettingsTab, setActiveSettingsTab] = React.useState("language");
  const [quotaInfo, setQuotaInfo] = React.useState({ remaining: 5, limit: 5, percentage: 100 });

  React.useEffect(() => {
    if (activeSettingsTab === 'quota') {
      fetch('/api/quota')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.quota) {
            setQuotaInfo(data.quota);
          }
        })
        .catch(() => {});
    }
  }, [activeSettingsTab]);

  if (!isSettingsOpen) return null;

  return (
    <div className="absolute inset-0 z-50 md:relative flex flex-col h-full w-full md:w-[400px] lg:w-[450px] shrink-0 bg-[#0A0A0A] text-zinc-200 overflow-hidden md:border-r border-zinc-800/80">
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800/80 bg-zinc-950/50">
        <h2 className="text-lg font-medium text-white px-2 tracking-tight">Pengaturan</h2>
        <button 
          onClick={() => setSettingsOpen(false)}
          className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          title="Tutup Pengaturan"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-2 bg-white/[0.02] border-b border-white/5">
        <button 
          onClick={() => setActiveSettingsTab('language')}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs transition-colors ${activeSettingsTab === 'language' ? 'bg-white/10 text-white font-medium shadow-sm' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'}`}
        >
          <Globe className="w-4 h-4" /> Bahasa
        </button>
        <button 
          onClick={() => setActiveSettingsTab('quota')}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs transition-colors ${activeSettingsTab === 'quota' ? 'bg-white/10 text-white font-medium shadow-sm' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'}`}
        >
          <Zap className="w-4 h-4" /> Kuota
        </button>
        <button 
          onClick={() => setActiveSettingsTab('about')}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs transition-colors ${activeSettingsTab === 'about' ? 'bg-white/10 text-white font-medium shadow-sm' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'}`}
        >
          <Info className="w-4 h-4" /> Tentang
        </button>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-zinc-950/20">
        {activeSettingsTab === 'language' && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-base font-medium text-white mb-6 px-1">Pilihan Bahasa</h2>
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 rounded-2xl border border-white/20 bg-white/5 text-left transition-all">
                <div>
                  <p className="text-[15px] font-medium text-white">Bahasa Indonesia</p>
                  <p className="text-[13px] text-zinc-400 mt-1">Bahasa utama aplikasi</p>
                </div>
                <div className="w-5 h-5 rounded-full border-[5px] border-zinc-200 bg-zinc-950" />
              </button>
              
              <button disabled className="w-full flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-transparent opacity-50 cursor-not-allowed text-left transition-all">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[15px] font-medium text-zinc-400">English</p>
                    <span className="text-[9px] font-bold tracking-wider uppercase bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded-sm">Coming Soon</span>
                  </div>
                  <p className="text-[13px] text-zinc-500 mt-1">International language</p>
                </div>
                <div className="w-5 h-5 rounded-full border-[2px] border-zinc-700" />
              </button>
            </div>
          </div>
        )}

        {activeSettingsTab === 'quota' && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-base font-medium text-white mb-6 px-1">Kuota Pembuatan Diagram</h2>
            
            <div className="p-6 rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-950 shadow-inner relative overflow-hidden">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <p className="text-[13px] text-zinc-400 mb-1.5">Sisa Kuota Anda</p>
                  <p className="text-4xl font-bold text-white tracking-tight">{Math.round(quotaInfo.percentage)}%</p>
                </div>
                <div className="text-right pb-1">
                  <p className="text-sm font-medium text-zinc-500">{quotaInfo.remaining}/{quotaInfo.limit} Diagram</p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="h-3 w-full bg-zinc-900 rounded-full overflow-hidden mb-6 border border-zinc-800/80 shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-zinc-400 to-white rounded-full transition-all duration-500" 
                  style={{ width: `${quotaInfo.percentage}%` }}
                />
              </div>
              
              <p className="text-[14px] text-zinc-400 leading-relaxed bg-zinc-950/50 p-4 rounded-xl border border-white/5">
                Satu kali pembuatan diagram memakan kuota <span className="text-zinc-200 font-medium">20%</span>. 
                <br/><br/>
                💬 Chatting biasa dengan AI adalah gratis dan tidak memotong kuota.
              </p>
            </div>
          </div>
        )}

        {activeSettingsTab === 'about' && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-base font-medium text-white mb-6 px-1">Tentang Aplikasi</h2>
            
            <div className="p-1 rounded-3xl border border-white/5 bg-white/[0.02] shadow-sm">
              <div className="flex items-center gap-4 p-5 pb-4">
                <div className="w-16 h-16 flex items-center justify-center shrink-0">
                  <img src="/logo_diagrampilot.png" alt="Logo" className="w-full h-full object-contain opacity-90" />
                </div>
                <div>
                  <h3 className="text-[16px] font-semibold text-white tracking-tight">DiagramPilot</h3>
                  <p className="text-[13px] text-zinc-400 mt-0.5">Versi 1.0.0 (Beta)</p>
                </div>
              </div>
              
              <div className="px-5 pb-5">
                <ul className="flex flex-col gap-3 mt-4 text-[14px]">
                  <li className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-zinc-500 font-medium">Dibuat Pada</span>
                    <span className="text-zinc-200">2 Agustus 2026</span>
                  </li>
                  <li className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-zinc-500 font-medium">Terakhir Update</span>
                    <span className="text-zinc-200">2 Agustus 2026</span>
                  </li>
                  <li className="flex justify-between items-center py-2">
                    <span className="text-zinc-500 font-medium">Developer</span>
                    <span className="text-zinc-200 font-medium">Miqdad Badjuber</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Large Close Button at Bottom (Extra affordance) */}
      <div className="p-4 bg-zinc-950/80 border-t border-white/5">
        <button 
          onClick={() => setSettingsOpen(false)}
          className="w-full py-3.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl text-sm font-medium transition-colors border border-zinc-800"
        >
          Tutup Pengaturan
        </button>
      </div>

    </div>
  );
}
