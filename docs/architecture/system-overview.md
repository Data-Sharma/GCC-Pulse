# System overview

GCC Pulse is a **modular monolith**: one Next.js app, one Supabase PostgreSQL database, and server-side Gemini calls.

## Layers

1. **Presentation** — App Router pages and React components (`src/app`, `src/components`). Today this includes landing, sign-in, registry, cities, providers, signals, extract, and review pages.
2. **HTTP / server** — Route Handlers under `src/app/api/*` and server components. Middleware and auth helpers gate some UI.
3. **Domain (planned)** — `src/features/*` will own ingestion, extraction, claims, review, and scoring. Placeholders are empty.
4. **Infrastructure** — `src/lib/supabase/*`, `src/lib/ai/*`, `src/lib/validation.ts`, `src/lib/security.ts`.
5. **Data** — PostgreSQL tables defined in the existing `src/app/supabase/schema.sql` (not moved).

## Data flow (summary)

Browser → Next.js server → (optional Gemini) → Supabase. Secrets never cross into the browser. See `data-flow.md` and `security-boundaries.md`.

## What is not in production yet

Feature modules, TCO, org workspaces, dedicated observability exporters, and root-level migrations are **planned**. Empty files must not be imported until implemented.
