# Technical Architecture Overview

Sanju Career OS uses a modern full-stack web structure split into client-first interface renders and server backend proxies.

```mermaid
graph TD
  A[React Frontend] -->|State Persistence| B(Zustand LocalStorage)
  A -->|HTTP / SSE Streaming| C[Express Backend API]
  C -->|Prisma Client| D[(PostgreSQL Database)]
  C -->|Secure Completions API| E(Groq / Llama Cloud)
```

## Tech Stack
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Zustand persistence middleware
- **Backend**: Express API, Node, Zod validations, Prisma ORM
- **Database**: PostgreSQL (Docker-based)
- **AI Core**: Groq AI Llama-3 API completions
