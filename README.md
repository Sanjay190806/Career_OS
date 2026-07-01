# Sanju Career OS - v1.7.2

> **Release:** v1.7.2 Database + Auth Stability Repair - local-first mode remains available while account/cloud features report safe database diagnostics.

Local-first career and placement tracker with a React + TypeScript frontend, Express backend, Prisma, PostgreSQL, Zustand persistence, AI Brain, Smart Daily Planner, Placement OS, Learning OS, Analytics 2.0, German Academy, optional manual database snapshots, PWA shell, and offline fallback support.

## v1.7.2 Stability (current)

- Unified sync layer with honest UI labels (local-first + manual DB snapshot).
- Added backend routes: `/api/sync/health`, `/api/sync/push`, `/api/sync/pull` (legacy `/api/sync` kept).
- Full backup registry covering 30 localStorage module keys.
- Safe restore with validation summary, pre-restore snapshot, and confirmation.
- Mounted PWA install/update prompts; single canonical `manifest.webmanifest`.
- Improved service worker shell caching; API responses not cached.
- Root `npm run build` alias added.

See `docs/SYNC.md`, `docs/BACKUP_RESTORE.md`, `docs/PWA.md`, `docs/OFFLINE_MODE.md`.

## Build

```powershell
npm run build          # frontend + backend
npm run check:all      # typecheck + tests + build
npm run icons:pwa      # regenerate PNG icons
```

Normal daily use: run `Start-Sanzz-OS.bat` or `npm run dev:all`. Prisma validate/migrate only needed when changing database schema or first-time DB setup — not required for every startup.

## v1.6.1 Changelog (Learning OS + Analytics 2.0)

- Added Learning OS with default career learning paths, session logging, mastery tracking, revision queue, weak areas, milestones, and recommendations.
- Added Analytics 2.0 with study hours, XP, skill breakdown, readiness, burnout, completion, and focus balance signals.
- Integrated Learning OS signals into Smart Planner, AI Brain, dashboard widgets, and AI commands.
- Kept persistence local-first with versioned keys: `sanzz_os_learning_os_v1`, `sanzz_os_learning_sessions_v1`, `sanzz_os_revision_items_v1`, and `sanzz_os_analytics_cache_v1`.

## v1.6.0 Changelog (AI Brain + Smart Planner + Placement OS)

- Added AI Brain career context summaries for Sanju's B.E. ECE placement path.
- Added Smart Daily Planner with Normal, Busy, Low Energy, Placement Sprint, Project Build, and Revision modes.
- Added Placement OS with target companies, application statuses, OA/interview surfaces, resume checklist, and readiness scoring.
- Added dashboard intelligence widgets and AI command intents for the new systems.
- Kept persistence local-first with versioned keys: `sanzz_os_ai_brain_v1`, `sanzz_os_smart_planner_v1`, and `sanzz_os_placement_os_v1`.

## v1.4.1 Changelog (Stabilization & UX Audit Release)

- **Landing Page & Routing**: Rebuilt a custom state popstate router to synchronize pathname changes with UI store states. Public routes (`/`, `/landing`, `/portfolio`) load immediately without rendering the AppShell.
- **Cinematic Landing Page**: Redesigned `LandingPage.tsx` with high-impact recruiter-ready sections (Hero, badge, problems, solutions, modules, tech stack, and portfolio CTA) without private details or sidebar.
- **Premium Static Background**: Disabled childish mouse-aura canvas and particle grids. Implemented a static HSL dark gradient and subtle line-grid background inside `NeonAtmosphere.tsx`.
- **Shayla AI Chat Stabilization**: Fixed height collapse bugs in chat viewport. Embedded model status details, dynamic token context usage indicators, and real-time response latency tracker under the Shayla topbar.
- **XSS Sanitization & Security Hardening**: Implemented robust string and URL sanitizers inside `securityUtils.ts` to secure all Markdown rendering points.
- **Global Toast Notification System**: Added global toast store and UI overlay for error/success notifications.
- **State Versioning & Fallbacks**: Configured state version `141` on all local persisted stores with schema recovery fallbacks. Added a System Health Maintenance card to Settings.
- **Lazy Loading**: Integrated React Suspense and dynamic imports for heavy subpages, decreasing bundle load footprint.
- **Keyboard Navigation Shortcuts**: Built a global shortcut manager Hook (`useGlobalShortcuts.ts`) and modal dialog for quick keys (e.g. typing `g` then `d` to go to Dashboard).
- **UX Refinements**: Collapsible Daily Briefing logs, optional German tracker hidden under expander card, compact mock interview counters, status legend on calendar, and categorized drawer tasks.

## v1.1 Changelog

- Stabilized the German module with 30 lessons, a lesson drawer, XP, streaks, notes, quizzes, and Shayla lesson help.
- Added Shayla AI Mentor as the consistent AI identity across German, Roadmap, Today, Overview, Resume, Projects, Reports, and Settings.
- Hardened Groq backend-only integration with status, test, chat, streaming, fallback, and friendly error handling.
- Fixed Settings health checks and sync backup prototype false positives.
- Polished Roadmap filtering so topic filters come from the actual 180-day / 360-problem roadmap.
- Cleaned DSA Tracker and SkillRack labels for daily use.

## Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, Zustand
- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL in Docker
- ORM: Prisma
- AI: Groq via backend proxy

## Prerequisites

1. Install WSL 2 on Windows.
2. Install Ubuntu 24.04 in WSL.
3. Install Docker Desktop.
4. Enable Docker Desktop's WSL 2 backend.
5. Verify the tools:

```powershell
docker --version
docker compose version
wsl --list --verbose
```

## Local Setup

### 1. Install dependencies

From the project root:

```powershell
npm install
```

### 2. Start PostgreSQL

From the project root:

```powershell
docker compose up -d
```

The database runs with:

- host: `localhost`
- port: `5432`
- database: `sanju_career_os`
- username: `postgres`
- password: `password`

### 3. Create the backend env file

From the `backend` directory:

```powershell
Copy-Item .env.example .env
```

Edit `backend/.env` and add your real `GROQ_API_KEY`.
The Groq key must stay in `backend/.env` and never be added to the frontend.

Correct:

```env
GROQ_API_KEY="gsk_xxxxxxxxx"
```

Do not include `Bearer` in the env file.

### 4. Prisma workflow

Run Prisma commands from the `backend` directory so Prisma reads `backend/.env`:

```powershell
cd backend
npx prisma validate
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
```

### 5. Run the app

From the project root:

```powershell
npm run dev:frontend
```

In another terminal:

```powershell
npm run dev:backend
```

## Useful Commands

```powershell
npm run build --workspace=frontend
npm run build --workspace=backend
npm run db:up
npm run db:down
npm run db:logs
npm run db:restart
```

## Health Checks

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:5000/api/health`
- AI status: `http://localhost:5000/api/ai/status`

Use Settings to run:

- Test Groq
- Test Shayla
- Clear AI history

## German Module

Open the German route from the sidebar. Lesson 1 is unlocked by default, and each completed lesson unlocks the next one. Completed lessons remain reviewable. The lesson drawer includes vocabulary, grammar, examples, a mini quiz, notes, Ask Shayla, and Complete Lesson.

## Shayla AI Mentor

Shayla is the app's German learning companion, Java DSA guide, resume reviewer, project coach, and daily accountability partner. The frontend never stores Groq keys; all AI requests go through the backend `/api/ai/*` endpoints.

## Troubleshooting

### Docker not recognized

Cause: Docker Desktop is not installed or not on PATH.

Fix:

1. Install Docker Desktop.
2. Restart Windows.
3. Open Docker Desktop.
4. Verify `docker --version`.

### WSL has no distributions

Fix:

```powershell
wsl --install -d Ubuntu-24.04
```

### `DATABASE_URL` not found

Fix:

```powershell
cd backend
Copy-Item .env.example .env
```

### Prisma EPERM on Windows

Fix:

```powershell
taskkill /F /IM node.exe
Remove-Item -Recurse -Force .\node_modules.prisma
cd backend
npx prisma generate
```

### Frontend looks raw or unstyled

Check:

1. `frontend/src/main.tsx` imports `./styles/globals.css`.
2. `frontend/tailwind.config.js` includes `./src/**/*.{js,ts,jsx,tsx}`.
3. `frontend/postcss.config.js` exists and loads Tailwind + Autoprefixer.

### Groq is not working

Fix:

1. Add a real `GROQ_API_KEY` in `backend/.env`.
2. Restart the backend.
3. Check `http://localhost:5000/api/ai/status`.
4. Use Settings to test Groq and Shayla.

### German page compile error

Ensure `frontend/src/data/germanLessons.ts` exists and exports `GERMAN_LESSONS`.

### Settings page crash

Ensure `frontend/src/services/syncService.ts` exports both `checkBackendHealth` and the compatibility health method used by Settings.

### Sync rejects text containing prototype

v1.1 scans dangerous object keys only. Text values like `prototype dashboard` are allowed. If sync still fails, inspect the JSON keys for `__proto__`, `constructor`, or `prototype`.

### Groq rejected the API key

Fix:

1. Verify the key starts with `gsk_`.
2. Do not include `Bearer` in the env file.
3. Remove spaces or newlines around the key.
4. Make sure you edited `backend/.env`, not `.env.example`.
5. Restart the backend.
6. Create a fresh Groq key if needed.
7. Test again with `POST /api/ai/test`.

### Port already in use

Fix:

1. Stop the process using the port.
2. Or change `PORT` in `backend/.env`.

## Notes

- Do not commit `backend/.env`.
- Keep Zustand persistence enabled.
- Keep the Groq API key backend-only.
