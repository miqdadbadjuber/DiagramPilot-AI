# Task 2: Artifact Navigation (Diagram Versioning)

**Files:**
- Modify: `client/src/components/DiagramCanvas/index.tsx`

**Interfaces:**
- Consumes: `messages`, `currentMermaidCode`, `setMermaidCode` from `useChatStore`.

- [ ] **Step 1: Import icons and get messages from store**
```tsx
import { Copy, ZoomIn, ZoomOut, Maximize, AlertTriangle, Download, ArrowUp, ArrowDown, ArrowRightLeft } from 'lucide-react';
// inside component, update useChatStore destructuring to include messages and setMermaidCode
const { currentMermaidCode, messages, setMermaidCode } = useChatStore();
```

- [ ] **Step 2: Calculate diagram history and index**
Add these derivations inside `DiagramCanvas` before the return statement:
```tsx
  const diagramHistory = messages.filter(m => m.mermaidCode).map(m => m.mermaidCode as string);
  const currentIndex = diagramHistory.indexOf(currentMermaidCode as string);
  const totalDiagrams = diagramHistory.length;

  const handlePrevDiagram = () => {
    if (currentIndex > 0) setMermaidCode(diagramHistory[currentIndex - 1]);
  };

  const handleNextDiagram = () => {
    if (currentIndex < totalDiagrams - 1) setMermaidCode(diagramHistory[currentIndex + 1]);
  };
```

- [ ] **Step 3: Render vertical navigation bar**
Add this floating container inside the main relative container (`<div className="flex-1 bg-zinc-950 flex flex-col relative overflow-hidden">`), right after the top Toolbar. (It should be visible if totalDiagrams > 0, but if it's 0 it will return early anyway due to the `!currentMermaidCode` return).
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
