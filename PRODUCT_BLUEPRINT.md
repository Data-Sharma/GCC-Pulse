# GCC Pulse — Product Blueprint

This document describes the **complete future product**. It is not a claim that every capability is already implemented.

Existing application code, routes, and database scripts remain the source of truth for what works today. Planned items below are labeled as **planned**.

Related existing documents (preserved, not replaced): `BLUEPRINT.md`, `GETTING_STARTED.md`, `AUTHENTICATION_SETUP.md`, and files under `src/app/project-docs/`.

---

## Vision

GCC Pulse is a source-backed intelligence platform for India's Global Capability Centre (GCC) ecosystem. Users should be able to inspect **where a fact came from**, how fresh it is, and whether a human has verified it—before they use it for expansion, location, or vendor decisions.

The product should remain useful as a solo-built modular monolith: one Next.js application, one PostgreSQL database (Supabase), and server-side AI extraction.

---

## Current vs planned

### Current (already in this repository)

- Next.js App Router UI with a public landing experience and an authenticated workspace shell.
- Sign-in at `/sign-in` and an OAuth callback at `/auth/callback`.
- Pages for companies, company detail (`[id]`), cities, providers, signals, extraction, and review.
- API routes for AI extraction, claim create/list, claim review by `[id]`, and the review queue.
- Gemini-backed extraction helpers under `src/lib/ai/`.
- Supabase browser/server clients and a prototype schema at `src/app/supabase/schema.sql`.
- Reviewer-token gated writes (see `src/lib/security.ts`).

### Planned (structure prepared; not implemented in this task)

- Full evidence ingestion pipeline with quality scoring.
- Canonical company/subsidiary registry with entity resolution.
- Location and micro-market geographic intelligence.
- Transparent city scoring and comparisons.
- Provider discovery beyond the current directory page.
- Expansion-signal lifecycle and timelines.
- Total cost of ownership (TCO) estimator.
- Organization workspaces, richer authorization, and audit trails.
- Search, conflict resolution UI, monitoring, and enterprise controls.

---

## User personas (hypotheses)

Personas are hypotheses and need validation. See `docs/product/personas.md`.

1. **GCC expansion / location team** — compares cities and sites with cited evidence.
2. **Research analyst / reviewer** — ingests sources, extracts claims, and verifies them.
3. **Ecosystem service provider** — wants accurate, sourced profiles of demand and locations.
4. **Economic-development / policy user** — tracks announcements and cluster activity.

---

## Major capabilities (target product)

1. **Evidence-backed source ingestion** — register sources with URL, publisher, retrieved-at, and content hash.
2. **AI-assisted extraction** — Gemini (server-side only) proposes structured claims; humans remain accountable.
3. **Validation and normalization** — Zod (and future feature schemas) reject malformed payloads.
4. **Human review** — pending → approved / rejected (and later conflicting / superseded).
5. **Canonical registry** — companies, parents/subsidiaries, and GCC locations.
6. **Geographic intelligence** — cities, states, and future micro-markets.
7. **City comparison** — side-by-side metrics with source popovers.
8. **Provider directory** — discover and profile ecosystem vendors.
9. **Expansion signals** — announcements and hiring/site signals tied to sources.
10. **TCO estimator** — transparent assumptions; never a black-box quote.
11. **Provenance and conflicts** — every displayed fact can be traced; conflicts are visible.
12. **Search and retrieval** — planned full-text / document search.
13. **AuthZ and workspaces** — planned org membership beyond today's user session.
14. **Audit, tests, operations** — planned structured tests and runbooks.
15. **Secure deployment** — Vercel + Supabase, secrets only on the server.

---

## Data lifecycle (planned target)

Source document → extracted claim (AI or manual) → validation → review queue → verified or rejected fact → registry / city / signal views. Conflicts remain attached to evidence rather than silently overwritten.

Details: `docs/architecture/data-flow.md` and `docs/data/claim-lifecycle.md`.

---

## AI extraction

**Current:** `POST /api/extract` and `src/lib/ai/extract.ts` / `prompts.ts`.

**Planned:** a provider boundary (`src/lib/ai/provider.ts`) so Gemini stays server-side, with output validation and feature-level extraction services. Prompts must never trust source text as instructions.

---

## Security and enterprise-readiness goals

- No AI or service-role keys in the browser.
- Row Level Security (RLS) on Supabase tables; tighten write policies over time.
- Safe API errors (no stack traces or secrets to clients).
- Future: org workspaces, SSO, audit logs, formal security review.

See `SECURITY.md` and `DATA_POLICY.md`.

---

## Phased delivery

See `ROADMAP.md`. This repository-structure task is **phase 0** only.
