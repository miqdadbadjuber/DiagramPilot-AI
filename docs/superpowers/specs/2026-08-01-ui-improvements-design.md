# Design Spec: DiagramPilot UI/UX Improvements

## Overview
This document outlines the UI and UX improvements for DiagramPilot AI to make it feel more like a modern, premium AI assistant (similar to Claude Artifacts and ChatGPT). 

## 1. Dynamic Loading Animation (AI Generation State)
**Problem:** The current bouncing dots animation feels generic and static.
**Solution:** Implement a dynamic loading state component that cycles through textual statuses to simulate AI "thinking".
- **Visuals:** A small, elegant spinner (e.g., `Loader2` from lucide-react with `animate-spin`) accompanied by transitioning text.
- **Dynamic Text Cycling:**
  - 0s - 1s: "Sedang berpikir..."
  - 1s - 3s: "Menganalisis kebutuhan arsitektur..."
  - 3s - 5s: "Merancang struktur sistem..."
  - 5s+: "Menyiapkan render diagram..."
- **Implementation:** Create a `useEffect` inside the `isGenerating` block in `ChatPanel` that sets a timer to cycle through these strings.

## 2. Artifact Navigation (Diagram Versioning)
**Problem:** Generating a new diagram overwrites the old one on the canvas, and navigating history relies on buttons inside the chat panel.
**Solution:** Implement a Claude-style vertical version switcher in the `DiagramCanvas`.
- **State Management:** `chatStore` will derive the list of all diagrams from the `messages` array (filtering those with `mermaidCode`). We will maintain a `currentDiagramIndex` to track the currently viewed version.
- **Visuals:** A floating control group on the middle-right edge of the canvas.
  - Up Arrow `[ ↑ ]` (disabled if at the newest/last index)
  - Text indicator (e.g., `1 of 2`)
  - Down Arrow `[ ↓ ]` (disabled if at the oldest/first index)
- **Behavior:** Clicking the arrows cycles the `currentMermaidCode` to the respective history item.

## 3. Diagram Rotation (Layout Toggle)
**Problem:** The rotation icon currently just resets the zoom, which is misleading.
**Solution:** Change the functionality to truly rotate the diagram's layout direction.
- **Logic:** We will regex-replace `graph TD` to `graph LR` (and vice versa) in the `currentMermaidCode` and re-render.
- **Icons:** 
  - Change the "Reset Zoom" icon to `Maximize` (or `Focus`).
  - Keep the `RotateCcw` or use `ArrowRightLeft` for the actual layout rotation feature.
