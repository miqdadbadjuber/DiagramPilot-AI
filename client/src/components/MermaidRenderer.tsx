"use client";

import React, { useEffect, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

interface MermaidRendererProps {
  chart: string;
  className?: string;
  onRenderSuccess?: () => void;
  onError?: (err: string) => void;
}

/**
 * Clean SVG tree by stripping script tags and event handlers natively.
 */
function sanitizeSvg(rawSvg: string): string {
  if (typeof window === "undefined") return rawSvg;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawSvg, "image/svg+xml");

    if (doc.querySelector("parsererror")) return rawSvg;

    // Remove script elements
    const scripts = doc.querySelectorAll("script");
    scripts.forEach((s) => s.remove());

    // Remove event handlers and inline script URLs
    const allElements = doc.querySelectorAll("*");
    allElements.forEach((el) => {
      Array.from(el.attributes).forEach((attr) => {
        if (
          attr.name.startsWith("on") ||
          attr.value.toLowerCase().includes("javascript:")
        ) {
          el.removeAttribute(attr.name);
        }
      });
    });

    return new XMLSerializer().serializeToString(doc.documentElement);
  } catch {
    return rawSvg;
  }
}

export function MermaidRenderer({
  chart,
  className = "",
  onRenderSuccess,
  onError,
}: MermaidRendererProps) {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    if (!chart || !chart.trim()) {
      setSvgContent(null);
      setIsLoading(false);
      return;
    }

    const renderDiagram = async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          securityLevel: "strict",
          fontFamily: "Inter, system-ui, sans-serif",
          themeVariables: {
            darkMode: true,
            background: "#09090b",
            primaryColor: "#18181b",
            primaryTextColor: "#f4f4f5",
            primaryBorderColor: "#3f3f46",
            lineColor: "#a1a1aa",
            secondaryColor: "#27272a",
            tertiaryColor: "#09090b",
          },
        });

        const id = `mermaid-svg-${Math.random().toString(36).substring(2, 9)}`;
        await mermaid.parse(chart);
        const { svg } = await mermaid.render(id, chart);

        if (isMounted) {
          const sanitized = sanitizeSvg(svg);
          setSvgContent(sanitized);
          setError(null);
          setIsLoading(false);
          if (onRenderSuccess) onRenderSuccess();
        }
      } catch (err: unknown) {
        if (isMounted) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to parse Mermaid diagram.";
          setError(errorMessage);
          setSvgContent(null);
          setIsLoading(false);
          if (onError) onError(errorMessage);
        }
      }
    };

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [chart, onRenderSuccess, onError]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-zinc-400 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
        <span className="text-sm font-medium tracking-wide">Rendering blueprint...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl bg-red-950/30 border border-red-900/50 rounded-2xl p-6 text-red-400 flex flex-col items-center text-center backdrop-blur-md">
        <AlertTriangle className="w-8 h-8 mb-3 text-red-400" />
        <h4 className="text-base font-semibold text-white mb-2">Mermaid Syntax Error</h4>
        <pre className="bg-red-950/60 p-4 rounded-xl w-full text-left overflow-x-auto text-xs font-mono whitespace-pre-wrap mb-3 border border-red-900/40 text-red-200">
          {error}
        </pre>
        <p className="text-xs text-zinc-400">Ask DiagramPilot in the chat to adjust the diagram structure.</p>
      </div>
    );
  }

  if (!svgContent) return null;

  return (
    <div
      className={`mermaid-container select-none ${className}`}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}

export default MermaidRenderer;
