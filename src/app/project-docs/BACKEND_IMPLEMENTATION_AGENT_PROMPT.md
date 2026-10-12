# GCC Pulse Backend Code-Placement Prompt

You are integrating the backend files extracted from the existing GCC Pulse full codebase. This is a repository integration task, not a request to rebuild the application.

## Source of truth

Read these files:
1. `BACKEND_BLUEPRINT.md`
2. `README_BACKEND.md`
3. Existing frontend blueprint and frontend codebase document in `project-docs/`, if present.
4. Existing source files in the repository.
5. The backend files in this package.

The `.ts` and `.sql` files in this package were extracted from `GCC_Pulse_Frontend_Full_Codebase.md`. Treat them as the intended baseline, but audit them against the actual repository before copying.

## Required procedure

### Phase 1 — inspect
- Inspect `package.json`, `next.config.ts`, all existing API routes, `src/lib/ai/**`, `src/lib/supabase/**`, `src/lib/data.ts`, `src/lib/security.ts`, `src/lib/validation.ts`, and existing SQL migrations.
- Inspect frontend calls from `/extract` and `/review`.
- Read `.env.local` variable names only. Never print values.
- Report mismatches before editing.

### Phase 2 — place/merge files
Use these target paths:
- `src/app/api/claims/[id]/route.ts`
- `src/app/api/claims/route.ts`
- `src/app/api/extract/route.ts`
- `src/app/api/review-queue/route.ts`
- `src/lib/ai/extract.ts`
- `src/lib/ai/prompts.ts`
- `src/lib/data.ts`
- `src/lib/security.ts`
- `src/lib/supabase/browser.ts`
- `src/lib/supabase/server.ts`
- `src/lib/validation.ts`
- `supabase/schema.sql` (only after comparing with existing schema)
- `supabase/seed.example.sql` (demo-only placeholder)

Preserve existing UI, styles, routes, and `.env.local`. Do not create duplicate API routes or duplicate Supabase clients. If the repository already contains newer or more complete code, keep it and merge only what is missing.

### Phase 3 — dependencies and environment
- Check that `@google/genai`, `@supabase/supabase-js`, `zod`, and `server-only` are compatible with installed versions.
- Do not use OpenAI; the project uses Gemini.
- Compare environment variable names with `.env.example`.
- Never expose `GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, or `GCC_PULSE_REVIEW_TOKEN` in browser code.
- Do not overwrite `.env.local`.

### Phase 4 — schema reconciliation
- Compare all selected columns and nested relations in `src/lib/data.ts` with the actual Supabase schema.
- Confirm enum/check values match `src/lib/validation.ts`.
- Review RLS policies. Do not run the schema blindly against a populated or production database.
- Keep new claims pending until a reviewer approves them.
- Do not invent sample company data or metrics.

### Phase 5 — verify
Run:
- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`

If valid credentials are configured, manually test:
1. `POST /api/extract` with valid and invalid source text.
2. `POST /api/claims` without and with reviewer authorization.
3. `GET /api/review-queue` without and with authorization.
4. `PATCH /api/claims/:id` for approve, reject, edit, and missing IDs.
5. Supabase directory reads and source/claim relationships.

Do not claim live integrations passed if credentials or a database were unavailable.

## Known baseline concerns to check
- The extracted source may have mismatches between code and schema; resolve them rather than suppressing type errors.
- The browser Supabase client must never use the service-role key.
- The reviewer token is a prototype gate, not production authentication.
- AI extraction is not verification; preserve quotes and uncertainty.
- The `POST /api/claims` flow may create a source before a later claim insert fails; document or improve transactionality.
- Check whether all nested Supabase relationships return objects or arrays as expected.
- Never log secrets or full sensitive source text.

## Final report
List changed files, dependency changes, schema status, environment variable names needed, route test results, Gemini and Supabase live test results, and exact lint/typecheck/build outcomes. Separate static checks from live integration tests.
