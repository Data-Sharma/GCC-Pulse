# ADR 0003 — Gemini behind a server-side provider boundary

**Status:** Accepted  
**Date:** 2026-10-12

## Context

Claim extraction uses the Gemini API (`@google/genai`) from `src/lib/ai/extract.ts`. Model keys must not ship to the browser. Prompts and source text are sensitive.

## Decision

Keep Gemini **server-side only**. Future code should call a provider interface (`src/lib/ai/provider.ts`, `gemini.ts` placeholders) so the rest of the app does not import the vendor SDK from client components.

Output must be schema-validated (Zod) before persistence.

A `src/lib/ai/prompts/` directory was not added because `src/lib/ai/prompts.ts` already exists.

## Consequences

- One secret (`GEMINI_API_KEY`) on the server.
- Switching or stubbing the model later is possible without rewriting pages.
- Latency and cost stay on the extract path; the UI must handle failure.

## Alternatives considered

- Client-side Gemini — rejected (key exposure, prompt leakage).
- Multiple model vendors immediately — deferred until the provider boundary exists.
