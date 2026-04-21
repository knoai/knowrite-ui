<p align="center">
  <img src="https://img.shields.io/badge/Knowrite_UI-Novel%20Writing%20Studio-6366f1?style=for-the-badge&logo=react&logoColor=white" alt="Knowrite UI">
</p>

<h1 align="center">Knowrite Novel Writing Studio<br><sub>Novel Writing Studio · React + Vite</sub></h1>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React"></a>
  <a href="#"><img src="https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white" alt="Vite"></a>
  <a href="#"><img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License: MIT"></a>
  <a href="#"><img src="https://img.shields.io/badge/Node.js-24+-339933?logo=nodedotjs&logoColor=white" alt="Node.js"></a>
</p>

<p align="center">
  <a href="README.md">English</a> | <a href="README.zh.md">简体中文</a>
</p>

---

AI-driven novel creation visualization workbench — watch 7 Agents collaborate to write a novel in real-time, with Fitness quality scores at a glance and one-click world-building management. Built with React 19 + Vite + Tailwind CSS v4, open-sourced under MIT license.

**Knowrite UI** is the companion frontend for the [`knowrite`](https://github.com/knoai/knowrite) novel writing engine, connecting to the backend via standard HTTP / SSE, zero-config dev environment, ready to use out of the box.

> **Model Configuration**: The frontend no longer has any built-in default Provider or model. Users must add their own OpenAI-compatible Provider in "Settings → Model Config" (e.g. Bailian, DeepSeek, Ollama, etc.), fill in Base URL, API Key, and model list, then assign models to each role.

---

## Quick Start

### Requirements

- Node.js 24+
- Backend service [`knowrite`](https://github.com/knoai/knowrite) running (default `http://localhost:8000`)
- ⚠️ **First-time setup: You MUST configure models first**: Open "Settings → Model Config", add a Provider and assign models to each role

### Installation

```bash
# Clone frontend repo
git clone https://github.com/knoai/knowrite-ui.git
cd knowrite-ui

# Install dependencies
npm install

# Start dev server
npm run dev
# Frontend runs at http://localhost:5173, auto-proxies to backend
```

### Environment Variables

```bash
# Copy environment variable template
cp .env.example .env
```

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE` | Backend API address | `http://localhost:8000` |
| `VITE_AUTH_TOKEN` | Auth token (if backend has AUTH_TOKEN enabled) | — |

```
VITE_API_BASE=http://localhost:8000
VITE_AUTH_TOKEN=your-token-here
```

### Production Build

```bash
npm run build        # Output to dist/ directory
npm run preview      # Preview production build
```

The build output is a pure static SPA, deployable via any CDN / Nginx / backend serve.

---

## Core Features

### Real-Time Creation Flow Visualization

SSE streaming display of the complete Writer → Editor → Humanizer → Proofreader → Reader → Summarizer collaboration process:

- **Agent Status Dashboard**: Real-time display of each Agent's execution status and output content
- **Streaming text rendering**: Writer's draft flows in word by word, Editor's review comments appear instantly
- **Edit loop tracking**: Editor revision rounds, pass rate, historical comment comparison
- **One-click retry**: If any Agent step fails, you can retry that step individually

### Fitness Quality Dashboard

Automatically displays five-dimensional quality radar chart after each chapter:

| Dimension | Display Content |
|-----------|-----------------|
| **Word Count** | Target vs actual word count comparison, deviation bar chart |
| **Repetition** | Content repetition heatmap with historical chapters |
| **Review** | Editor dimension-level pass/fail checklist |
| **Reader** | Simulated reader feedback score (immersion / pacing / character identification) |
| **Coherence** | Outline deviation detection severity (low/medium/high) |

Supports inter-chapter Fitness trend comparison for quickly locating quality drops.

### Work & Chapter Management

- **Work list**: All work cards, showing current progress, latest Fitness average, volume count
- **New work**: Choose genre style (Fanqie/Qidian/Feilu), creation strategy (knowrite/pipeline), target model
- **Chapter details**: Multi-version switching (raw / edited / humanized / final), per-version diff comparison
- **Review records**: Structured display of Editor's per-round review results with dimension-level pass/fail markers

### World-Building Visual Editor

Complete work worldview management panel:

| Entity | Function |
|--------|----------|
| **Character Cards** | Character profiles (name/identity/appearance/personality/relationship network), relationship graph |
| **Plot Lines** | Main/sub-plot structure tree, node status tracking (not started / in progress / completed) |
| **Map** | Region drawing, connectivity relationships, force distribution |
| **Lore** | Worldview entries, historical events, force settings, rule systems |

All data is synced to the backend SQLite database via REST API in real-time, automatically injected into Agent context during writing.

### Prompt Management & Experimentation

- **Template browsing**: View all Prompt templates for Writer / Editor / Summarizer etc.
- **Custom rules**: Override default Prompts, inject personal creative preferences
- **Prompt evolution experiment**: Select historical low-score chapters, one-click run Prompt variant experiment, compare Fitness improvement

### Settings Center

- **Model Config**: Fully custom Provider (any OpenAI-compatible interface), assign dedicated models for Writer/Editor/Humanizer etc. roles, support multi-model rotation
- **Review Dimensions**: Toggle Editor review dimensions (industrial mode 33 items / free mode 3 items)
- **Author Style Library**: Import/manage author style fingerprints, auto-injected during writing
- **Engine Parameters**: Context window, edit rounds, truncation limits and other advanced tuning

---

## Page Structure

| Route | Function | Core API |
|-------|----------|----------|
| `/` | Work list | `GET /api/novel/works` |
| `/create` | New work | `POST /api/novel/start` (SSE) |
| `/works/:workId` | Work details (chapter list, Fitness dashboard, review records) | `GET /api/novel/works/:workId` |
| `/works/:workId/chapter/:num` | Chapter reader (multi-version switching + diff comparison) | `GET /api/novel/works/:workId` |
| `/works/:workId/write` | Continue next chapter (real-time creation flow) | `POST /api/novel/continue` (SSE) |
| `/settings` | Global settings (models/dimensions/style/engine params) | `GET/POST /api/settings` |
| `/world/:workId` | Worldview panel (characters/plotlines/maps/lore) | `GET/POST/PUT/DELETE /api/world/...` |
| `/templates` | Template pattern management | `GET/POST /api/templates` |
| `/prompts` | Prompt template browsing and experimentation | `GET /api/prompts`, `POST /api/evolve` |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Build Tool | Vite 6 |
| Routing | react-router-dom v7 |
| Styling | Tailwind CSS v4 |
| Icons | lucide-react |
| State Management | React Hooks + Context |
| Data Fetching | Native fetch + EventSource (SSE) |
| Build Output | SPA (Single Page Application) |
| License | MIT |

---

## Project Structure

```
knowrite-ui/
├── src/
│   ├── pages/           # Page components
│   │   ├── Home.jsx           # Work list
│   │   ├── CreateWork.jsx     # New work
│   │   ├── WorkDetail.jsx     # Work details + Fitness dashboard
│   │   ├── ChapterViewer.jsx  # Chapter reader (multi-version switching)
│   │   ├── WriteStream.jsx    # Real-time creation flow (SSE)
│   │   ├── Settings.jsx       # Global settings
│   │   ├── WorldPanel.jsx     # Worldview panel
│   │   ├── Templates.jsx      # Template pattern management
│   │   └── PromptLab.jsx      # Prompt experiments
│   ├── components/      # Reusable UI components
│   │   ├── FitnessRadar.jsx   # Fitness radar chart
│   │   ├── AgentStatus.jsx    # Agent status card
│   │   ├── CharacterCard.jsx  # Character card
│   │   ├── PlotTree.jsx       # Plotline tree
│   │   └── MapCanvas.jsx      # Map canvas
│   ├── api/             # API wrappers
│   │   ├── client.js          # fetch wrapper + auth
│   │   ├── sse.js             # EventSource streaming requests
│   │   └── novel.js           # Novel-related APIs
│   ├── hooks/           # Custom React Hooks
│   │   ├── useSSE.js          # SSE streaming data Hook
│   │   ├── useFitness.js      # Fitness data Hook
│   │   └── useWorld.js        # Worldview data Hook
│   ├── context/         # React Context
│   │   └── AppContext.jsx     # Global state
│   └── main.jsx         # App entry
├── public/              # Static assets
├── index.html           # HTML entry
├── vite.config.js       # Vite config
├── tailwind.config.js   # Tailwind config
└── package.json         # Dependencies
```

---

## Backend Integration

The frontend connects to the backend using standard `fetch` and `EventSource`, no special proxy config needed:

```javascript
// Regular request
fetch(`${apiBase}/api/novel/works/${workId}`)

// SSE streaming request (creation pipeline)
const source = new EventSource(`${apiBase}/api/novel/continue?workId=${workId}`)
source.onmessage = (e) => {
  const data = JSON.parse(e.data)
  // { agent: 'writer', stage: 'generating', content: '...' }
}
```

CORS is enabled by default on the backend, frontend can call cross-origin directly.

---

## Deployment

### Standalone Deployment (Recommended)

```bash
npm run build
# Deploy dist/ directory to any static server
# Nginx / Vercel / Netlify / Cloudflare Pages / GitHub Pages
```

### Integrated Frontend-Backend Deployment

Configure the backend `config/network.json` to serve the frontend build output as static files:

```json
{
  "staticDir": "../../knowrite-ui/dist",
  "spaFallback": "../../knowrite-ui/dist/index.html"
}
```

After starting the backend, visit `http://localhost:8000` to use the complete application.

---

## Product Matrix

Knowrite UI is the **novel creation scenario interface** for the knowrite engine. The engine supports multi-scenario reuse:

| Product | Frontend Repo | Scenario | Status |
|---------|--------------|----------|--------|
| **Novel Writing** | `knowrite-ui` | Long-form fiction / web novels / IP development | ✅ Live |
| **Desktop** | `knowrite-desktop` (branch) | Electron desktop client, offline work management | 🚧 Branch in development |
| **Cloud Docs** | `knowrite-docs` (planned) | White papers / technical docs / reports | 🚧 Planned |
| **Tech Books** | `knowrite-techbook` (planned) | Technical tutorials / books / course materials | 🚧 Planned |
| **SaaS Platform** | Unified admin backend | Multi-tenant / paid subscriptions / team collaboration | 🚧 Planned |

All frontends share the same backend API (`knowrite`), switching different creation modes via the `strategy` parameter.

---

## Roadmap

- [x] Work management (create / list / details)
- [x] Real-time creation flow visualization (SSE Agent status dashboard)
- [x] Fitness quality dashboard (five-dimensional radar chart + trend comparison)
- [x] Chapter multi-version reading (raw / edited / humanized / final)
- [x] World-building visual editor (characters / plotlines / maps / lore)
- [x] Prompt template browsing and customization
- [x] Global settings (models / review dimensions / author style / engine params)
- [x] Fully user-defined model config (dynamic Provider/role assignment)
- [ ] Chapter diff comparison view
- [ ] Creation data statistics panel (word count trends / hook recovery rate / character appearance frequency)
- [ ] i18n multi-language support (zh / en / ja)
- [ ] Dark mode
- [ ] Desktop client (Electron branch)
- [ ] SaaS multi-tenant login and permission management

---

## Contributing

Welcome code contributions, issues, and PRs.

```bash
npm install
npm run dev        # Development mode (HMR hot reload)
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # ESLint check
```

---

## License

**MIT License**

- ✅ Free for commercial use, modification, and distribution
- ✅ Allowed to integrate into commercial products
- ✅ Allowed to develop derivatives and keep closed-source

Backend [`knowrite`](https://github.com/knoai/knowrite) uses the AGPL-3.0 license. The frontend and backend licenses are separate; frontend code is not restricted by the backend AGPL-3.0.

---

> Backend repo: [`knowrite`](https://github.com/knoai/knowrite) (AGPL-3.0) | Frontend repo: `knowrite-ui` (MIT) | Roadmap: `docs/ROADMAP.md`
