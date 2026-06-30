# Changelog

All notable changes to this project will be documented in this file.

## v1.6.3 - Cloud Sync + PWA + Performance
### Added
- Local and Cloud Sync adapters coordination for multi-device profile loads.
- Offline-first operations transaction queue caching study progress locally.
- Backup JSON import/export panel in settings with schema structure verification checks.
- PWA Web App manifest and service worker asset-caching filters.
- Fallback OfflinePage viewport intercepting network connection losses.
- Centralized localStorage safe JSON parsing to protect client data integrity.
- Lightweight rendering presets to disable floating background particle canvas effects on demand.
- extended AI command parse triggers for sync updates, backup downloads, and cache clears.

## v1.6.2.2 - Adaptive UI + Personalization Engine + Achievement Expansion
### Added
- Personalization panel in Settings allowing users to customize target careers (SWE/Analyst focus paths), energy status, and layout density thresholds.
- Dynamic layout engines responding to screen width breakpoints and setting compact padded borders reactively.
- Gamified progression board featuring 120 detailed DSA, SQL, German, and project quest achievements.
- Custom achievement evaluations checking problem logs on dashboard load, throwing unlock alert modal popups.
- Floating XP-gain toast alerts confirming credited achievements and logs.
- Speech Practice typing fallback inputs and diagnostics panel when microphone capture fails.
- Stoppers batch script `Stop-Sanzz-OS.bat` at the repository root folder.

### Fixed
- Fixed TypeScript warnings and unused icon imports across React component viewports.
- Restored valid JSON format inside root and frontend package manifests.

## v1.6.1 - Learning OS + Analytics 2.0
### Added
- Learning OS workspace with 14 default career learning paths, skill mastery tracking, session logging, weak areas, milestones, resources, and revision queue.
- Versioned Learning OS persistence under `sanzz_os_learning_os_v1`, `sanzz_os_learning_sessions_v1`, and `sanzz_os_revision_items_v1`.
- Analytics 2.0 dashboard with study hours, XP, completion trends, skill/category breakdowns, readiness, burnout, focus balance, and insights.
- Dashboard widgets for Learning OS, due revision, weekly learning hours, weak skills, and Analytics 2.0 insights.
- Smart Planner integration with Learning OS mastery and revision backlog signals.
- AI Brain learning intelligence for weakest learning path, revision backlog, and learning-aware next actions.
- AI command support for learning sessions, due revision, weak skills, learning plans, and analytics.
- Safe backend fallback endpoints for Learning OS and Analytics 2.0.

### Fixed
- Verified v1.6.0 AI Brain, Smart Planner, Placement OS, dashboard widget, command, route, and build stability before extending.

### Security
- Verified no secrets in new files.
- Environment examples remain placeholder-only and `.env` files remain ignored.

## v1.6.0 - AI Brain + Smart Planner + Placement OS
### Added
- AI Brain career context engine with typed profile, skill insight, risk, recommendation, and readiness models.
- Smart Daily Planner with planner modes, generated tasks, XP rewards, completion tracking, and localStorage persistence.
- Placement OS workspace with default company database, application status board, interview/OA placeholders, resume checklist, and readiness scoring.
- Dashboard intelligence widgets for AI Brain, today's Smart Plan, Placement OS, priority company, and next action.
- AI command intents for planner generation, smart task completion, AI Brain refresh, placement readiness, company status, interview rounds, OA results, and next action recommendations.
- Safe backend fallback endpoints for AI Brain, Smart Planner, and Placement OS under `/api`.

### Fixed
- Verified v1.5 stability items: German lesson data exists, `/roadmap` is routed, default Sanju Career OS project exists, current frontend/backend builds pass, and new TypeScript additions compile.
- Aligned frontend `.env.example` API base URL with the existing API client default.

### Security
- Verified tracked environment examples use placeholder-only values.
- Added no hardcoded real API keys or secrets.

## [1.0.0] - 2026-06-28
### Added
- Complete React + TypeScript frontend application with modular component viewports.
- Express API server featuring secure reverse-proxy Groq connections.
- Local-first Zustand state management tracking user profile daily logs.
- PostgreSQL database backup integrations using Prisma ORM schemas.
- Streaming AI Mentor completions using SSE flusher token decoders.
- Extended SQL, Aptitude, CS Core checklists, SkillRack, and DSA Pattern mastery pages.
