# Security (v1.6.4)

## Secrets policy

- Real API keys belong in **ignored** `backend/.env` only.
- Tracked files use placeholder values in `.env.example`.
- Never commit `.env`, tokens, or Groq keys.

## Backup safety

- Backup export skips secret-like keys and rejects suspicious restore payloads.
- Service worker does not cache `/api/` responses.

## Sync honesty

- No authentication in v1.6.4.
- Manual DB snapshots use a shared `local-user` id — not secure multi-tenant storage.

## Local ignored secrets

If `backend/.env` contains a real `GROQ_API_KEY` on your machine, that is expected for local AI — keep it gitignored.

Run before release:

```bash
git ls-files | findstr /i ".env"
# should only show *.env.example files
```
