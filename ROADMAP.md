# GCC Pulse — Roadmap

Phases are **planned**. Only phase 0 (repository foundation / structure) is in scope for the current task. Later phases require explicit approval and must not rewrite existing files without a dedicated change.

---

## Phase 0 — Repository foundation (this task)

- Inspect the existing Next.js + Supabase application.
- Add long-term directories, documentation, and empty placeholders.
- Preserve every existing file and configuration.

---

## Phase 1 — Ingestion and extraction hardening

- Formalize source registration (URL, publisher, retrieved-at, hash).
- Keep Gemini behind the server; validate model output with Zod.
- Do not treat source body text as trusted instructions.

**Exists today:** `/api/extract`, `src/lib/ai/extract.ts`.

---

## Phase 2 — Claim review lifecycle

- Persist claims with provenance.
- Reviewer workflow: approve / reject with rationale.
- Later: conflicting and superseded states.

**Exists today:** `/api/claims`, `/api/claims/[id]`, `/api/review-queue`, `/review`.

---

## Phase 3 — Canonical registry

- Companies, parents/subsidiaries, GCC locations.
- Entity resolution rules (planned).
- Keep using existing `/companies` and `/companies/[id]` rather than a parallel URL.

---

## Phase 4 — City comparison

- Metric dictionary, freshness, missing-data handling.
- Comparison view (planned `/cities/compare`; directory reserved, page not added).

**Exists today:** `/cities` page and `city_metrics` table in the prototype schema.

---

## Phase 5 — Providers

- Richer profiles and filters on top of the existing `/providers` page and `providers` table.

---

## Phase 6 — Expansion signals

- Signal types, status workflow, timelines.

**Exists today:** `/signals` and `expansion_signals` in the prototype schema.

---

## Phase 7 — TCO estimator

- Assumption-listed cost model; no silent defaults that look like facts.
- Planned UI path: dashboard `cost-estimator` (directories reserved only).

---

## Phase 8 — Authentication and workspaces

- Evolve beyond session + reviewer token.
- Planned: invites, org membership, authorization helpers.
- **Exists today:** `/sign-in`, `/auth/callback`, `src/lib/auth.ts`, `src/lib/auth-actions.ts`, `src/middleware.ts`.

---

## Phase 9 — Production hardening

- Tests under `tests/` (placeholders only today).
- Observability placeholders under `src/lib/observability/`.
- Backups, incident response, security review (`docs/operations/`).
- Tighten RLS write policies; rotate secrets; Vercel env separation.
