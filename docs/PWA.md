# PWA (v1.6.4)

## Install (Chrome / Edge / Brave)

1. Run production build: `npm run build` from repo root.
2. Serve `frontend/dist` over HTTPS or `localhost`.
3. Open the app once online so the service worker can cache the shell.
4. Use browser install menu or the in-app **Install Standalone** prompt.

## Files

- Manifest: `frontend/public/manifest.webmanifest`
- Service worker: `frontend/public/sw.js`
- Icons: `frontend/public/icons/icon-192.png`, `icon-512.png`, plus SVG fallbacks
- Registration: `frontend/src/pwa/registerServiceWorker.ts` (prod only)

## Prompts

- `PWAInstallPrompt` — mounted in `App.tsx`
- `PWAUpdatePrompt` — shows when a new service worker is waiting

## Limitations

- Install prompt requires installability criteria (manifest + SW + icons).
- Offline use depends on a prior successful online visit.
- Development mode (`vite dev`) does not register the service worker.

Generate PNG icons: `npm run icons:pwa`
