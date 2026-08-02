"use client";

import React, { useRef, useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  RotateCcw,
  Download,
  Copy,
  Check,
  History,
  ChevronLeft,
  ChevronRight,
  LayoutTemplate,
  Sparkles,
} from "lucide-react";
import { useChatStore, Message } from "../store/chatStore";
import MermaidRenderer from "./MermaidRenderer";

export default function DiagramCanvas() {
  const { getCurrentMermaidCode, getMessages, setMermaidCode } = useChatStore();
  const currentMermaidCode = getCurrentMermaidCode();
  const messages = getMessages();

  const canvasRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  // Version Navigation History
  const diagramHistory = messages
    .filter((m: Message) => Boolean(m.mermaidCode))
    .map((m: Message) => m.mermaidCode as string);

  const totalDiagrams = diagramHistory.length;

  const normalizeCode = (code: string) => {
    return code.replace(/^\s*(?:graph|flowchart)\s+(?:TD|TB|LR|RL|BT)\b/im, "DIAGRAM_DIR");
  };

  const normalizedCurrent = normalizeCode(currentMermaidCode || "");
  const foundIndex = diagramHistory.map(normalizeCode).lastIndexOf(normalizedCurrent);
  const currentIndex = foundIndex === -1 && totalDiagrams > 0 ? totalDiagrams - 1 : foundIndex;

  const handlePrevDiagram = () => {
    if (currentIndex > 0) {
      setMermaidCode(diagramHistory[currentIndex - 1]);
    }
  };

  const handleNextDiagram = () => {
    if (currentIndex >= 0 && currentIndex < totalDiagrams - 1) {
      setMermaidCode(diagramHistory[currentIndex + 1]);
    }
  };

  const handleCopy = () => {
    if (currentMermaidCode) {
      navigator.clipboard.writeText(currentMermaidCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRotate = () => {
    if (!currentMermaidCode) return;
    const match = currentMermaidCode.match(/^\s*(graph|flowchart)\s+(TD|TB|LR|RL|BT)\b/im);
    if (!match) return;

    const prefix = match[0];
    const dir = match[2].toUpperCase();
    const isVertical = ["TD", "TB", "BT"].includes(dir);
    const newDir = isVertical ? "LR" : "TD";

    const newCode = currentMermaidCode.replace(
      prefix,
      prefix.replace(new RegExp(dir, "i"), newDir)
    );
    setMermaidCode(newCode);
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const svgEl = canvasRef.current
      .querySelector("svg")
      ?.cloneNode(true) as SVGSVGElement | null;
    if (!svgEl) return;

    svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svgEl.style.maxWidth = "none";

    const viewBox = svgEl.getAttribute("viewBox");
    let baseWidth = 800;
    let baseHeight = 600;

    if (viewBox) {
      const [, , w, h] = viewBox.trim().split(/[\s,]+/).map(Number);
      if (w && h) {
        baseWidth = w;
        baseHeight = h;
        svgEl.setAttribute("width", w.toString());
        svgEl.setAttribute("height", h.toString());
      }
    } else {
      const rect = canvasRef.current.querySelector("svg")?.getBoundingClientRect();
      if (rect && rect.width && rect.height) {
        baseWidth = rect.width;
        baseHeight = rect.height;
        svgEl.setAttribute("width", baseWidth.toString());
        svgEl.setAttribute("height", baseHeight.toString());
      }
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgData);

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const scale = 2;
      const finalWidth = img.width || baseWidth;
      const finalHeight = img.height || baseHeight;

      canvas.width = finalWidth * scale;
      canvas.height = finalHeight * scale;
      ctx.scale(scale, scale);

      ctx.fillStyle = "#09090b";
      ctx.fillRect(0, 0, finalWidth, finalHeight);
      ctx.drawImage(img, 0, 0, finalWidth, finalHeight);

      try {
        const link = document.createElement("a");
        link.download = `diagrampilot-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      } catch {
        // failed export handler
      }
    };

    img.src = url;
  };

  // Empty state if no diagram present
  if (!currentMermaidCode) {
    return (
      <div className="flex-1 h-full bg-[#0A0A0A] bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] flex flex-col items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(10,10,10,1)_85%)] pointer-events-none" />

        <div className="w-full max-w-md bg-transparent flex flex-col items-center text-center relative z-10 animate-in fade-in zoom-in-95 duration-500">
          <div className="w-20 h-20 border border-zinc-800 rounded-3xl shadow-sm flex items-center justify-center mb-6 relative bg-zinc-950/50 backdrop-blur-xl">
            <LayoutTemplate className="w-10 h-10 text-zinc-500 drop-shadow-sm" strokeWidth={1} />
          </div>
          <h3 className="text-xl font-medium text-zinc-200 tracking-tight mb-2">
            Workspace Ready
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Describe your architecture, workflow, or system layout in the chat panel to render an interactive blueprint here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full bg-[#0A0A0A] bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] relative overflow-hidden select-none">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(10,10,10,1)_85%)] pointer-events-none" />

      <TransformWrapper
        initialScale={1}
        minScale={0.2}
        maxScale={4}
        centerOnInit={true}
        wheel={{ step: 0.1 }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            {/* Top Toolbar */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-zinc-900/50 backdrop-blur-md border border-white/10 rounded-full px-3 py-1.5 flex items-center gap-1 z-20 shadow-2xl">
              <button
                onClick={handleCopy}
                className="p-2 hover:bg-white/10 rounded-full text-zinc-300 hover:text-white transition-colors"
                title="Copy Mermaid Code"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={handleDownload}
                className="p-2 hover:bg-white/10 rounded-full text-zinc-300 hover:text-white transition-colors"
                title="Download PNG"
              >
                <Download className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-white/10 mx-1" />
              <button
                onClick={() => zoomIn()}
                className="p-2 hover:bg-white/10 rounded-full text-zinc-300 hover:text-white transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => zoomOut()}
                className="p-2 hover:bg-white/10 rounded-full text-zinc-300 hover:text-white transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => resetTransform()}
                className="p-2 hover:bg-white/10 rounded-full text-zinc-300 hover:text-white transition-colors"
                title="Fit to Screen"
              >
                <Maximize className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-white/10 mx-1" />
              <button
                onClick={handleRotate}
                className="p-2 hover:bg-white/10 rounded-full text-zinc-300 hover:text-white transition-colors"
                title="Rotate Orientation (TD/LR)"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Version History Navigation Bar */}
            {totalDiagrams > 0 && (
              <div className="absolute top-6 right-6 bg-zinc-900/50 backdrop-blur-md border border-white/10 rounded-full px-3 py-1.5 flex items-center gap-2 z-20 shadow-2xl">
                <History className="w-4 h-4 text-zinc-400" />
                <button
                  onClick={handlePrevDiagram}
                  disabled={currentIndex <= 0}
                  className="p-1 hover:bg-white/10 rounded-full text-zinc-300 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  title="Previous Version"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-medium text-zinc-300 px-1">
                  {currentIndex + 1} / {totalDiagrams}
                </span>
                <button
                  onClick={handleNextDiagram}
                  disabled={currentIndex >= totalDiagrams - 1}
                  className="p-1 hover:bg-white/10 rounded-full text-zinc-300 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  title="Next Version"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Pan & Zoom Canvas Area */}
            <TransformComponent
              wrapperClass="!w-full !h-full"
              contentClass="!w-full !h-full flex items-center justify-center p-12"
            >
              <div
                ref={canvasRef}
                className="bg-zinc-950/80 backdrop-blur-md border border-white/10 rounded-3xl p-10 shadow-2xl ring-1 ring-white/5 flex items-center justify-center"
              >
                <MermaidRenderer chart={currentMermaidCode} />
              </div>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}
