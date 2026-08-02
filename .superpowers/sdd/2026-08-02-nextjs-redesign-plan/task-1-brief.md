# Task 1: Scaffold Next.js Application

**Goal:** Backup the old Vite app and scaffold the new Next.js app in the `client` folder.

**Files:**
- Modify: `client-old/` (Backup)
- Create: `client/` (New Next.js App)

- [ ] **Step 1: Backup existing client folder**
```powershell
Rename-Item -Path "client" -NewName "client-old"
```

- [ ] **Step 2: Scaffold Next.js App**
```powershell
npx -y create-next-app@latest client --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

- [ ] **Step 3: Install Required Dependencies**
```powershell
cd client
npm install zustand lucide-react motion mermaid react-zoom-pan-pinch react-markdown
```

- [ ] **Step 4: Copy Static Assets**
```powershell
Copy-Item -Path "..\client-old\public\logo_diagrampilot.png" -Destination "public\logo_diagrampilot.png"
```
