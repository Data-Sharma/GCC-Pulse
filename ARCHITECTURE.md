# GCC Pulse — Architecture

This document describes the intended **modular monolith**. It distinguishes what already exists from what is planned.

Do not treat empty files under `src/features/`, `src/types/`, or `src/config/` as working modules. They are placeholders for later implementation.

---

## Style: modular monolith

GCC Pulse stays a single Next.js application and a single PostgreSQL database until traffic, team size, or compliance **justifies** a split. See `docs/architecture/adr/0001-modular-monolith.md`.

Domain logic is intended to live under `src/features/*` (ingestion, extraction, claims, review, companies, locations, cities, providers, signals, estimates). Shared UI stays in `src/components`. Infrastructure stays in `src/lib`.

**Today**, much of the behavior still lives in `src/lib/data.ts`, `src/lib/validation.ts`, `src/lib/ai/*`, and App Router pages/API routes. Those files are preserved. Future work should move logic incrementally; this task did not relocate anything.

---

## Runtime components

| Component | Role today | Planned |
|-----------|------------|---------|
| **Next.js App Router** | Pages, layouts, Route Handlers | Additional dashboard/auth routes when implemented |
| **React + TypeScript** | UI | Feature-specific components (placeholders only for now) |
| **Tailwind CSS** | Styling | Unchanged configuration |
| **Supabase PostgreSQL** | Persistence; RLS enabled on prototype tables | Root `supabase/migrations/` as a future convention; existing SQL stays at `src/app/supabase/` |
| **Gemini API** | Server-side extraction | Explicit provider + output-validation modules |
| **Zod** | Request/response validation in `src/lib/validation.ts` | Feature-level schemas |
| **Vercel** | Intended host | See `docs/operations/deployment.md` |

---

## Layering

```text
Browser UI (src/app, src/components)
        │  cookies / public env only
        ▼
Route Handlers & Server Components (src/app/api, server libs)
        │  service role, Gemini key, reviewer token — server only
        ▼
Feature services (planned: src/features/*)
        ▼
Supabase PostgreSQL (+ RLS)
```

Trust boundaries: `docs/architecture/security-boundaries.md`.

---

## Next.js

- Application root is `src/app/` (there is no competing root `app/` directory).
- Existing product URLs include `/`, `/sign-in`, `/companies`, `/companies/[id]`, `/cities`, `/providers`, `/signals`, `/extract`, `/review`.
- Existing APIs: `/api/extract`, `/api/claims`, `/api/claims/[id]`, `/api/review-queue`.
- Auth callback: `/auth/callback`.
- `src/middleware.ts` exists and must not be replaced in a structure-only change.

Empty `page.tsx` / `route.ts` files were **not** added for future URLs, because Next.js would discover them and the build could fail without a default export.

---

## Supabase

- Clients: `src/lib/supabase/server.ts`, `src/lib/supabase/browser.ts` (preserved).
- Prototype schema and example seed: `src/app/supabase/schema.sql`, `seed.example.sql` (preserved).
- Planned empty placeholders: `src/lib/supabase/admin.ts`, `database.types.ts`, and `supabase/migrations/*.sql` (zero-byte; **not** a copy of the live schema).

---

## Gemini and validation

- Extraction implementation remains in `src/lib/ai/extract.ts` and `src/lib/ai/prompts.ts`.
- Planned files: `provider.ts`, `gemini.ts`, `output-validation.ts` (empty).
- `src/lib/ai/prompts/` was **not** created because `prompts.ts` already occupies that module path.

---

## APIs and UI

API contracts for **future** endpoints are documented in `docs/api/api-contracts.md`. They are not implemented.

UI composition today uses `src/components/app-shell.tsx` and related files. Planned layout/shared components were added only where they would not duplicate those existing files.
