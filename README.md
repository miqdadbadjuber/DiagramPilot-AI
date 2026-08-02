# DiagramPilot AI 🚀

DiagramPilot AI is a production-ready, AI-native assistant that helps developers, system architects, and engineers automatically generate architecture diagrams from natural language conversations. It seamlessly converts architectural descriptions into Mermaid.js blueprints through a sleek, premium, and spacious UI.

## Features ✨
- **AI-Powered Generation:** Talk to DiagramPilot (powered by Gemini 3.5 Flash) to generate and iterate on architecture diagrams.
- **Interactive Canvas:** Built-in interactive diagram viewer with zoom, pan, fit-to-screen, rotate, and export features.
- **Version History:** Track the changes of your diagrams and easily jump between previous iterations.
- **Quota Management:** Fair-use quota system to ensure server stability.
- **Responsive & Premium UI:** Designed with Tailwind CSS and Radix-inspired aesthetics.

## Architecture 🏗️
DiagramPilot uses a decoupled Monorepo structure:
1. **Client:** Next.js 13+ (App Router) handling the UI, diagram rendering (Mermaid.js), and local state (Zustand).
2. **Server:** Express.js REST API acting as an AI proxy, managing CORS, rate limits, schema validation (Zod), and Gemini AI integration.

## Tech Stack 💻
- **Frontend:** Next.js, React 19, Tailwind CSS v4, Zustand, Lucide Icons, Mermaid.js
- **Backend:** Node.js, Express.js, Google Gen AI SDK, Zod, Express Rate Limit
- **Language:** TypeScript

## Installation 🛠️
1. Clone the repository:
   ```bash
   git clone https://github.com/miqdadbadjuber/DiagramPilot-AI.git
   cd diagrampilot-ai
   ```
2. Install dependencies for both client and server:
   ```bash
   npm run postinstall
   ```

## Environment Variables 🔐
Create a `.env` file inside the `server/` directory:
```env
# server/.env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
CLIENT_URL=http://localhost:3000
```

## Run Project 🚀
You can run both the frontend and backend concurrently using the root workspace:
```bash
npm run dev
```
Alternatively, you can run them separately:
- **Client:** `cd client && npm run dev`
- **Server:** `cd server && npm run dev`

## Folder Structure 📂
```text
/
├── client/          # Next.js 13+ App Router (Frontend)
│   ├── public/      # Static assets
│   └── src/         # UI Components, App Routing, State (Zustand)
├── server/          # Express.js (Backend Proxy)
│   └── src/         # API Routes, AI Services, Config
├── package.json     # Monorepo Scripts
└── README.md        # You are here
```

## Roadmap 🔮
- **User Authentication:** Integrate NextAuth or Supabase for persistent user accounts.
- **Cloud Storage:** Save and sync diagrams across devices using a database (e.g., PostgreSQL).
- **Pro Tier:** Upgrade quotas and unlock advanced diagram types.
- **Export Formats:** Add PDF export support.

## Repository Link 🔗
[https://github.com/miqdadbadjuber/DiagramPilot-AI](https://github.com/miqdadbadjuber/DiagramPilot-AI)

## Author 👤
**Miqdad Badjuber**

## License 📜
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
