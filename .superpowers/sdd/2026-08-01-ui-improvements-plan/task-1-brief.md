# Task 1: Dynamic Loading Animation

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
