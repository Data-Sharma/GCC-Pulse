# ADR 0001 — Modular monolith

**Status:** Accepted for the current stage of GCC Pulse  
**Date:** 2026-10-12

## Context

The product needs many domains (ingestion, review, registry, cities, providers, signals, TCO, auth). A premature split into multiple deployable services would add operational cost for a solo maintainer.

## Decision

Keep **one application repository** and **one Next.js deployment** until there is a concrete reason to separate (independent scaling, team ownership, or compliance isolation).

Inside the app, organize *future* domain code under `src/features/*` without moving existing modules in this structure task.

## Consequences

- Simpler local development (`npm run dev`) and a single Vercel project.
- Features can still be separated by folder and tests.
- If a service split is justified later, extract along feature boundaries rather than rewriting the UI.

## Alternatives considered

- Microservices from day one — rejected as too heavy.
- Separate frontend and backend repos — rejected; App Router Route Handlers already colocate HTTP with UI.
