# ADR 0002 — Supabase PostgreSQL

**Status:** Accepted  
**Date:** 2026-10-12

## Context

GCC Pulse stores companies, locations, sources, claims, metrics, providers, and signals. The data is relational (foreign keys, status checks, full-text indexes).

The repository already includes `@supabase/supabase-js`, `@supabase/ssr`, clients in `src/lib/supabase/`, and a prototype schema at `src/app/supabase/schema.sql`.

## Decision

Use **Supabase PostgreSQL** as the initial system of record, including Auth and RLS.

Root-level `supabase/migrations/` is a **future convention**. Existing SQL stays where it is; this ADR does not authorize copying or running migrations.

## Consequences

- Strong consistency and SQL constraints for claim status and FKs.
- RLS can tighten over time without changing the application database.
- Vendor lock-in is limited to client libraries; SQL remains portable in principle.

## Alternatives considered

- Document store — weaker fit for joins and claim review integrity.
- Self-hosted Postgres only — more ops work for a solo project.
