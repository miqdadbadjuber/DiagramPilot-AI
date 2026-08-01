import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../../store/chatStore';
import { Send, StopCircle, User } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

function TypewriterMarkdown({ content, isLatest, onStart, onComplete }: { content: string, isLatest: boolean, onStart?: () => void, onComplete?: () => void }) {
  const [displayedContent, setDisplayedContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!isLatest) {
      setDisplayedContent(content);
      setIsTyping(false);
      onComplete?.();
      return;
    }
    
    setDisplayedContent('');
    setIsTyping(true);
    onStart?.();
    let i = 0;
    
    const interval = setInterval(() => {
      i += 1;
      if (i >= content.length) {
        setDisplayedContent(content);
        setIsTyping(false);
        clearInterval(interval);
        onComplete?.();
      } else {
        setDisplayedContent(content.slice(0, i));
      }
    }, 15);

    return () => clearInterval(interval);
  }, [content, isLatest]);

  const contentWithCursor = isTyping ? displayedContent + ' ▍' : displayedContent;

  return (
    <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-800 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
      <ReactMarkdown>{contentWithCursor}</ReactMarkdown>
    </div>
  );
}

/**
 * Sanitizes Mermaid code from AI output.
 * Fixes: markdown wrappers, keyword casing, colon-labels, quoted link text,
 * parentheses in labels, semicolons, and single-line output.
 */
function sanitizeMermaid(raw: string): string {
  let code = raw.trim();

  // 1. Strip markdown code block wrappers
  if (code.startsWith('```mermaid')) {
    code = code.replace(/^```mermaid\n?/, '').replace(/\n?```$/, '');
  } else if (code.startsWith('```')) {
    code = code.replace(/^```\n?/, '').replace(/\n?```$/, '');
  }
  code = code.trim();

  // 2. Fix keyword casing
  code = code.replace(/\bSubGraph\b/gi, 'subgraph');
  code = code.replace(/^(\s*)End\s*$/gm, '$1end');
  code = code.replace(/\bGraph\b(?=\s+(?:TD|LR|RL|BT))/g, 'graph');
  code = code.replace(/\bFlowchart\b/gi, 'flowchart');

  // 3. Single-line fix (before line-by-line processing)
  if (!code.includes('\n')) {
    code = code
      .replace(/\s+(subgraph\s)/g, '\n    $1')
      .replace(/\s+(end)\s/g, '\n    $1\n    ')
      .replace(/\s+(\w[\w_]*(?:\[.*?\]|\(.*?\)|{.*?}|>.*?\])?\s*--)/g, '\n    $1')
      .replace(/\s+(\w[\w_]*\[)/g, '\n    $1');
  }

  // 4. Line-by-line fixes
  const lines = code.split('\n');
  const fixedLines = lines.map(line => {
    let l = line;

    // Remove trailing semicolons
    l = l.replace(/;\s*$/, '');

    // Fix parentheses inside [...] labels
    l = l.replace(/\[([^\]]*)\]/g, (_m, label: string) => {
      if (label.includes('(')) {
        const fixed = label.replace(/\(/g, '- ').replace(/\)/g, '');
        return `[${fixed.replace(/\s+/g, ' ').trim()}]`;
      }
      return `[${label}]`;
    });

    // Fix colon-labels: "A --> B: label" → "A -->|label| B"
    // Pattern: (source) (arrow) (target): (label)
    const colonLabel = l.match(/^(\s*\w[\w_]*(?:\[.*?\]|\{.*?\}|\(.*?\))?)\s*(-->|---|-.->|==>)\s*(\w[\w_]*(?:\[.*?\]|\{.*?\}|\(.*?\))?):\s*(.+)$/);
    if (colonLabel) {
      const [, src, arrow, tgt, label] = colonLabel;
      const cleanLabel = label.replace(/[()]/g, '').trim();
      l = `${src} ${arrow}|${cleanLabel}| ${tgt}`;
    }

    // Fix: A -- "text" --> B: label → A -->|text| B
    const quotedWithColon = l.match(/^(\s*\w[\w_]*(?:\[.*?\]|\{.*?\}|\(.*?\))?)\s*--\s*"([^"]+)"\s*(-->|---|-.->|==>)\s*(\w[\w_]*(?:\[.*?\]|\{.*?\}|\(.*?\))?):\s*(.+)$/);
    if (quotedWithColon) {
      const [, src, linkText, arrow, tgt] = quotedWithColon;
      l = `${src} ${arrow}|${linkText}| ${tgt}`;
    }

    // Fix: A -- "text" --> B (no colon label, just quoted link text)
    const quotedLink = l.match(/^(\s*\w[\w_]*(?:\[.*?\]|\{.*?\}|\(.*?\))?)\s*--\s*"([^"]+)"\s*(-->|---|-.->|==>)\s*(\w[\w_]*(?:\[.*?\]|\{.*?\}|\(.*?\))?)$/);
    if (quotedLink) {
      const [, src, linkText, arrow, tgt] = quotedLink;
      l = `${src} ${arrow}|${linkText}| ${tgt}`;
    }

    return l;
  });

  return fixedLines.join('\n');
}

export default function ChatPanel() {
  const { messages, addMessage, isGenerating, setGenerating, setMermaidCode, abortController, setAbortController } = useChatStore();
  const [input, setInput] = useState('');
  const [loadingText, setLoadingText] = useState("Sedang berpikir...");
  const [isLatestTyping, setIsLatestTyping] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isGenerating) {
      setLoadingText("Sedang berpikir...");
      return;
    }
    
    const timers = [
      setTimeout(() => setLoadingText("Menganalisis kebutuhan arsitektur..."), 1500),
      setTimeout(() => setLoadingText("Merancang struktur sistem..."), 3500),
      setTimeout(() => setLoadingText("Menyiapkan render diagram..."), 5500)
    ];

    return () => timers.forEach(clearTimeout);
  }, [isGenerating]);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  const handleSubmit = async () => {
    if (!input.trim() || isGenerating) return;

    const userMessage = input.trim();
    setInput('');
    addMessage({ role: 'user', content: userMessage });
    
    setGenerating(true);
    const controller = new AbortController();
    setAbortController(controller);

    try {
      const allMessages = [...messages, { role: 'user', content: userMessage }];
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: allMessages }),
        signal: controller.signal
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate architecture');
      }

      const { explanation, mermaid, architectureScore, strengths, weaknesses, recommendation } = data.data;

      // Build response — conversational if no diagram, detailed if diagram exists
      let modelReply = '';
      const hasDiagram = mermaid && mermaid.trim().length > 0;

      if (hasDiagram) {
        modelReply = `**Architecture Score: ${architectureScore}/100**\n\n${explanation}`;
        if (strengths?.length > 0) {
          modelReply += `\n\n**Strengths:** ${strengths.join(', ')}`;
        }
        if (weaknesses?.length > 0) {
          modelReply += `\n\n**Weaknesses:** ${weaknesses.join(', ')}`;
        }
        if (recommendation) {
          modelReply += `\n\n**Next step:** ${recommendation}`;
        }
      } else {
        // Casual/conversational response — just show the explanation
        modelReply = explanation;
      }

      addMessage({ 
        role: 'model', 
        content: modelReply,
        mermaidCode: hasDiagram ? sanitizeMermaid(mermaid) : undefined
      });
      
      if (hasDiagram) {
        const sanitized = sanitizeMermaid(mermaid);
        setMermaidCode(sanitized);
        toast.success("Diagram Updated");
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        toast.info("Generation stopped by user");
        addMessage({ role: 'model', content: "*(Generation stopped by user)*" });
      } else {
        toast.error(error.message || "An unexpected error occurred");
        addMessage({ role: 'model', content: `**Error:** ${error.message || "An unexpected error occurred"}` });
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="flex-1 flex flex-col bg-zinc-900 border-r border-zinc-800 text-zinc-200">
      <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
        <h2 className="font-brand font-bold text-zinc-100 flex items-center gap-2 text-lg tracking-tight">
          <img src="/logo.png" className="w-6 h-6 drop-shadow-md" alt="Logo" />
          DiagramPilot AI
        </h2>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 animate-fade-in">
            <div className="relative">
              <div className="w-24 h-24 bg-zinc-800/80 backdrop-blur-sm border border-zinc-700/50 rounded-3xl flex items-center justify-center mb-6 relative z-10 shadow-2xl">
                <img src="/logo.png" className="w-full h-full object-contain p-4 drop-shadow-lg" alt="Logo" />
              </div>
            </div>
            <h2 className="font-brand text-2xl font-bold text-white tracking-tight">How can I help you design today?</h2>
            <div className="flex flex-wrap justify-center gap-3 mt-4 max-w-md relative z-10">
              <button onClick={() => handleQuickPrompt('Design a microservices architecture for an e-commerce platform')} className="px-4 py-2 bg-zinc-800/50 hover:bg-zinc-700/80 border border-zinc-700/50 rounded-full text-sm transition-all hover:scale-105 active:scale-95 shadow-lg">Microservices E-Commerce</button>
              <button onClick={() => handleQuickPrompt('Design an OAuth2 flow for a mobile app')} className="px-4 py-2 bg-zinc-800/50 hover:bg-zinc-700/80 border border-zinc-700/50 rounded-full text-sm transition-all hover:scale-105 active:scale-95 shadow-lg">OAuth2 Flow</button>
              <button onClick={() => handleQuickPrompt('Design a serverless real-time chat application')} className="px-4 py-2 bg-zinc-800/50 hover:bg-zinc-700/80 border border-zinc-700/50 rounded-full text-sm transition-all hover:scale-105 active:scale-95 shadow-lg">Serverless Chat</button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 max-w-3xl mx-auto pb-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-4 animate-fade-in ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-9 h-9 mt-3 rounded-full flex items-center justify-center shrink-0 shadow-lg overflow-hidden ${msg.role === 'user' ? 'bg-zinc-700 border border-zinc-600' : 'bg-zinc-900 border border-zinc-700/50'}`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <img src="/logo.png" className="w-full h-full object-contain p-1.5" alt="Logo" />}
                </div>
                <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-4 rounded-2xl shadow-md backdrop-blur-sm ${msg.role === 'user' ? 'bg-zinc-800/90 text-zinc-100 rounded-tr-sm border border-zinc-700/50' : 'bg-transparent text-zinc-300'}`}>
                    {msg.role === 'user' ? (
                      <span className="whitespace-pre-wrap">{msg.content}</span>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <TypewriterMarkdown 
                          content={msg.content} 
                          isLatest={idx === messages.length - 1} 
                          onStart={() => setIsLatestTyping(true)}
                          onComplete={() => setIsLatestTyping(false)}
                        />
                        {msg.mermaidCode && !(idx === messages.length - 1 && isLatestTyping) && (
                          <button 
                            onClick={() => {
                              setMermaidCode(msg.mermaidCode as string);
                              toast.success("Loaded diagram from history");
                            }}
                            className="self-start text-xs flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-sky-400 rounded-lg transition-colors border border-zinc-700 hover:border-sky-500/50"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                            View Diagram
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isGenerating && (
              <div className="flex gap-4 animate-fade-in">
                <div className="w-9 h-9 mt-3 rounded-full flex items-center justify-center shrink-0 shadow-lg bg-zinc-900 border border-zinc-700/50 overflow-hidden">
                  <img src="/logo.png" className="w-full h-full object-contain p-1.5 animate-pulse opacity-70" alt="Logo" />
                </div>
                <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 p-4 rounded-2xl shadow-md rounded-tl-sm flex items-center">
                  <span className="text-sm font-medium text-zinc-400 animate-pulse">{loadingText}</span>
                </div>
              </div>
            )}
            <div ref={endOfMessagesRef} />
          </div>
        )}
      </div>
      <div className="p-6 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent">
        <div className="relative max-w-3xl mx-auto flex items-end bg-zinc-800/80 backdrop-blur-md border border-zinc-700/50 rounded-[28px] shadow-2xl focus-within:ring-2 focus-within:ring-sky-500/50 focus-within:border-sky-500/50 transition-all">
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isGenerating}
            className="w-full max-h-40 min-h-[56px] bg-transparent resize-none outline-none p-4 px-6 pr-14 text-zinc-100 placeholder:text-zinc-500 disabled:opacity-50"
            placeholder="Describe your system architecture..."
            rows={1}
          />
          {isGenerating ? (
            <button 
              onClick={handleStop}
              className="absolute right-2 bottom-2 p-2 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500/20 hover:scale-105 active:scale-95 transition-all"
            >
              <StopCircle className="w-5 h-5" />
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={!input.trim()}
              className="absolute right-2 bottom-2 p-2 bg-sky-500 text-white rounded-full hover:bg-sky-400 hover:shadow-[0_0_15px_rgba(14,165,233,0.4)] disabled:hover:shadow-none transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:hover:translate-y-0"
            >
              <Send className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
