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
  const handleReset = () => setZoom(1);

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
  const currentIndex = diagramHistory.map(normalizeCode).lastIndexOf(normalizedCurrent);

  const handlePrevDiagram = () => {
    if (currentIndex > 0) setMermaidCode(diagramHistory[currentIndex - 1]);
  };

  const handleNextDiagram = () => {
    if (currentIndex < totalDiagrams - 1) setMermaidCode(diagramHistory[currentIndex + 1]);
  };

  if (!currentMermaidCode) {
    return (
      <div className="flex-1 bg-zinc-950 flex flex-col items-center justify-center text-zinc-400 p-8">
        <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-xl p-8 flex flex-col items-center text-center shadow-xl">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-zinc-600">
            <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <h3 className="text-xl font-medium text-white mb-2">No Diagram Generated</h3>
          <p className="text-sm text-zinc-500 max-w-sm">
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
          <div className="flex flex-col items-center text-zinc-500 gap-4">
            <div className="w-8 h-8 border-4 border-zinc-700 border-t-sky-500 rounded-full animate-spin"></div>
            <p>Rendering Diagram...</p>
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
            className="transition-transform duration-200 ease-out flex items-center justify-center min-w-full min-h-full"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
          >
            <div 
              ref={containerRef}
              className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl shadow-2xl"
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
