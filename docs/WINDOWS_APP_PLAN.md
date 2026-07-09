# Sanzz Career OS Windows App Plan

## Current local development mode

Sanzz Career OS v1.8 runs as a local-first Vite app. The placement discipline engine stores daily progress in browser/app local storage under the `sanzz-placement-discipline-v18` key, so the daily tracker keeps working even when the backend or PostgreSQL is unavailable.

Use the existing local scripts for development:

- `npm run dev:frontend`
- `npm run build --workspace=frontend`
- `npm run test --workspace=frontend`

The v1.8 tracker does not require cloud sync, authentication, Google login, or a live API to save daily placement progress.

## Future one-click desktop app mode

The v1.9 desktop target should behave like normal Windows software:

- The user clicks the Sanzz Career OS icon.
- The app opens directly to the BEAST MODE launch dashboard.
- No terminal is required.
- No npm commands are required.
- Local progress persists between launches.
- Export and restore JSON backup remain available from Settings / Backup.

## Recommended packaging path

Use Electron with Electron Forge.

Recommended path:

1. Add an Electron main process that opens the built frontend from `frontend/dist`.
2. Keep the frontend data layer local-first and continue using local storage for v1.8 placement entries.
3. Add a preload bridge only when native filesystem backup locations are needed.
4. Use Electron Forge makers for Windows installer output.
5. Keep PostgreSQL and backend services optional for the placement discipline engine.

## Target behavior

The packaged app should launch as `Sanzz Career OS`, open in a desktop window, and feel like a fast local placement dashboard. Daily progress must remain honest: only the current date can be edited, past dates are read-only, and future dates are blocked. Backup and restore should remain the user-controlled escape hatch for moving local progress between machines.

