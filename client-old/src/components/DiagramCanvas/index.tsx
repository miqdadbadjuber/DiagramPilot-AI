import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../../store/chatStore';
import type { Message } from '../../store/chatStore';
import { Copy, ZoomIn, ZoomOut, AlertTriangle, Download, ArrowUp, ArrowDown, Maximize, ArrowRightLeft, LayoutTemplate } from 'lucide-react';
import { toast } from 'sonner';
import DOMPurify from 'dompurify';

/**
 * Sanitize SVG content from Mermaid output using DOMPurify.
 * Configured to preserve SVG elements, attributes, and inline styles
 * that Mermaid diagrams legitimately require.
 */
function sanitizeSvg(rawSvg: string): string {
  return DOMPurify.sanitize(rawSvg, {
    USE_PROFILES: { svg: true, svgFilters: true },
    ADD_TAGS: ['foreignObject', 'style'],
    ADD_ATTR: ['dominant-baseline', 'text-anchor', 'transform', 'marker-end', 'marker-start', 'clip-path', 'xmlns:xlink'],
  });
}

export default function DiagramCanvas() {
  const { getCurrentMermaidCode, getMessages, setMermaidCode } = useChatStore();
  const currentMermaidCode = getCurrentMermaidCode();
  const messages = getMessages();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [baseSize, setBaseSize] = useState({ width: 0, height: 0 });
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

  // Update base size when svg content changes
  useEffect(() => {
    if (svgContent && containerRef.current) {
      // Use setTimeout to ensure DOM has updated with the new SVG before measuring
      const timer = setTimeout(() => {
        if (containerRef.current) {
          setBaseSize({
            width: containerRef.current.offsetWidth,
            height: containerRef.current.offsetHeight
          });
        }
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setBaseSize({ width: 0, height: 0 });
    }
  }, [svgContent]);

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

  const diagramHistory = messages.filter((m: Message) => m.mermaidCode).map((m: Message) => m.mermaidCode as string);
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
      <div className="flex-1 bg-[#09090b] bg-dot-grid flex flex-col items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(9,9,11,1)_70%)] pointer-events-none" />
        
        <div className="w-full max-w-lg bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-[32px] p-12 flex flex-col items-center text-center shadow-2xl relative z-10 animate-fade-in group">
          <div className="w-20 h-20 bg-gradient-to-b from-zinc-800 to-zinc-900 border border-zinc-700/50 rounded-2xl shadow-inner flex items-center justify-center mb-8 relative group-hover:scale-105 transition-transform duration-500">
            <LayoutTemplate className="w-9 h-9 text-zinc-300 drop-shadow-md" strokeWidth={1.5} />
          </div>
          <h3 className="font-brand text-[24px] font-semibold text-zinc-100 tracking-tight mb-3">Diagram Workspace</h3>
          <p className="text-[15px] text-zinc-400 max-w-sm leading-relaxed">Describe your architecture in the chat to generate a live, interactive diagram on this canvas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#09090b] bg-dot-grid flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(9,9,11,1)_85%)] pointer-events-none" />

      {/* Toolbar */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-zinc-900/90 backdrop-blur-md border border-zinc-800/80 rounded-full p-1.5 flex gap-1 z-10 shadow-2xl">
        <button onClick={handleCopy} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-zinc-100 transition-colors" title="Copy Mermaid Code">
          <Copy className="w-4 h-4" />
        </button>
        <button onClick={handleDownload} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-zinc-100 transition-colors" title="Download PNG">
          <Download className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-zinc-800 my-auto mx-1" />
        <button onClick={handleZoomIn} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-zinc-100 transition-colors" title="Zoom In">
          <ZoomIn className="w-4 h-4" />
        </button>
        <button onClick={handleZoomOut} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-zinc-100 transition-colors" title="Zoom Out">
          <ZoomOut className="w-4 h-4" />
        </button>
        <button onClick={handleReset} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-zinc-100 transition-colors" title="Fit to Screen">
          <Maximize className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-zinc-800 my-auto mx-1" />
        <button onClick={handleRotate} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-zinc-100 transition-colors" title="Rotate Layout (TD/LR)">
          <ArrowRightLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Version Navigation */}
      {totalDiagrams > 0 && (
        <div className="absolute right-6 top-1/2 -translate-y-1/2 bg-zinc-900/90 backdrop-blur-md border border-zinc-800/80 rounded-full flex flex-col items-center p-1.5 z-10 shadow-2xl gap-2">
          <button 
            onClick={handlePrevDiagram} 
            disabled={currentIndex <= 0}
            className="p-2 rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-zinc-400 transition-colors"
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
            className="p-2 rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-zinc-400 transition-colors"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Canvas Area */}
      <div className="flex-1 overflow-auto p-8 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] flex flex-col">
        {isRendering ? (
          <div className="w-full h-full relative overflow-hidden flex flex-col items-center justify-center bg-zinc-950/80 rounded-2xl glass border border-zinc-800">
            <div className="flex flex-col items-center z-20 space-y-8">
              <div className="relative">
                <img src="/logo_diagrampilot.png" className="w-16 h-16 animate-pulse opacity-80" alt="Logo" />
                <div className="absolute -inset-6 border-[3px] border-zinc-800 rounded-full"></div>
                <div className="absolute -inset-6 border-[3px] border-transparent border-t-zinc-400 rounded-full animate-spin"></div>
              </div>
              <div className="text-zinc-400 font-brand font-medium tracking-wide flex flex-col items-center gap-2">
                <span className="animate-pulse">{generatingText}</span>
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
            className="m-auto animate-in fade-in zoom-in-[0.98] duration-300 ease-out"
            style={{ 
              width: baseSize.width ? baseSize.width * zoom : 'auto', 
              height: baseSize.height ? baseSize.height * zoom : 'auto',
              transition: 'width 0.3s ease-out, height 0.3s ease-out'
            }}
          >
            <div 
              style={{ 
                transform: `scale(${zoom})`, 
                transformOrigin: 'top left',
                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                width: baseSize.width || 'auto',
                height: baseSize.height || 'auto'
              }}
            >
              <div 
                ref={containerRef}
                className="bg-zinc-950/80 backdrop-blur-md border border-zinc-800/60 p-10 rounded-3xl shadow-xl ring-1 ring-white/5 inline-block"
                dangerouslySetInnerHTML={{ __html: sanitizeSvg(svgContent) }}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 m-auto animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-sm mb-6">
              <LayoutTemplate className="w-7 h-7 text-zinc-400" strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-[17px] text-zinc-300 mb-1.5 tracking-tight">Blank Canvas</h3>
              <p className="text-[14px] text-zinc-500 max-w-[240px] leading-relaxed">Start describing your architecture to see it here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
