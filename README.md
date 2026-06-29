# Sanju Career OS

Local-first career and placement tracker with a React + TypeScript frontend, Express backend, Prisma, PostgreSQL, Zustand persistence, and a secure Groq proxy.

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
