"use client";

import React, { useState, useRef, useEffect } from "react";
import { useChatStore } from "@/store/chatStore";
import { Send, StopCircle, User } from "lucide-react";
import { TypewriterMarkdown } from "./TypewriterMarkdown";

/**
 * Sanitizes Mermaid code from AI output.
 * Fixes: markdown wrappers, keyword casing, colon-labels, quoted link text,
 * parentheses in labels, semicolons, and single-line output.
 */
function sanitizeMermaid(raw: string): string {
  let code = raw.trim();

  // 1. Strip markdown code block wrappers
  if (code.startsWith("```mermaid")) {
    code = code.replace(/^```mermaid\n?/, "").replace(/\n?```$/, "");
  } else if (code.startsWith("```")) {
    code = code.replace(/^```\n?/, "").replace(/\n?```$/, "");
  }
  code = code.trim();

  // 2. Fix keyword casing
  code = code.replace(/\bSubGraph\b/gi, "subgraph");
  code = code.replace(/^(\s*)End\s*$/gm, "$1end");
  code = code.replace(/\bGraph\b(?=\s+(?:TD|LR|RL|BT))/g, "graph");
  code = code.replace(/\bFlowchart\b/gi, "flowchart");

  // 3. Single-line fix (before line-by-line processing)
  if (!code.includes("\n")) {
    code = code
      .replace(/\s+(subgraph\s)/g, "\n    $1")
      .replace(/\s+(end)\s/g, "\n    $1\n    ")
      .replace(/\s+(\w[\w_]*(?:\[.*?\]|\(.*?\)|{.*?}|>.*?\])?\s*--)/g, "\n    $1")
      .replace(/\s+(\w[\w_]*\[)/g, "\n    $1");
  }

  // 4. Line-by-line fixes
  const lines = code.split("\n");
  const fixedLines = lines.map((line) => {
    let l = line;

    // Remove trailing semicolons
    l = l.replace(/;\s*$/, "");

    // Fix parentheses inside [...] labels
    l = l.replace(/\[([^\]]*)\]/g, (_m, label: string) => {
      if (label.includes("(")) {
        const fixed = label.replace(/\(/g, "- ").replace(/\)/g, "");
        return `[${fixed.replace(/\s+/g, " ").trim()}]`;
      }
      return `[${label}]`;
    });

    // Fix colon-labels: "A --> B: label" → "A -->|label| B"
    const colonLabel = l.match(
      /^(\s*\w[\w_]*(?:\[.*?\]|\{.*?\}|\(.*?\))?)\s*(-->|---|-.->|==>)\s*(\w[\w_]*(?:\[.*?\]|\{.*?\}|\(.*?\))?):\s*(.+)$/
    );
    if (colonLabel) {
      const [, src, arrow, tgt, label] = colonLabel;
      const cleanLabel = label.replace(/[()]/g, "").trim();
      l = `${src} ${arrow}|${cleanLabel}| ${tgt}`;
    }

    // Fix: A -- "text" --> B: label → A -->|text| B
    const quotedWithColon = l.match(
      /^(\s*\w[\w_]*(?:\[.*?\]|\{.*?\}|\(.*?\))?)\s*--\s*"([^"]+)"\s*(-->|---|-.->|==>)\s*(\w[\w_]*(?:\[.*?\]|\{.*?\}|\(.*?\))?):\s*(.+)$/
    );
    if (quotedWithColon) {
      const [, src, linkText, arrow, tgt] = quotedWithColon;
      l = `${src} ${arrow}|${linkText}| ${tgt}`;
    }

    // Fix: A -- "text" --> B (no colon label, just quoted link text)
    const quotedLink = l.match(
      /^(\s*\w[\w_]*(?:\[.*?\]|\{.*?\}|\(.*?\))?)\s*--\s*"([^"]+)"\s*(-->|---|-.->|==>)\s*(\w[\w_]*(?:\[.*?\]|\{.*?\}|\(.*?\))?)$/
    );
    if (quotedLink) {
      const [, src, linkText, arrow, tgt] = quotedLink;
      l = `${src} ${arrow}|${linkText}| ${tgt}`;
    }

    return l;
  });

  return fixedLines.join("\n");
}

export default function ChatPanel() {
  const {
    getMessages,
    addMessage,
    isGenerating,
    setGenerating,
    setMermaidCode,
    abortController,
    setAbortController,
    isSettingsOpen,
    setLastGeneratedContent,
    lastGeneratedContent,
  } = useChatStore();

  const messages = getMessages();
  const [input, setInput] = useState("");
  const [loadingText, setLoadingText] = useState("Sedang berpikir...");
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isGenerating) {
      setLoadingText("Sedang berpikir...");
      return;
    }

    const timers = [
      setTimeout(() => setLoadingText("Menganalisis kebutuhan arsitektur..."), 1500),
      setTimeout(() => setLoadingText("Merancang struktur sistem..."), 3500),
      setTimeout(() => setLoadingText("Menyiapkan render diagram..."), 5500),
    ];

    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [isGenerating]);

  useEffect(() => {
    if (!isSettingsOpen) {
      endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isGenerating, isSettingsOpen]);

  // Adjust textarea height dynamically
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  };

  const handleSubmit = async () => {
    if (!input.trim() || isGenerating) return;

    const userMessage = input.trim();
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    addMessage({ role: "user", content: userMessage });

    setGenerating(true);
    const controller = new AbortController();
    setAbortController(controller);

    try {
      const currentMsgs = getMessages();
      const allMessages =
        currentMsgs.length > 20
          ? currentMsgs.slice(currentMsgs.length - 20)
          : currentMsgs;

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: allMessages }),
        signal: controller.signal,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate architecture");
      }

      const {
        explanation,
        mermaid,
        architectureScore,
        strengths,
        weaknesses,
        recommendation,
      } = data.data || data;

      let modelReply = "";
      const hasDiagram = mermaid && mermaid.trim().length > 0;

      if (hasDiagram) {
        modelReply = `**Architecture Score: ${architectureScore}/100**\n\n${explanation}`;
        if (strengths?.length > 0) {
          modelReply += `\n\n**Strengths:** ${strengths.join(", ")}`;
        }
        if (weaknesses?.length > 0) {
          modelReply += `\n\n**Weaknesses:** ${weaknesses.join(", ")}`;
        }
        if (recommendation) {
          modelReply += `\n\n**Next step:** ${recommendation}`;
        }
      } else {
        modelReply = explanation || "No response generated.";
      }

      setLastGeneratedContent(modelReply);

      addMessage({
        role: "model",
        content: modelReply,
        mermaidCode: hasDiagram ? sanitizeMermaid(mermaid) : undefined,
      });

      if (hasDiagram) {
        const sanitized = sanitizeMermaid(mermaid);
        setMermaidCode(sanitized);
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        addMessage({
          role: "model",
          content: "*(Generation stopped by user)*",
        });
      } else {
        addMessage({
          role: "model",
          content: `**Error:** ${error.message || "An unexpected error occurred"}`,
        });
      }
    } finally {
      setGenerating(false);
      setAbortController(null);
    }
  };

  const handleStop = () => {
    if (abortController) {
      abortController.abort();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className={`relative flex flex-col h-full w-full md:w-[400px] lg:w-[450px] shrink-0 bg-[#0A0A0A] text-zinc-200 overflow-hidden md:border-r border-zinc-800/80 z-10 ${isSettingsOpen ? 'hidden md:flex' : ''}`}>
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 pt-8 md:pt-4 pb-32 md:pb-36 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[70%] h-full text-center space-y-4 md:space-y-6">
            <div className="relative shrink-0 mt-4 md:mt-0">
              <img
                src="/logo_diagrampilot.png"
                className="w-12 h-12 md:w-16 md:h-16 object-contain opacity-80"
                alt="Logo"
              />
            </div>
            <h2 className="text-xl md:text-3xl font-semibold text-zinc-100 tracking-tight leading-tight px-4">
              How can I help you design today?
            </h2>
            <div className="flex flex-wrap justify-center gap-2 md:gap-3 mt-4 md:mt-6 max-w-lg px-2">
              <button
                onClick={() =>
                  handleQuickPrompt(
                    "Design a microservices architecture for an e-commerce platform"
                  )
                }
                className="px-3 md:px-4 py-1.5 md:py-2 bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-700 rounded-2xl text-[12px] md:text-xs font-medium text-zinc-300 transition-all shadow-sm"
              >
                Microservices E-Commerce
              </button>
              <button
                onClick={() =>
                  handleQuickPrompt("Design an OAuth2 flow for a mobile app")
                }
                className="px-3 md:px-4 py-1.5 md:py-2 bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-700 rounded-2xl text-[12px] md:text-xs font-medium text-zinc-300 transition-all shadow-sm"
              >
                OAuth2 Flow
              </button>
              <button
                onClick={() =>
                  handleQuickPrompt(
                    "Design a serverless real-time chat application"
                  )
                }
                className="px-3 md:px-4 py-1.5 md:py-2 bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-700 rounded-2xl text-[12px] md:text-xs font-medium text-zinc-300 transition-all shadow-sm"
              >
                Serverless Chat
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto divide-y divide-zinc-800/20">
            {messages.map((msg, idx) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={idx}
                  className={`py-8 flex gap-4 ${
                    isUser ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {isUser ? (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-zinc-900 border border-zinc-800 text-zinc-400 mt-1">
                      <User className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-transparent mt-1">
                      <img
                        src="/logo_diagrampilot.png"
                        className="w-6 h-6 object-contain"
                        alt="AI"
                      />
                    </div>
                  )}

                  <div
                    className={`flex flex-col min-w-0 ${
                      isUser
                        ? "max-w-[80%] items-end text-right"
                        : "flex-1 w-full text-left"
                    }`}
                  >
                    {isUser ? (
                      <div className="text-zinc-200 text-[15px] leading-relaxed font-medium bg-zinc-800/80 px-5 py-3.5 rounded-3xl rounded-tr-md shadow-sm border border-white/5 whitespace-pre-wrap text-left">
                        {msg.content}
                      </div>
                    ) : (
                      <div className="w-full text-zinc-100 text-[15px] leading-relaxed">
                        <TypewriterMarkdown
                          content={msg.content}
                          shouldAnimate={msg.content === lastGeneratedContent}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isGenerating && (
              <div className="py-8 flex flex-row items-start gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-transparent mt-1">
                  <img
                    src="/logo_diagrampilot.png"
                    className="w-6 h-6 object-contain animate-pulse opacity-80"
                    alt="Logo"
                  />
                </div>
                <div className="flex-1 text-left pt-1">
                  <span className="text-[15px] font-medium animate-pulse bg-gradient-to-r from-zinc-400 to-zinc-600 bg-clip-text text-transparent">
                    {loadingText}
                  </span>
                </div>
              </div>
            )}
            <div ref={endOfMessagesRef} />
          </div>
        )}
      </div>

      {/* Floating Pill Input Box */}
      <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 w-[95%] md:w-[90%] max-w-2xl bg-zinc-950/80 backdrop-blur-xl border border-zinc-800 rounded-3xl shadow-2xl p-1.5 md:p-2 px-3 md:px-4 flex items-end gap-1 md:gap-2 transition-all duration-300 focus-within:border-zinc-700 z-10">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={isGenerating}
          rows={1}
          placeholder="Describe your system architecture..."
          className="flex-1 bg-transparent resize-none outline-none py-3 px-2 text-zinc-200 placeholder:text-zinc-500 disabled:opacity-50 text-[15px] leading-relaxed max-h-[160px] min-h-[44px]"
        />
        {isGenerating ? (
          <button
            onClick={handleStop}
            className="p-2.5 text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-full transition-colors shrink-0 mb-1"
            title="Stop Generation"
          >
            <StopCircle className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!input.trim()}
            className="p-2.5 text-zinc-950 bg-white hover:bg-zinc-200 hover:scale-105 active:scale-95 rounded-full transition-all duration-200 disabled:opacity-30 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:hover:scale-100 shrink-0 mb-1 shadow-sm"
            title="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export { ChatPanel };
