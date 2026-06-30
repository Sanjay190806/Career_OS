# Troubleshooting (v1.6.4)

## Build fails at root

Use `npm run build` (alias for `build:all`) from repo root, not inside `frontend/` alone for full release checks.

## Sync Now fails

1. Start backend: `npm run dev:backend`
2. Start PostgreSQL: `npm run db:up`
3. Run migrations if needed: `npm run prisma:migrate`
4. Enable **Manual DB Snapshot** mode in Settings (not Local Only)

This pushes a manual snapshot — not account sync.

## Database 503

Backend sync returns `database_unavailable` when PostgreSQL is down or `DATABASE_URL` is wrong.

## Backup import rejected

- Wrong `appName`
- Newer unsupported `schemaVersion`
- Secret-like content detected
- File too large (>25 MB)

## PWA install missing

- Use production build, not `vite dev`
- Visit app online once
- Check `manifest.webmanifest` and icons under `/icons/`

## Offline page only

Load the app online first so the service worker can cache JS/CSS assets.

## AI errors

Groq key must be in ignored `backend/.env` — never commit it.

## Prisma validate

Only needed when editing `schema.prisma`. Normal daily startup does not require `prisma validate`.
