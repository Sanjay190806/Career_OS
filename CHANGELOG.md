# Changelog

All notable changes to this project will be documented in this file.

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
