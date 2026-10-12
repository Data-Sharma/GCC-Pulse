# API contracts

This lists **intended** HTTP endpoints and what already exists. Folders may exist without `route.ts` files so Next.js does not discover empty handlers.

---

## Existing (do not duplicate)

| Method | Path | Responsibility |
|--------|------|----------------|
| POST | `/api/extract` | AI claim extraction (Gemini, server-side) |
| POST / GET (as implemented) | `/api/claims` | Create/list claims and sources |
| PATCH (as implemented) | `/api/claims/[id]` | Reviewer decision on a claim. Parameter name is **`id`**, not `claimId`. |
| GET | `/api/review-queue` | Pending claims for review |
| GET | `/auth/callback` | OAuth / auth code exchange |

Exact request bodies are defined in existing handlers and `src/lib/validation.ts`. This file does not replace them.

---

## Planned (directories reserved; no handlers in this task)

| Path | Intended responsibility |
|------|-------------------------|
| `/api/health` | Liveness/readiness without leaking internals |
| `/api/sources` | Register and list evidence sources |
| `/api/companies` | Company collection (read/search) |
| `/api/companies/[companyId]` | Company resource; may wrap the same data as UI `[id]` |
| `/api/cities` | City metrics listing |
| `/api/cities/compare` | Comparison payload with sources and missing-data flags |
| `/api/providers` | Provider directory API |
| `/api/signals` | Expansion signals API |
| `/api/estimates` | TCO estimate runs |

Planned endpoints should reuse Zod validation, reviewer/session checks, and must not expose the service role.

## Non-goals

- Do not add a second extract or claims API under another path merely for naming.
- Do not implement handlers until an implementation phase is approved.
