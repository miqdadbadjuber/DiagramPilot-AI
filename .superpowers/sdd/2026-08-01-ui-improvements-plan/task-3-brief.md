# Task 3: Diagram Rotation Toggle

**Files:**
- Modify: `client/src/components/DiagramCanvas/index.tsx`

**Interfaces:**
- Consumes: `currentMermaidCode`, `setMermaidCode` from `useChatStore`.

- [ ] **Step 1: Implement rotation logic**
Add this function before the return statement. It toggles layout between Top-Down and Left-Right.
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
In the absolute positioned Toolbar div, replace the old `handleReset` button (which used `RotateCcw`) with a `Maximize` button for reset, and an `ArrowRightLeft` button for rotation:
```tsx
        <button onClick={handleReset} className="p-2 hover:bg-zinc-700 rounded text-zinc-300 hover:text-white transition-colors" title="Fit to Screen">
          <Maximize className="w-4 h-4" />
        </button>
        <div className="w-px h-8 bg-zinc-700 mx-1" />
        <button onClick={handleRotate} className="p-2 hover:bg-zinc-700 rounded text-zinc-300 hover:text-white transition-colors" title="Rotate Layout (TD/LR)">
          <ArrowRightLeft className="w-4 h-4" />
        </button>
```
