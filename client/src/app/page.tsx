import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Pencil,
  Cpu,
  MessageSquare,
  Download,
  Check,
  X,
} from "lucide-react";

const GithubIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-6.5a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 5 3 6.2 6 6.5a4.8 4.8 0 0 0-1 3.2v4" />
  </svg>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#090909] text-zinc-300 font-sans overflow-x-hidden selection:bg-zinc-800 selection:text-white relative">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/20 via-transparent to-transparent pointer-events-none" />

      {/* NAVBAR */}
      <nav className="absolute top-0 left-0 right-0 z-50 bg-transparent">
        <div className="max-w-[1400px] mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo_diagrampilot.png" alt="DiagramPilot AI" className="w-5 h-5 object-contain" />
            <span className="font-semibold text-white tracking-tight">DiagramPilot AI</span>
          </div>

          <div className="flex items-center gap-6 text-sm font-medium">
            <Link
              href="https://github.com/miqdadbadjuber/DiagramPilot-AI"
              target="_blank"
              className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <GithubIcon className="w-5 h-5" />
              <span className="hidden sm:inline">GitHub</span>
            </Link>
            <Link
              href="/demo"
              className="bg-white text-black px-4 py-2 rounded-md font-semibold hover:bg-zinc-200 transition-colors shadow-sm"
            >
              Try Demo
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 relative z-10">
        {/* HERO */}
        <section className="max-w-[1400px] mx-auto px-6 mb-32 flex flex-col lg:flex-row items-center justify-between gap-12 pt-10">
          <div className="flex-1 space-y-8 w-full max-w-xl shrink-0 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-semibold text-zinc-300 uppercase tracking-wider shadow-xl backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-zinc-500 animate-pulse"></span>
              <span>Open Source Architecture Assistant</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.05]">
              Design software <br className="hidden md:block" /> architecture <br className="hidden md:block" /> with AI.
            </h1>

            <p className="text-lg text-zinc-400 max-w-lg leading-relaxed font-light">
              Translate complex system requirements into precise, interactive Mermaid.js blueprints instantly using natural language.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 w-full">
              <Link
                href="/demo"
                className="w-full sm:w-auto bg-white text-black px-7 py-4 rounded-xl font-semibold hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 group shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)]"
              >
                Start Designing Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* HERO IMAGE - Reduced in size to prevent layout breaks */}
          <div className="flex-1 w-full max-w-2xl relative z-0 mt-8 lg:mt-0 perspective-1000">
            <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-[#0a0a0a] ring-1 ring-white/5 group">
              <div className="absolute inset-0 bg-gradient-to-t from-[#090909] via-transparent to-transparent opacity-50 z-10 pointer-events-none" />
              <img 
                src="/hero_section.png" 
                alt="DiagramPilot AI Application Interface" 
                className="w-full h-auto object-cover transform transition-transform duration-700 ease-out group-hover:scale-[1.02]"
              />
            </div>
          </div>
        </section>

        {/* HOW IT WORKS - Creative Bento Grid */}
        <section id="workflow" className="max-w-[1200px] mx-auto px-6 mb-40 pt-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">The Workflow</h2>
            <p className="text-xl text-zinc-400 font-light max-w-2xl mx-auto">An asymmetrical layout for a non-linear process.</p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-fr">
            
            {/* Box 1: Prompt - Spans 2 columns */}
            <div className="md:col-span-2 bg-[#0c0c0c] border border-white/5 rounded-3xl p-8 lg:p-12 relative overflow-hidden group hover:border-zinc-700 transition-colors flex flex-col justify-end min-h-[300px]">
              <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-800/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 group-hover:bg-zinc-700/20 transition-colors" />
              <div className="absolute top-6 right-8 text-6xl font-bold text-white/5 select-none font-mono">01</div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center mb-6 shadow-inner">
                  <Pencil className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-3xl font-semibold text-white mb-3 tracking-tight">Prompt your ideas</h3>
                <p className="text-zinc-400 leading-relaxed font-light max-w-md text-lg">
                  Start with a blank canvas and type exactly what you want. Describe databases, services, relationships, and data flows in plain English.
                </p>
              </div>
            </div>

            {/* Box 2: Compilation - 1 column */}
            <div className="md:col-span-1 bg-gradient-to-b from-[#111111] to-[#0c0c0c] border border-white/5 rounded-3xl p-8 lg:p-12 relative overflow-hidden group hover:border-zinc-700 transition-colors flex flex-col justify-end min-h-[300px]">
               {/* Decorative grid pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:12px_12px]" />
              <div className="absolute top-6 right-8 text-6xl font-bold text-white/5 select-none font-mono">02</div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center mb-6 shadow-inner">
                  <Cpu className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3 tracking-tight">Instant compile</h3>
                <p className="text-zinc-400 font-light text-base">
                  The AI engine intercepts your prompt and builds a syntactically correct architecture schema within milliseconds.
                </p>
              </div>
            </div>

            {/* Box 3: Refinement - 1 column */}
            <div className="md:col-span-1 bg-[#0c0c0c] border border-white/5 rounded-3xl p-8 lg:p-12 relative overflow-hidden group hover:border-zinc-700 transition-colors flex flex-col justify-end min-h-[300px]">
              <div className="absolute top-6 right-8 text-6xl font-bold text-white/5 select-none font-mono">03</div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center mb-6 shadow-inner">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3 tracking-tight">Iterative refinement</h3>
                <p className="text-zinc-400 font-light text-base">
                  Need to add a Redis cache? Just ask. The AI understands context and seamlessly injects new nodes.
                </p>
              </div>
            </div>

            {/* Box 4: Export - Spans 2 columns */}
            <div className="md:col-span-2 bg-[#0c0c0c] border border-white/5 rounded-3xl p-8 lg:p-12 relative overflow-hidden group hover:border-zinc-700 transition-colors flex flex-col justify-end min-h-[300px]">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-800/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 translate-x-[-100%] group-hover:translate-x-[100%]" />
              <div className="absolute top-6 right-8 text-6xl font-bold text-white/5 select-none font-mono">04</div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center mb-6 shadow-inner">
                  <Download className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-3xl font-semibold text-white mb-3 tracking-tight">Export & integrate</h3>
                <p className="text-zinc-400 leading-relaxed font-light max-w-md text-lg">
                  When it's perfect, export directly to SVG or copy the raw Mermaid code to paste directly into your GitHub README or Notion docs.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* WHY DIAGRAMPILOT AI */}
        <section className="max-w-[1000px] mx-auto px-6 mb-40 text-center relative z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/40 via-transparent to-transparent pointer-events-none -z-10 blur-3xl" />
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-16 tracking-tight">Why DiagramPilot AI?</h2>
          
          <div className="rounded-3xl border border-white/10 overflow-hidden bg-[#0c0c0c] text-left shadow-2xl backdrop-blur-sm">
            <div className="grid grid-cols-2 border-b border-white/5 bg-[#090909]">
              <div className="p-4 md:p-8 border-r border-white/5">
                <span className="font-semibold text-white text-base md:text-lg">DiagramPilot AI</span>
              </div>
              <div className="p-4 md:p-8">
                <span className="font-medium text-zinc-500 text-base md:text-lg">Manual Diagramming</span>
              </div>
            </div>
            {[
              ["Speed to first draft", "Under 5 seconds", "10 - 30 minutes"],
              ["Syntax learning curve", "Zero (Natural Language)", "Steep (DSL)"],
              ["Refactoring effort", "One chat message", "Tedious manual wiring"],
              ["Output consistency", "Strict (Mermaid code)", "Varies by user"],
              ["Version tracking", "Automatic history", "Manual file saving"],
            ].map((row, idx) => (
              <div key={idx} className="grid grid-cols-2 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                <div className="p-4 md:p-6 border-r border-white/5 flex flex-col justify-center">
                  <span className="text-[10px] md:text-xs text-zinc-500 mb-1.5 md:mb-2 uppercase tracking-wider">{row[0]}</span>
                  <span className="text-sm md:text-base text-white font-medium flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                    <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 md:w-3.5 md:h-3.5 text-green-500" />
                    </div>
                    {row[1]}
                  </span>
                </div>
                <div className="p-4 md:p-6 flex flex-col justify-center bg-[#090909]/30">
                  <span className="text-[10px] md:text-xs text-zinc-600 mb-1.5 md:mb-2 uppercase tracking-wider">{row[0]}</span>
                  <span className="text-sm md:text-base text-zinc-500 flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                    <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-zinc-800/50 flex items-center justify-center shrink-0">
                      <X className="w-3 h-3 md:w-3.5 md:h-3.5 text-zinc-600" />
                    </div>
                    {row[2]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* BUILT IN THE OPEN (CREATIVE) */}
        <section id="opensource" className="max-w-[1200px] mx-auto px-6 mb-16">
          <div className="relative rounded-3xl overflow-hidden border border-zinc-800 bg-[#050505] shadow-[0_20px_60px_-15px_rgba(0,0,0,1)]">
            {/* Decorative background grid and gradient */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-zinc-800/40 via-transparent to-transparent pointer-events-none" />
            
            <div className="relative z-10 px-8 py-24 md:py-32 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-8 shadow-inner">
                <GithubIcon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6 max-w-3xl">
                Open source. <br className="md:hidden" /> Community driven.
              </h2>
              <p className="text-xl text-zinc-400 mb-12 font-light max-w-2xl leading-relaxed">
                DiagramPilot AI is completely open source under the MIT License. No vendor lock-in. Host it yourself, audit the code, or contribute to the next generation of architectural tooling.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                <Link
                  href="https://github.com/miqdadbadjuber/DiagramPilot-AI"
                  target="_blank"
                  className="w-full sm:w-auto bg-white text-black px-8 py-4 rounded-xl font-semibold hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
                >
                  <GithubIcon className="w-5 h-5" />
                  View the Source Code
                </Link>
                <Link
                  href="https://github.com/miqdadbadjuber/DiagramPilot-AI#readme"
                  target="_blank"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold border border-zinc-700 bg-[#0f0f0f] text-white hover:bg-zinc-800 transition-all flex items-center justify-center"
                >
                  Read Documentation
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER - Bare Minimum */}
      <footer className="border-t border-white/5 bg-[#090909]">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between text-xs text-zinc-500 font-medium tracking-wide uppercase">
          <Link href="https://github.com/miqdadbadjuber/DiagramPilot-AI#readme" target="_blank" className="hover:text-white transition-colors">Documentation</Link>
          <span>&copy; 2026 MIT License</span>
        </div>
      </footer>
    </div>
  );
}
