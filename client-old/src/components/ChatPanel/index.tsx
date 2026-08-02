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
  const { getMessages, addMessage, isGenerating, setGenerating, setMermaidCode, abortController, setAbortController } = useChatStore();
  const messages = getMessages();
  const [input, setInput] = useState('');
  const [loadingText, setLoadingText] = useState("Sedang berpikir...");
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
      // Build the full message history including the new user message,
      // then apply the same 20-message cap that the store uses.
      // This ensures the backend payload never exceeds the stored limit.
      const fullHistory = [...messages, { role: 'user', content: userMessage }];
      const allMessages = fullHistory.length > 20
        ? fullHistory.slice(fullHistory.length - 20)
        : fullHistory;
      
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
    <div className="flex-1 flex flex-col h-full text-zinc-200">
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-fade-in">
            <div className="relative">
              <img src="/logo_diagrampilot.png" className="w-16 h-16 object-contain opacity-80" alt="Logo" />
            </div>
            <h2 className="font-brand text-3xl font-semibold text-zinc-100 tracking-tight">How can I help you design today?</h2>
            <div className="flex flex-wrap justify-center gap-3 mt-4 max-w-lg">
              <button onClick={() => handleQuickPrompt('Design a microservices architecture for an e-commerce platform')} className="px-5 py-2.5 bg-zinc-900/50 hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-700 rounded-2xl text-sm font-medium text-zinc-300 transition-all shadow-sm">Microservices E-Commerce</button>
              <button onClick={() => handleQuickPrompt('Design an OAuth2 flow for a mobile app')} className="px-5 py-2.5 bg-zinc-900/50 hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-700 rounded-2xl text-sm font-medium text-zinc-300 transition-all shadow-sm">OAuth2 Flow</button>
              <button onClick={() => handleQuickPrompt('Design a serverless real-time chat application')} className="px-5 py-2.5 bg-zinc-900/50 hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-700 rounded-2xl text-sm font-medium text-zinc-300 transition-all shadow-sm">Serverless Chat</button>
            </div>
          </div>
        ) : (
          <div className="space-y-10 max-w-3xl mx-auto pb-8 pt-4">
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <div key={idx} className={`flex gap-5 animate-fade-in ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  {isUser ? (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-zinc-900 border border-zinc-800 shadow-sm mt-1">
                      <User className="w-4 h-4 text-zinc-400" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-transparent mt-1">
                      <img src="/logo_diagrampilot.png" className="w-6 h-6 object-contain" alt="AI" />
                    </div>
                  )}
                  <div className={`flex flex-col min-w-0 ${isUser ? 'max-w-[80%] items-end' : 'flex-1 w-full'}`}>
                    {isUser ? (
                      <div className="text-zinc-200 text-[15px] leading-relaxed font-medium bg-zinc-800/40 px-5 py-3 rounded-2xl rounded-tr-sm border border-zinc-700/30 text-left">
                        <span className="whitespace-pre-wrap">{msg.content}</span>
                      </div>
                    ) : (
                      <div className="w-full text-zinc-300 pt-1.5 text-[15px] leading-relaxed">
                        <div className="flex flex-col gap-5 w-full">
                          <TypewriterMarkdown 
                            content={msg.content} 
                            isLatest={idx === messages.length - 1} 
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {isGenerating && (
              <div className="flex gap-5 animate-fade-in">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1">
                  <img src="/logo_diagrampilot.png" className="w-6 h-6 object-contain animate-pulse opacity-80" alt="Logo" />
                </div>
                <div className="flex-1 w-full pt-1.5">
                  <span className="text-[15px] font-medium text-transparent bg-clip-text bg-gradient-to-r from-zinc-400 to-zinc-600 animate-pulse">{loadingText}</span>
                </div>
              </div>
            )}
            <div ref={endOfMessagesRef} />
          </div>
        )}
      </div>
      <div className="shrink-0 p-4 md:p-6 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent pt-12 relative z-10">
        <div className="relative max-w-3xl mx-auto flex items-end bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/50 focus-within:border-zinc-600 focus-within:ring-4 focus-within:ring-zinc-800/40 rounded-3xl shadow-2xl transition-all duration-300 group">
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isGenerating}
            className="w-full max-h-[200px] min-h-[56px] bg-transparent resize-none outline-none py-4 px-6 pr-14 text-zinc-200 placeholder:text-zinc-500 disabled:opacity-50 text-[15px] leading-relaxed"
            placeholder="Describe your system architecture..."
            rows={1}
          />
          {isGenerating ? (
            <button 
              onClick={handleStop}
              className="absolute right-2.5 bottom-2.5 p-2 text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-full transition-colors flex items-center justify-center"
            >
              <StopCircle className="w-4 h-4" />
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={!input.trim()}
              className="absolute right-2.5 bottom-2.5 p-2 text-zinc-950 bg-white hover:bg-zinc-200 hover:scale-105 active:scale-95 rounded-full transition-all duration-200 flex items-center justify-center disabled:opacity-30 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:hover:bg-zinc-800 disabled:hover:scale-100 shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
