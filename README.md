<<<<<<< HEAD
# SanzzOS

<p align="center">
  <img src="frontend/public/icons/icon-512.png" alt="SanzzOS logo" width="128" />
</p>

<h3 align="center">Sanju Career OS - a local-first career command center for placements, coding practice, learning, projects, and focused daily execution.</h3>

<p align="center">
  <a href="https://github.com/Sanjay190806/Career_OS"><img src="https://img.shields.io/badge/roadmap-v2.2_complete-16a34a?style=for-the-badge" alt="Roadmap v2.2 complete" /></a>
  <a href="docs/LOCAL_MODE.md"><img src="https://img.shields.io/badge/local--first-enabled-2563eb?style=for-the-badge" alt="Local-first" /></a>
  <a href="docs/OFFLINE_MODE.md"><img src="https://img.shields.io/badge/offline-ready-7c3aed?style=for-the-badge" alt="Offline ready" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-0f766e?style=for-the-badge" alt="MIT license" /></a>
</p>

<p align="center">
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react" alt="React" /></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript" alt="TypeScript" /></a>
  <a href="https://vitejs.dev"><img src="https://img.shields.io/badge/Vite-5-646cff?style=flat-square&logo=vite" alt="Vite" /></a>
  <a href="https://expressjs.com"><img src="https://img.shields.io/badge/Express-4-111827?style=flat-square&logo=express" alt="Express" /></a>
  <a href="https://www.prisma.io"><img src="https://img.shields.io/badge/Prisma-5-2d3748?style=flat-square&logo=prisma" alt="Prisma" /></a>
  <a href="https://www.postgresql.org"><img src="https://img.shields.io/badge/PostgreSQL-15-4169e1?style=flat-square&logo=postgresql" alt="PostgreSQL" /></a>
  <a href="https://github.com/pmndrs/zustand"><img src="https://img.shields.io/badge/Zustand-4-443e38?style=flat-square" alt="Zustand" /></a>
</p>

---

## Snapshot

SanzzOS is a personal productivity and placement preparation system built around one idea: your career data should be useful every day without forcing you into a cloud account first. The app runs locally, stores core tracker data in the browser, and can optionally use the backend, PostgreSQL, and provider-backed AI features when you configure them.

The project roadmap is now complete through **v2.2**, including the daily coding reset and backup import restore fixes.

| Area | What it does |
| --- | --- |
| Today Workspace | Daily tasks, focus sessions, energy mode planning, streaks, XP, and quick execution loops. |
| Daily Coding | CodeChef Java and SkillRack daily targets with shared Today state, XP rules, and LeetCode scheduling. |
| Placement OS | Company tracking, applications, interviews, resumes, online assessments, and readiness views. |
| Learning OS | Structured learning paths, skill progress, notes, milestones, and analytics. |
| German Academy | Local German study workspace with lessons, vocabulary, practice, and review flow. |
| Shayla AI | Optional AI mentor/chat layer through the backend when provider keys are configured. |
| Backup System | Export/import support designed to restore XP, streaks, and coding state reliably. |
| Portfolio Mode | Recruiter-safe public/demo surface that avoids exposing private local data. |

---

## v2.2 Milestone Board

| Version | Status | Focus |
| --- | --- | --- |
| v2.2 | Complete | Daily coding reset, CodeChef/SkillRack Today state, LeetCode start-date logic, XP cap rules, and backup import XP/streak restore reliability. |
| v2.1 | Complete | Backup/snapshot stability, local-first sync hardening, dashboard resilience, and safer restore behavior. |
| v2.0 | Complete | Career OS workspace foundation: Today, Placement OS, Learning OS, German Academy, analytics, portfolio, and AI-assisted planning. |
| v1.7.x | Stable base | Local-first fallback behavior, backend/database guardrails, and offline-ready shell. |

### v2.2 Daily Coding Rules

- CodeChef Java: 5 problems per day.
- SkillRack: 5 problems per day.
- LeetCode: scheduled to become active on August 1, 2026.
- Active DSA XP: reset for the new plan and capped at 125 XP per active day.
- Today Workspace: daily coding progress appears in the same daily execution surface.
- Backup Import: restored backups rehydrate XP, streaks, and coding progress instead of only importing raw data.

---

## How SanzzOS Thinks

```mermaid
flowchart LR
    User["You"] --> Today["Today Workspace"]
    Today --> Coding["Daily Coding"]
    Today --> Focus["Focus Timer"]
    Today --> Tasks["Task Plan"]

    Coding --> XP["XP + Streak Engine"]
    Tasks --> XP
    Focus --> XP

    XP --> Analytics["Analytics + Readiness"]
    Analytics --> Placement["Placement OS"]
    Analytics --> Learning["Learning OS"]
    Analytics --> German["German Academy"]

    Today --> Backup["Backup Export / Import"]
    Backup --> Restore["XP + Streak Restore"]

    Backend["Optional Backend"] --> Database["PostgreSQL + Prisma"]
    Backend --> AI["Provider-backed Shayla AI"]
    Today -. optional sync .-> Backend
```

The frontend is the main daily driver. The backend adds optional account/snapshot/database and AI proxy features. If the backend or database is not running, the local tracker can still be useful.

---

## Tech Stack

| Layer | Tools |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| State | Zustand with persisted local stores |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL, Prisma |
| Desktop/local tooling | Windows batch scripts, Docker Compose, npm workspaces |
| Offline support | PWA manifest, service worker, local-first fallback docs |
| AI | Backend-proxied provider support when configured; tracker remains usable without keys |

---

## Quick Start

### 1. Clone the repo

```powershell
git clone https://github.com/Sanjay190806/Career_OS.git
cd Career_OS
```

### 2. Install dependencies

```powershell
npm install
```

If PowerShell blocks npm scripts on Windows, use:

```powershell
cmd /c npm install
```

### 3. Start the app

Fast path:

```powershell
.\Start-Sanzz-OS.bat
```

Manual path:

```powershell
cmd /c npm run dev:all
```

Typical local URLs:

| Service | URL |
| --- | --- |
| Frontend | `http://localhost:5173` |
| Backend API | `http://localhost:3001` |

PostgreSQL/backend setup is mainly needed for account, cloud/snapshot, database, or backend AI features. For pure local tracking, the frontend can still carry the main workflow.

---

## Full Local Setup

### Start PostgreSQL

```powershell
cmd /c npm run db:up
```

### Configure backend env

```powershell
cd backend
copy .env.example .env
```

Update `backend/.env` only with your own local values. Keep real secrets out of git.

### Initialize Prisma
=======
# Sanju Career OS

![Version](https://img.shields.io/badge/version-1.7.2-blue)
![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20TypeScript-61dafb)
![Backend](https://img.shields.io/badge/backend-Express%20%2B%20Prisma-111827)
![Storage](https://img.shields.io/badge/storage-local--first-16a34a)
![Database](https://img.shields.io/badge/database-PostgreSQL-336791)
![PWA](https://img.shields.io/badge/PWA-installable-f59e0b)
![AI](https://img.shields.io/badge/AI-Shayla%20Mentor-a855f7)
![License](https://img.shields.io/badge/license-MIT-informational)

> A local-first career operating system for placement preparation, Java coding discipline, SkillRack practice, SQL, CS core, German learning, resume/project tracking, AI-assisted planning, analytics, backup restore, and recruiter-safe portfolio mode.

Sanju Career OS is designed as a personal execution dashboard rather than a generic todo app. It keeps daily learning, coding practice, projects, resume improvements, interview preparation, and long-term placement readiness in one system. The app works locally by default, keeps sensitive AI keys out of the frontend, and supports manual backups so progress can move safely between browsers or devices.

---

## Visual Overview

![React](https://img.shields.io/badge/React-18.3.1-61dafb?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.x-646cff?style=for-the-badge&logo=vite)
![Tailwind](https://img.shields.io/badge/Tailwind-3.x-38bdf8?style=for-the-badge&logo=tailwindcss)
![Zustand](https://img.shields.io/badge/Zustand-State-111827?style=for-the-badge)
![Node](https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=nodedotjs)
![Express](https://img.shields.io/badge/Express-API-000000?style=for-the-badge&logo=express)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2d3748?style=for-the-badge&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169e1?style=for-the-badge&logo=postgresql)

```mermaid
flowchart LR
  User["Sanju"] --> Today["Today Command Center"]
  User --> Learning["Learning OS"]
  User --> Placement["Placement OS"]
  User --> German["German Academy"]
  User --> Resume["Resume Studio"]
  User --> Projects["Project Tracker"]
  Today --> Store["Zustand Local State"]
  Learning --> Store
  Placement --> Store
  German --> Store
  Resume --> Store
  Projects --> Store
  Store --> Backup["Backup / Restore JSON"]
  Store --> Analytics["Analytics + Readiness"]
  Store --> Portfolio["Recruiter Safe Portfolio"]
  Store --> Backend["Express API"]
  Backend --> Prisma["Prisma"]
  Prisma --> Postgres["PostgreSQL"]
  Backend --> AI["Shayla AI Provider Router"]
```

---

## What This App Solves

Most career prep gets scattered across notebooks, spreadsheets, LeetCode, SkillRack, resume drafts, project folders, AI chats, and random reminders. Sanju Career OS turns that scattered work into a single daily command center.

It helps answer:

- What should I do today?
- Did I complete my coding target?
- Is my streak safe?
- How much XP did I earn?
- What progress is saved locally?
- What should I revise next?
- Which placement areas are weak?
- What is ready to show recruiters?
- Can I restore my progress in another browser?

---

## Current Release Snapshot

| Area | Status |
| --- | --- |
| App version | `v1.7.2` |
| Primary mode | Local-first personal tracker |
| Frontend | React, TypeScript, Vite, Tailwind |
| Backend | Express, TypeScript |
| Database | PostgreSQL through Prisma |
| AI | Backend-routed Shayla mentor with provider status |
| Backup | Full localStorage backup registry with safe restore |
| PWA | Installable shell with service worker |
| Privacy posture | Secrets stay backend-only; portfolio uses safe/synthetic public data |

---

## Core Modules

### 1. Today Command Center

The Today page is the daily execution cockpit. It includes:

- Daily Coding target
- CodeChef Java Daily: `0/5` to `5/5`
- SkillRack Daily: `0/5` to `5/5`
- LeetCode scheduled from August 1, 2026
- Daily agenda
- Focus timer
- Mood and energy tracking
- Reflection notes
- CS Core mission
- Aptitude, SQL, project, and mock interview counters
- Streak protection and no-zero-day rescue logic

```mermaid
flowchart TD
  Start["Open Today"] --> Coding["Daily Coding Target"]
  Coding --> CodeChef["CodeChef Java 5 Problems"]
  Coding --> SkillRack["SkillRack 5 Problems"]
  Coding --> LeetCode["LeetCode starts Aug 1, 2026"]
  CodeChef --> SharedState["Shared Daily Coding State"]
  SkillRack --> SharedState
  SharedState --> XP["Award XP Once"]
  SharedState --> Dashboard["Dashboard Updates"]
  SharedState --> ActivityLogger["Activity Logger Sync"]
  SharedState --> CommandCenter["Command Center Sync"]
```

### 2. DSA Restart System

The official DSA journey is configured to restart cleanly on:

```txt
2026-08-01
```

Before that date:

- CodeChef Java and SkillRack are active daily coding targets.
- LeetCode remains visible but does not count toward official DSA streak.
- Active DSA XP is reset to `0`.
- General XP and unrelated progress are preserved.

On and after that date:

- LeetCode becomes active.
- Official DSA streak can begin.
- DSA-specific progress can start from the first program/problem.

```mermaid
stateDiagram-v2
  [*] --> PreStart: before 2026-08-01
  PreStart --> OfficialDSA: on 2026-08-01
  PreStart: CodeChef Java active
  PreStart: SkillRack active
  PreStart: LeetCode scheduled
  PreStart: activeDsaXp = 0
  OfficialDSA: LeetCode active
  OfficialDSA: official DSA streak active
  OfficialDSA: DSA XP begins from restart
```

### 3. Learning OS

Learning OS tracks structured learning paths, revision items, mastery, study sessions, weak areas, and recommendations.

Useful for:

- AI/ML learning
- Product learning
- CS fundamentals
- Technical revision
- Long-term skill consistency

### 4. Placement OS

Placement OS focuses on target companies, readiness, online assessments, interviews, resume work, company-specific preparation, and placement strategy.

```mermaid
flowchart LR
  Companies["Target Companies"] --> Strategy["Placement Strategy"]
  Strategy --> Prep["Daily Prep"]
  Prep --> OA["OA Attempts"]
  Prep --> Interviews["Mock Interviews"]
  Prep --> Resume["Resume Readiness"]
  Prep --> Projects["Project Proof"]
  OA --> Readiness["Readiness Score"]
  Interviews --> Readiness
  Resume --> Readiness
  Projects --> Readiness
```

### 5. German Academy

The German module supports A1-B1 learning workflow:

- Lessons
- Vocabulary
- Notes
- Quizzes
- Speaking/listening counters
- German XP
- German streaks
- Shayla lesson help

### 6. Shayla AI Mentor

Shayla is the app's AI mentor identity for:

- Daily planning
- Java DSA guidance
- German learning
- Resume review
- Project coaching
- Interview prep
- Recovery suggestions

Important security rule:

```txt
The frontend never stores provider API keys.
AI provider keys belong only in backend/.env.
```

### 7. Backup and Restore

The app includes a full local backup system for moving progress between browsers.

Backup export includes:

- `userProfile`
- `settings`
- `xpState`
- `streakState`
- `dailyTaskState`
- `activityLogs`
- `completedTasks`
- `dailyLogs`
- `careerProgress`
- `skillProgress`
- `projectProgress`
- `dashboardStats`
- version metadata
- export timestamp

Backup import now:

- validates the file
- saves a pre-restore snapshot
- imports recognized storage keys
- restores global XP
- restores or recalculates streak
- restores daily logs and completed task history
- refreshes live dashboard state immediately
- keeps only DSA-specific active XP reset to `0`

```mermaid
sequenceDiagram
  participant A as Browser A
  participant File as Backup JSON
  participant B as Browser B
  participant Store as Zustand Store
  participant UI as Dashboard

  A->>File: Export local backup
  File->>B: Import backup
  B->>B: Validate schema
  B->>B: Save pre-restore snapshot
  B->>B: Restore localStorage keys
  B->>B: Normalize career state
  B->>Store: Rehydrate live app state
  Store->>UI: Update XP, streak, tasks, logs
  UI->>B: Shows restored progress immediately
```

---

## Architecture

### High-Level System Architecture

```mermaid
flowchart TB
  subgraph Client["Frontend - React + TypeScript + Vite"]
    Router["App Router"]
    Pages["Pages and Modules"]
    Components["UI Components"]
    Stores["Zustand Stores"]
    LocalStorage["Local Persistence"]
    PWA["PWA Service Worker"]
  end

  subgraph Services["Frontend Services"]
    Backup["Backup Registry"]
    Sync["Sync Service"]
    Analytics["Analytics Services"]
    Planner["Smart Planner"]
    Commands["Command Parser"]
  end

  subgraph Server["Backend - Express + TypeScript"]
    Api["REST API"]
    AiProxy["AI Provider Router"]
    Auth["Auth + Account Routes"]
    CloudSync["Cloud Snapshot Routes"]
  end

  subgraph Data["Data Layer"]
    Prisma["Prisma ORM"]
    Postgres["PostgreSQL"]
    JsonBackup["Manual JSON Backups"]
  end

  Router --> Pages
  Pages --> Components
  Pages --> Stores
  Components --> Stores
  Stores --> LocalStorage
  Stores --> Services
  Services --> JsonBackup
  Pages --> Api
  Api --> AiProxy
  Api --> Auth
  Api --> CloudSync
  Api --> Prisma
  Prisma --> Postgres
  PWA --> Client
```

### State Architecture

```mermaid
flowchart LR
  CareerStore["useCareerStore"] --> DailyLogs["dailyLogs"]
  CareerStore --> XP["xp / level"]
  CareerStore --> DSA["dailyCodingByDate"]
  CareerStore --> German["German state"]
  CareerStore --> Resume["Resume state"]
  CareerStore --> Projects["Project progress"]
  CareerStore --> Skills["SQL / Aptitude / CS Core"]
  CareerStore --> Backup["Backup Export"]
  Backup --> Restore["Backup Import"]
  Restore --> Rehydrate["Live Store Rehydration"]
  Rehydrate --> Dashboard["Dashboard"]
```

### Daily Coding Shared State

```mermaid
erDiagram
  DAILY_CODING_STATE ||--|| CODECHEF_JAVA_DAILY : contains
  DAILY_CODING_STATE ||--|| SKILLRACK_DAILY : contains
  DAILY_CODING_STATE ||--|| LEETCODE_DAILY : contains
  DAILY_CODING_STATE ||--|| DAILY_CODING_BONUS : awards

  DAILY_CODING_STATE {
    string date
    boolean dailyCodingBonusAwarded
    number dailyCodingBonusXp
    string officialDsaStartDate
  }

  CODECHEF_JAVA_DAILY {
    string id
    string label
    number target
    number count
    boolean completed
    boolean xpAwarded
    number xp
  }

  SKILLRACK_DAILY {
    string id
    string label
    number target
    number count
    boolean completed
    boolean xpAwarded
    number xp
  }

  LEETCODE_DAILY {
    string id
    string label
    string startsAt
    boolean active
  }
```

### Backup Restore Architecture

```mermaid
flowchart TD
  Import["Import Backup JSON"] --> Validate["Validate Backup"]
  Validate --> Reject["Reject Invalid / Secret-Like Payload"]
  Validate --> Snapshot["Save Pre-Restore Snapshot"]
  Snapshot --> RestoreKeys["Restore Known Storage Keys"]
  RestoreKeys --> Normalize["Normalize Career Store"]
  Normalize --> XPDirect{"XP stored directly?"}
  XPDirect -->|Yes| UseXP["Use imported XP"]
  XPDirect -->|No| DeriveXP["Recalculate XP from daily logs"]
  UseXP --> StreakDirect{"Streak stored directly?"}
  DeriveXP --> StreakDirect
  StreakDirect -->|Yes| UseStreak["Use imported streak"]
  StreakDirect -->|No| DeriveStreak["Recalculate streak from completed logs"]
  UseStreak --> DSAReset["Reset only active DSA XP/streak"]
  DeriveStreak --> DSAReset
  DSAReset --> Rehydrate["Rehydrate Zustand store"]
  Rehydrate --> Dashboard["Dashboard updates immediately"]
```

---

## Repository Structure

```txt
Sanju-Career-OS/
  backend/
    prisma/
    src/
      controllers/
      routes/
      services/
      ai/
      utils/
    package.json
  frontend/
    public/
    src/
      app/store/
      components/
      data/
      hooks/
      pages/
      routes/
      services/
      types/
      utils/
    tests/
    package.json
  docs/
  electron/
  scripts/
  docker-compose.yml
  package.json
  README.md
```

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend framework | React 18 |
| Language | TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS |
| State | Zustand persist stores |
| Charts/visuals | Recharts, custom components |
| Icons | Lucide React |
| Backend | Node.js, Express |
| ORM | Prisma |
| Database | PostgreSQL |
| AI route | Backend proxy/provider router |
| PWA | Manifest + service worker |
| Tests | Node test runner |

---

## Local-First Data Model

Sanju Career OS is intentionally local-first.

```mermaid
flowchart LR
  UserAction["User action"] --> Store["Zustand Store"]
  Store --> LocalStorage["Browser localStorage"]
  LocalStorage --> UI["Dashboard / Today / Analytics"]
  LocalStorage --> Backup["Export Backup JSON"]
  Backup --> AnotherBrowser["Import into another browser"]
  AnotherBrowser --> Rehydrate["Rehydrate live state"]
```

Most personal progress works without accounts or a database. Backend and PostgreSQL are needed for account/cloud snapshot features and API-backed AI/status routes.

---

## Setup Options

### Option A: Fast Local Tracker Mode

Use this when you only want to run the frontend tracker quickly.

```powershell
npm install
npm run dev:frontend
```

Open:

```txt
http://localhost:5173
```

### Option B: Full Frontend + Backend

Use this when you want backend routes, AI status, sync endpoints, and database-backed features.

```powershell
npm install
npm run db:up
npm run dev:all
```

Frontend:

```txt
http://localhost:5173
```

Backend health:

```txt
http://localhost:5000/api/health
```

### Option C: Windows Batch Startup

You can also run:

```powershell
.\Start-Sanzz-OS.bat
```

---

## Prerequisites

Required for frontend-only mode:

- Node.js
- npm

Required for full backend/database mode:

- Docker Desktop
- WSL 2 recommended on Windows
- PostgreSQL container through `docker compose`

Verify tools:

```powershell
node --version
npm --version
docker --version
docker compose version
wsl --list --verbose
```

---

## Environment Setup

Create backend environment file:
>>>>>>> da90b03 (docs: upgrade README with architecture and setup guide)

```powershell
cd backend
Copy-Item .env.example .env
```

Add secrets only to:

```txt
backend/.env
```

Example:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/sanju_career_os?schema=public"
GROQ_API_KEY="gsk_xxxxxxxxx"
PORT=5000
```

Security rules:

- Do not commit `backend/.env`.
- Do not put API keys in frontend env files.
- Do not add `Bearer` before the Groq key.
- Keep real provider keys local/private.

---

## Database and Prisma

Start PostgreSQL:

```powershell
npm run db:up
```

Validate Prisma:

```powershell
npm run prisma:validate
```

Generate Prisma client:

```powershell
npm run prisma:generate
```

Run migration:

```powershell
npm run prisma:migrate -- --name init
```

Seed data:

```powershell
npm run prisma:seed
```

<<<<<<< HEAD
---

## Environment

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | For backend database features | PostgreSQL connection string used by Prisma. |
| `JWT_SECRET` | For auth/session features | Use a strong local secret. |
| `GROQ_API_KEY` or provider key | Optional | Enables provider-backed Shayla AI. |
| Frontend API URL vars | Optional | Only needed when changing default local API routing. |

Use the example files as templates:

- [backend/.env.example](backend/.env.example)
- [frontend/.env.example](frontend/.env.example)

---
=======
Open Prisma Studio:

```powershell
npm run prisma:studio
```

---

## Development Commands

```powershell
npm install
npm run dev:frontend
npm run dev:backend
npm run dev:all
```
>>>>>>> da90b03 (docs: upgrade README with architecture and setup guide)

Build commands:

```powershell
npm run build
npm run build:frontend
npm run build:backend
npm run build:all
```

Validation commands:

```powershell
npm run lint
npm run typecheck
npm run test
npm run check:all
```

Database commands:

<<<<<<< HEAD
| Command | Purpose |
| --- | --- |
| `cmd /c npm run dev:all` | Start frontend and backend together. |
| `cmd /c npm run dev:frontend` | Start only the Vite frontend. |
| `cmd /c npm run dev:backend` | Start only the Express backend. |
| `cmd /c npm run build` | Build the project. |
| `cmd /c npm run test` | Run test suites. |
| `cmd /c npm run check:all` | Run broader validation checks. |
| `cmd /c npm run prisma:validate` | Validate Prisma schema. |
| `cmd /c npm run db:up` | Start local PostgreSQL through Docker Compose. |
| `cmd /c npm run db:down` | Stop local PostgreSQL. |

---

## Project Map

```text
SanzzOS/
|-- backend/                  Express API, Prisma, auth, sync, AI proxy
|-- data/                     Shared datasets and roadmap content
|-- docs/                     Setup, local mode, offline mode, architecture notes
|-- electron/                 Desktop app wrapper work
|-- frontend/                 React + Vite client
|   |-- public/               PWA manifest, icons, offline shell
|   `-- src/                  Components, stores, routing, feature modules
|-- Start-Sanzz-OS.bat        Windows one-click starter
|-- Stop-Sanzz-OS.bat         Windows helper to stop local processes
|-- docker-compose.yml        Local PostgreSQL service
`-- package.json              Workspace scripts
```

---

## Backup and Restore

SanzzOS treats backups as more than a file download. A restored backup should bring back the daily operating state you care about:

- XP totals
- Streak state
- Daily coding progress
- Today Workspace progress
- learning and placement data
- local-first user settings

The v2.2 restore work specifically protects against the bug where imported backup data existed but XP/streak state did not fully rehydrate in the live app session.

---

## Privacy Model

- Local tracker data stays on your machine by default.
- `.env` files are ignored and should never be committed.
- Public/demo/portfolio surfaces should use safe sample data, not private application notes.
- Provider-backed AI is optional and only works when configured through backend secrets.
- The app remains useful without AI keys.
=======
```powershell
npm run db:up
npm run db:down
npm run db:logs
npm run db:restart
npm run db:status
npm run db:doctor
```

PWA icons:

```powershell
npm run icons:pwa
```

---

## Feature Matrix

| Feature | Status | Data Location |
| --- | --- | --- |
| Today tracker | Active | Zustand + localStorage |
| CodeChef Java daily | Active | Shared daily coding state |
| SkillRack daily | Active | Shared daily coding state |
| LeetCode | Scheduled from Aug 1, 2026 | Daily coding state + roadmap |
| Global XP | Active | Career store |
| Active DSA XP | Reset to 0 for restart | Career store |
| Daily streak | Active | Daily logs + restored streak metadata |
| German XP/streak | Active | Career store |
| Backup export | Active | Backup registry |
| Backup import | Active | Backup registry + live rehydration |
| AI mentor | Optional provider-backed | Backend API |
| PWA install | Active | Manifest + service worker |
| Portfolio mode | Recruiter-safe | Synthetic/sanitized data |

---

## XP Rules

Current daily coding XP:

| Task | XP |
| --- | ---: |
| CodeChef Java Daily complete | 50 |
| SkillRack Daily complete | 50 |
| Full Daily Coding Target bonus | 25 |
| Max before Aug 1, 2026 | 125 |

XP is idempotent:

- Completing the same task twice does not duplicate XP.
- Completing in Command Center and Activity Logger does not duplicate XP.
- Reaching `5/5` and then checking the checkbox does not duplicate XP.
- Refreshing the browser does not duplicate XP.

---

## Backup Restore Guarantees

When importing a backup into another browser:

- Global XP should restore.
- Streak should restore or recalculate.
- Daily logs should restore.
- Completed tasks should restore.
- Dashboard should update immediately.
- Refresh should preserve restored values.
- Only DSA-specific active XP/streak should remain reset for the Aug 1 restart.

---

## Health Checks

Frontend:

```txt
http://localhost:5173
```

Backend:

```txt
http://localhost:5000/api/health
```

AI status:

```txt
http://localhost:5000/api/ai/status
```

Sync health:

```txt
http://localhost:5000/api/sync/health
```

---

## Testing

Run all frontend tests:

```powershell
cd frontend
cmd /c npm test
```

Run focused backup and DSA tests:

```powershell
cd frontend
node --test tests/backupRehydration.test.mjs tests/dailyCodingTasks.test.mjs
```

Run production build:

```powershell
cd frontend
cmd /c npm run build
```

Full project build:

```powershell
npm run build
```

---

## Privacy and Security

Sanju Career OS is built around a privacy-safe workflow:

- Local-first tracking by default.
- No frontend API key storage.
- Backups skip secret-like keys and suspicious payloads.
- Portfolio surfaces should not expose private tracker data.
- `.env` files must stay private.
- Public/demo views should use synthetic or sanitized data.

```mermaid
flowchart TD
  Secrets["API Keys / Secrets"] --> BackendEnv["backend/.env only"]
  BackendEnv --> Backend["Backend Provider Router"]
  Backend --> Frontend["Frontend receives safe responses"]
  Tracker["Private Tracker Data"] --> LocalStorage["Local Storage"]
  LocalStorage --> Backup["Backup JSON"]
  Backup --> Validation["Secret-like payload validation"]
  Portfolio["Portfolio Mode"] --> SafeData["Synthetic / Sanitized Data"]
```

---
>>>>>>> da90b03 (docs: upgrade README with architecture and setup guide)

---

<<<<<<< HEAD
## Documentation

| Guide | Link |
| --- | --- |
| Setup | [docs/SETUP.md](docs/SETUP.md) |
| Local mode | [docs/LOCAL_MODE.md](docs/LOCAL_MODE.md) |
| Offline mode | [docs/OFFLINE_MODE.md](docs/OFFLINE_MODE.md) |
| Architecture | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| Testing | [docs/TESTING.md](docs/TESTING.md) |
| Changelog | [CHANGELOG.md](CHANGELOG.md) |

---

## Development Notes

This repo is optimized for direct local iteration:

1. Run the app locally.
2. Make a focused feature change.
3. Verify the exact workflow in the browser.
4. Run the relevant build/test command.
5. Commit only the files related to that change.

For Windows, `cmd /c npm ...` is often the most reliable way to avoid PowerShell execution policy friction.

---

## Roadmap After v2.2
=======
### PowerShell blocks npm

Use `cmd /c`:

```powershell
cmd /c npm run build
cmd /c npm test
cmd /c npm run dev
```

### Docker not recognized

Install Docker Desktop, restart Windows, open Docker Desktop, then check:

```powershell
docker --version
docker compose version
```

### DATABASE_URL not found

Create `backend/.env`:
>>>>>>> da90b03 (docs: upgrade README with architecture and setup guide)

- Improve visual QA for mobile dashboards.
- Add stronger backup diff previews before import.
- Expand recruiter-safe portfolio exports.
- Continue tightening AI command preview/apply flows.
- Add more focused tests around daily XP, streaks, and import migrations.

<<<<<<< HEAD
---

## License

This project is released under the [MIT License](LICENSE).

---
=======
### Prisma generate fails on Windows

Stop Node processes and regenerate:

```powershell
taskkill /F /IM node.exe
cd backend
npx prisma generate
```

### Backend port already in use

Find and stop the process using port `5000`, or change `PORT` in `backend/.env`.

### Frontend port already in use

Vite may choose another port automatically. Check the terminal output for the final URL.

### Groq or Shayla AI not working
>>>>>>> da90b03 (docs: upgrade README with architecture and setup guide)

## Credits

<<<<<<< HEAD
Built by **Sanjay** as a personal career operating system: practical, local-first, privacy-aware, and designed around real daily progress.
=======
```txt
backend/.env has GROQ_API_KEY
backend server is running
http://localhost:5000/api/ai/status responds
```

Do not put keys in frontend files.

### Imported backup shows XP as 0

Use the latest restore flow. The backup import system now normalizes and rehydrates career state immediately. If a very old backup has no direct XP, XP is recalculated from daily logs where possible.

---

## GitHub Push Commands

Use these when you are ready to push your current local code to GitHub.

First inspect changes:

```powershell
git status
git diff -- README.md
```

Stage everything:

```powershell
git add .
```

Commit:

```powershell
git commit -m "docs: upgrade project README and update tracker docs"
```

Push to the current branch:

```powershell
git push origin HEAD
```

If you specifically want to push to `main`:

```powershell
git branch
git push origin HEAD:main
```

If Git asks you to set upstream for a new branch:

```powershell
git push -u origin HEAD
```

Recommended safer flow before pushing:

```powershell
git status
npm run build
cd frontend
cmd /c npm test
cd ..
git add .
git commit -m "docs: upgrade README and document architecture"
git push origin HEAD
```

---

## Roadmap Ideas

Planned or natural next improvements:

- Add real dashboard screenshots under `docs/assets/readme/`.
- Add a demo GIF of Today Command Center.
- Add a public portfolio walkthrough video.
- Add import/export visual QA checklist.
- Add release notes per version.
- Add architecture decision records under `docs/adr/`.
- Add contributor guide.
- Add issue templates and PR templates.

---

## Important Notes

- Keep local private env files private.
- Preserve local-first mode as the default.
- Do not expose real job applications or private tracker notes in public views.
- Keep DSA active XP reset separate from global XP.
- Use backup export before major migrations.
- Verify build and focused tests before pushing.

---

## Quick Start Summary

```powershell
npm install
npm run dev:frontend
```

Open:

```txt
http://localhost:5173
```

For full stack mode:

```powershell
npm run db:up
npm run dev:all
```

For verification:

```powershell
npm run build
cd frontend
cmd /c npm test
```
>>>>>>> da90b03 (docs: upgrade README with architecture and setup guide)
