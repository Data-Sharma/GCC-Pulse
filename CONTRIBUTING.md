# Contributing to GCC Pulse

This is currently a **solo** repository. These conventions exist so future work stays incremental and does not thrash the running app.

---

## Ground rules

1. Prefer **small, reviewable changes** that implement one capability at a time.
2. Do not rewrite working routes or libraries just to match a target folder name.
3. Do not add dependencies unless the change that needs them is being implemented.
4. Do not commit secrets. Never paste live keys into Markdown or SQL.
5. Empty placeholder files under `src/features/`, `src/types/`, `src/config/`, `tests/`, `scripts/`, and `supabase/migrations/` are **intentional**. Fill them in when that feature is scheduled—not before.

---

## Naming

- Directories: lowercase.
- React component files: kebab-case (`claim-card.tsx`).
- Domain code: `src/features/<domain>/`.
- Reusable UI: `src/components/`.
- Infrastructure (Supabase, AI provider, auth helpers): `src/lib/`.
- App Router pages and Route Handlers: existing `src/app/` tree.

If a file already exists at another path (for example `src/components/app-shell.tsx` vs `src/components/layout/app-shell.tsx`), **extend the existing file** rather than creating a second implementation.

---

## App Router

- Dynamic company pages already use `[id]`. Do not introduce a competing `[companyId]` page.
- New `page.tsx` / `layout.tsx` / `route.ts` files must export the handlers Next.js requires. Do not add empty route files.

---

## Testing

When tests are introduced:

- `tests/unit/` — pure functions (extraction parsing, scoring, claim state).
- `tests/integration/` — API Route Handlers against a test database or stubs.
- `tests/e2e/` — Playwright (or similar) journeys.

Placeholders in those folders are empty until a testing phase.

---

## Database

- The prototype schema lives at `src/app/supabase/schema.sql`. Do not copy it blindly into `supabase/migrations/`.
- Future migrations should be additive, named, and reviewed.
- Do not run migrations against production from a structure or docs-only change.

---

## Documentation

- Distinguish **current** vs **planned**.
- Update `docs/` when behavior actually ships.
- Root `README.md` is the create-next-app readme; setup notes also exist in `GETTING_STARTED.md`. Do not overwrite them casually.
