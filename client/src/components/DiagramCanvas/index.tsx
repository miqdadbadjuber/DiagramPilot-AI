import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../../store/chatStore';
import { Copy, ZoomIn, ZoomOut, AlertTriangle, Download, ArrowUp, ArrowDown, Maximize, ArrowRightLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function DiagramCanvas() {
  const { currentMermaidCode, messages, setMermaidCode } = useChatStore();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isRendering, setIsRendering] = useState(false);
  const [generatingText, setGeneratingText] = useState('Initializing nodes...');

  useEffect(() => {
    if (!isRendering) return;
    
    const steps = [
      'Initializing nodes...',
      'Calculating edges...',
      'Mapping dependencies...',
      'Structuring layout...',
      'Rendering blueprint...'
    ];
    let stepIndex = 0;
    
    const interval = setInterval(() => {
      stepIndex = (stepIndex + 1) % steps.length;
      setGeneratingText(steps[stepIndex]);
    }, 800);
    
    return () => clearInterval(interval);
  }, [isRendering]);

  useEffect(() => {
    if (!currentMermaidCode) {
      setSvgContent(null);
      setError(null);
      return;
    }

    let isMounted = true;
    setIsRendering(true);
    setError(null);

    const renderDiagram = async () => {
      try {
        const mermaid = (await import('mermaid')).default;
        
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          securityLevel: 'loose',
          fontFamily: 'Inter, sans-serif'
        });

        // Use a unique ID for the generated SVG to prevent conflicts
        const id = `mermaid-${Date.now()}`;
        
        // mermaid.parse can throw if syntax is invalid
        await mermaid.parse(currentMermaidCode);
        
        const { svg } = await mermaid.render(id, currentMermaidCode);
        
        if (isMounted) {
          setSvgContent(svg);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to parse Mermaid diagram.");
          setSvgContent(null);
        }
      } finally {
        if (isMounted) {
          setIsRendering(false);
        }
      }
    };

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [currentMermaidCode]);

  const handleCopy = () => {
    if (currentMermaidCode) {
      navigator.clipboard.writeText(currentMermaidCode);
      toast.success("Mermaid syntax copied to clipboard");
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
  const handleReset = () => {
    if (!containerRef.current) {
      setZoom(1);
      return;
    }
    
    const svgEl = containerRef.current.querySelector('svg');
    const wrapperEl = containerRef.current.closest('.overflow-auto');
    
    if (!svgEl || !wrapperEl) {
      setZoom(1);
      return;
    }

    // Get the base sizes
    const svgRect = svgEl.getBoundingClientRect();
    const wrapperRect = wrapperEl.getBoundingClientRect();
    
    // We want the unscaled dimensions of the SVG for the math.
    // getBoundingClientRect includes the current scale transform, so we divide by current zoom to get native width
    const nativeSvgWidth = svgRect.width / zoom;
    const nativeSvgHeight = svgRect.height / zoom;

    if (nativeSvgWidth === 0 || nativeSvgHeight === 0) {
      setZoom(1);
      return;
    }

    // Include the 128px of total padding (32px * 2 for wrapper, 32px * 2 for container)
    const widthRatio = wrapperRect.width / (nativeSvgWidth + 128);
    const heightRatio = wrapperRect.height / (nativeSvgHeight + 128);
    
    // Fit to screen with 10% padding
    const idealZoom = Math.min(widthRatio, heightRatio) * 0.9;
    
    // Clamp zoom between 0.2 and 4
    setZoom(Math.max(0.2, Math.min(idealZoom, 4)));
    toast.success('Fitted to screen');
  };

  const handleDownload = () => {
    if (!svgContent) return;
    
    // We clone the node so we don't mutate the DOM directly
    const svgEl = containerRef.current?.querySelector('svg')?.cloneNode(true) as SVGSVGElement;
    if (!svgEl) {
      toast.error("SVG not found");
      return;
    }

    // Ensure xmlns is present (required for canvas drawing)
    svgEl.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    // Remove inline max-width style that Mermaid sometimes adds, which breaks rendering
    svgEl.style.maxWidth = 'none';

    // Force explicit width and height if viewBox exists, otherwise it might be 0x0
    const viewBox = svgEl.getAttribute('viewBox');
    let baseWidth = 800;
    let baseHeight = 600;
    
    if (viewBox) {
      const [, , w, h] = viewBox.split(' ').map(Number);
      if (w && h) {
        baseWidth = w;
        baseHeight = h;
        svgEl.setAttribute('width', w.toString());
        svgEl.setAttribute('height', h.toString());
      }
    } else {
      // If no viewBox, try getting BBox or bounding client rect
      const rect = containerRef.current?.querySelector('svg')?.getBoundingClientRect();
      if (rect && rect.width && rect.height) {
        baseWidth = rect.width;
        baseHeight = rect.height;
        svgEl.setAttribute('width', baseWidth.toString());
        svgEl.setAttribute('height', baseHeight.toString());
      }
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const svgData = new XMLSerializer().serializeToString(svgEl);
    // Use encodeURIComponent instead of Blob because Blob SVG can fail on some browsers if it contains # or unencoded chars
    const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData);
    
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const scale = 2; // 2x for retina quality
      
      const finalWidth = img.width || baseWidth;
      const finalHeight = img.height || baseHeight;

      canvas.width = finalWidth * scale;
      canvas.height = finalHeight * scale;
      ctx.scale(scale, scale);
      
      // Dark background to match UI
      ctx.fillStyle = '#18181b';
      ctx.fillRect(0, 0, finalWidth, finalHeight);
      ctx.drawImage(img, 0, 0, finalWidth, finalHeight);

      try {
        const link = document.createElement('a');
        link.download = `diagrampilot-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        toast.success('Diagram downloaded as PNG');
      } catch (err) {
        toast.error("Failed to export canvas to PNG");
      }
    };
    
    img.onerror = () => {
      toast.error("Failed to render diagram image. The SVG might contain unsupported elements.");
    };

    img.src = url;
  };

  const normalizeCode = (code: string) => {
    return code.replace(/^\s*(?:graph|flowchart)\s+(?:TD|TB|LR|RL|BT)\b/im, 'DIAGRAM_DIR');
  };

  const handleRotate = () => {
    if (!currentMermaidCode) return;
    
    const match = currentMermaidCode.match(/^\s*(graph|flowchart)\s+(TD|TB|LR|RL|BT)\b/im);
    if (!match) {
      toast.error('Rotation not supported for this diagram type');
      return;
    }

    const prefix = match[0];
    const dir = match[2].toUpperCase();
    
    const isVertical = ['TD', 'TB', 'BT'].includes(dir);
    const newDir = isVertical ? 'LR' : 'TD';
    
    // Replace only the first occurrence which defines the layout
    const newCode = currentMermaidCode.replace(prefix, prefix.replace(new RegExp(dir, 'i'), newDir));
    
    setMermaidCode(newCode);
    toast.success('Diagram rotated');
  };

  const diagramHistory = messages.filter(m => m.mermaidCode).map(m => m.mermaidCode as string);
  const totalDiagrams = diagramHistory.length;
  
  const normalizedCurrent = normalizeCode(currentMermaidCode || '');
  const foundIndex = diagramHistory.map(normalizeCode).lastIndexOf(normalizedCurrent);
  const currentIndex = foundIndex === -1 && totalDiagrams > 0 ? totalDiagrams - 1 : foundIndex;

  const handlePrevDiagram = () => {
    if (currentIndex > 0) setMermaidCode(diagramHistory[currentIndex - 1]);
  };

  const handleNextDiagram = () => {
    if (currentIndex >= 0 && currentIndex < totalDiagrams - 1) setMermaidCode(diagramHistory[currentIndex + 1]);
  };

  if (!currentMermaidCode) {
    return (
      <div className="flex-1 bg-zinc-950 flex flex-col items-center justify-center text-zinc-400 p-8 relative overflow-hidden">
        {/* Subtle animated background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-900/20 rounded-full blur-[120px] animate-pulse-glow pointer-events-none"></div>
        
        <div className="w-full max-w-2xl bg-zinc-900/50 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-10 flex flex-col items-center text-center shadow-2xl relative z-10 glass">
          <div className="w-20 h-20 bg-zinc-800/80 rounded-full flex items-center justify-center mb-6 shadow-inner border border-zinc-700/50 relative">
            <div className="absolute inset-0 rounded-full border border-sky-500/30 border-t-sky-400 animate-[spin_4s_linear_infinite]"></div>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]">
              <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold text-white mb-3">No Diagram Generated</h3>
          <p className="text-base text-zinc-400 max-w-md">
            Describe your system architecture in the chat, and DiagramPilot will visually map it out for you here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-zinc-950 flex flex-col relative overflow-hidden">
      {/* Toolbar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-zinc-800 border border-zinc-700 rounded-lg p-1.5 flex gap-1 z-10 shadow-xl">
        <button onClick={handleCopy} className="p-2 hover:bg-zinc-700 rounded text-zinc-300 hover:text-white transition-colors" title="Copy Mermaid">
          <Copy className="w-4 h-4" />
        </button>
        <button onClick={handleDownload} className="p-2 hover:bg-zinc-700 rounded text-zinc-300 hover:text-white transition-colors" title="Download PNG">
          <Download className="w-4 h-4" />
        </button>
        <div className="w-px h-8 bg-zinc-700 mx-1" />
        <button onClick={handleZoomIn} className="p-2 hover:bg-zinc-700 rounded text-zinc-300 hover:text-white transition-colors" title="Zoom In">
          <ZoomIn className="w-4 h-4" />
        </button>
        <button onClick={handleZoomOut} className="p-2 hover:bg-zinc-700 rounded text-zinc-300 hover:text-white transition-colors" title="Zoom Out">
          <ZoomOut className="w-4 h-4" />
        </button>
        <button onClick={handleReset} className="p-2 hover:bg-zinc-700 rounded text-zinc-300 hover:text-white transition-colors" title="Fit to Screen">
          <Maximize className="w-4 h-4" />
        </button>
        <div className="w-px h-8 bg-zinc-700 mx-1" />
        <button onClick={handleRotate} className="p-2 hover:bg-zinc-700 rounded text-zinc-300 hover:text-white transition-colors" title="Rotate Layout (TD/LR)">
          <ArrowRightLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Version Navigation */}
      {totalDiagrams > 0 && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-zinc-800 border border-zinc-700 rounded-full flex flex-col items-center p-1 z-10 shadow-xl">
          <button 
            onClick={handlePrevDiagram} 
            disabled={currentIndex <= 0}
            className="p-2 rounded-full text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 transition-colors"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          
          <div className="py-2 text-xs font-medium text-zinc-400 flex flex-col items-center">
            {totalDiagrams === 1 ? (
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-500"></span>
            ) : (
              <span>{currentIndex + 1} / {totalDiagrams}</span>
            )}
          </div>

          <button 
            onClick={handleNextDiagram}
            disabled={currentIndex >= totalDiagrams - 1}
            className="p-2 rounded-full text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 transition-colors"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Canvas Area */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-8 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px]">
        {isRendering ? (
          <div className="w-full h-full relative overflow-hidden flex flex-col items-center justify-center bg-zinc-950/90 rounded-2xl glass">
            {/* The scanning laser line */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-sky-400 shadow-[0_0_15px_rgba(56,189,248,1)] animate-scan z-10"></div>
            
            {/* Terminal output feel */}
            <div className="flex flex-col items-center z-20 space-y-6">
              <div className="relative">
                <div className="absolute -inset-4 bg-sky-500/20 blur-xl rounded-full animate-pulse-glow"></div>
                <div className="w-16 h-16 border-2 border-sky-500/20 border-t-sky-400 rounded-full animate-spin"></div>
              </div>
              <div className="text-sky-400 font-mono text-sm tracking-widest uppercase flex flex-col items-center gap-2">
                <span className="opacity-50 text-xs">System Status</span>
                <span className="text-white animate-pulse drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">{generatingText}</span>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="max-w-2xl bg-red-950/30 border border-red-900/50 rounded-xl p-6 text-red-400 flex flex-col items-center text-center">
            <AlertTriangle className="w-10 h-10 mb-4 text-red-500" />
            <h3 className="text-lg font-bold text-white mb-2">Mermaid Syntax Error</h3>
            <div className="bg-red-950/50 p-4 rounded-lg w-full text-left overflow-x-auto text-sm font-mono whitespace-pre-wrap mb-4">
              {error}
            </div>
            <p className="text-sm text-zinc-400 mb-4">The AI generated invalid Mermaid syntax. You can view the raw code or ask the AI to fix it.</p>
            <div className="flex gap-4">
              <button onClick={handleCopy} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors">
                Copy Raw Code
              </button>
            </div>
          </div>
        ) : svgContent ? (
          <div 
            className="transition-transform duration-200 ease-out flex items-center justify-center min-w-full min-h-full animate-fade-in"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
          >
            <div 
              ref={containerRef}
              className="bg-zinc-900/90 backdrop-blur-sm border border-zinc-700/50 p-8 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] ring-1 ring-white/5"
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
