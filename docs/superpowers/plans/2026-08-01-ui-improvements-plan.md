# DiagramPilot UI/UX Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a dynamic loading animation, Claude-style artifact navigation for diagrams, and true diagram layout rotation.

**Architecture:** We will manage diagram history by deriving an array of valid diagrams from the `messages` array in the Zustand store. The canvas will add a floating navigation component that sets `currentMermaidCode` directly.

**Tech Stack:** React, TailwindCSS, Zustand, Lucide React

## Global Constraints

- Keep everything in a single page SPA pattern.
- Follow existing Tailwind styling.

---

### Task 1: Dynamic Loading Animation

**Files:**
- Modify: `client/src/components/ChatPanel/index.tsx`

**Interfaces:**
- Consumes: `isGenerating` from `useChatStore`.

- [ ] **Step 1: Add state and effect for loading text**
```tsx
import { useState, useRef, useEffect } from 'react';
import { Send, StopCircle, Bot, User, Loader2 } from 'lucide-react';
```
Add inside `ChatPanel`:
```tsx
  const [loadingText, setLoadingText] = useState("Sedang berpikir...");

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
```

- [ ] **Step 2: Update the loading UI in the return statement**
Replace the bouncing dots with `Loader2` and the dynamic text:
```tsx
            {isGenerating && (
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-sky-900/50 text-sky-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="p-4 flex items-center gap-3 text-zinc-400">
                  <Loader2 className="w-4 h-4 text-sky-400 animate-spin" />
                  <span className="text-sm font-medium">{loadingText}</span>
                </div>
              </div>
            )}
```

---

### Task 2: Artifact Navigation (Diagram Versioning)

**Files:**
- Modify: `client/src/components/DiagramCanvas/index.tsx`

**Interfaces:**
- Consumes: `messages`, `currentMermaidCode`, `setMermaidCode` from `useChatStore`.

- [ ] **Step 1: Import icons and get messages from store**
```tsx
import { Copy, ZoomIn, ZoomOut, Maximize, AlertTriangle, Download, ArrowUp, ArrowDown, ArrowRightLeft } from 'lucide-react';
// inside component
const { currentMermaidCode, messages, setMermaidCode } = useChatStore();
```

- [ ] **Step 2: Calculate diagram history and index**
```tsx
  const diagramHistory = messages.filter(m => m.mermaidCode).map(m => m.mermaidCode as string);
  const currentIndex = diagramHistory.indexOf(currentMermaidCode);
  const totalDiagrams = diagramHistory.length;

  const handlePrevDiagram = () => {
    if (currentIndex > 0) setMermaidCode(diagramHistory[currentIndex - 1]);
  };

  const handleNextDiagram = () => {
    if (currentIndex < totalDiagrams - 1) setMermaidCode(diagramHistory[currentIndex + 1]);
  };
```

- [ ] **Step 3: Render vertical navigation bar**
Add this floating container inside the main relative container (`<div className="flex-1 bg-zinc-950 flex flex-col relative overflow-hidden">`), right after the top Toolbar.
```tsx
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
```

---

### Task 3: Diagram Rotation Toggle

**Files:**
- Modify: `client/src/components/DiagramCanvas/index.tsx`

- [ ] **Step 1: Implement rotation logic**
Replace `RotateCcw` with `Maximize` for reset zoom, and add a new `ArrowRightLeft` for rotation.
```tsx
  const handleRotate = () => {
    if (!currentMermaidCode) return;
    let newCode = currentMermaidCode;
    if (newCode.includes('graph TD')) {
      newCode = newCode.replace('graph TD', 'graph LR');
    } else if (newCode.includes('graph LR')) {
      newCode = newCode.replace('graph LR', 'graph TD');
    } else if (newCode.includes('flowchart TD')) {
      newCode = newCode.replace('flowchart TD', 'flowchart LR');
    } else if (newCode.includes('flowchart LR')) {
      newCode = newCode.replace('flowchart LR', 'flowchart TD');
    } else {
      toast.error('Rotation not supported for this diagram type');
      return;
    }
    setMermaidCode(newCode);
    toast.success('Diagram rotated');
  };
```

- [ ] **Step 2: Update Toolbar Buttons**
Replace the old `handleReset` button with these two:
```tsx
        <button onClick={handleReset} className="p-2 hover:bg-zinc-700 rounded text-zinc-300 hover:text-white transition-colors" title="Fit to Screen">
          <Maximize className="w-4 h-4" />
        </button>
        <div className="w-px h-8 bg-zinc-700 mx-1" />
        <button onClick={handleRotate} className="p-2 hover:bg-zinc-700 rounded text-zinc-300 hover:text-white transition-colors" title="Rotate Layout (TD/LR)">
          <ArrowRightLeft className="w-4 h-4" />
        </button>
```
