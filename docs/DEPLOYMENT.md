# Deployment Guide

Detailed deployment walkthrough.

## Deployed Options

### Frontend (Vercel)
- Compile to static build: `npm run build:frontend`.
- Deploy `dist/` directory.

### Backend (Render / Railway)
- Run docker container: `docker build -t backend ./backend`.
- Configure `DATABASE_URL` and `GROQ_API_KEY` production environment variables.
