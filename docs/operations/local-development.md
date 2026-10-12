# Local development

This describes how to run the **existing** project. It does not change configuration files.

Also see the repo `README.md` (create-next-app defaults) and `GETTING_STARTED.md` (project-specific notes). Prefer those files if they disagree with this overview.

---

## Prerequisites

- Node.js compatible with the Next.js version in `package.json`
- npm (lockfile: `package-lock.json`)
- A Supabase project and a Gemini API key already configured by the operator

---

## Install and run

From `gcc-pulse/`:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Other scripts already defined: `npm run build`, `npm run start`, `npm run lint`.

Do not add new npm scripts in a structure-only change. Placeholders under `scripts/` are empty and are **not** wired up.

---

## Environment variables

Use a local `.env.local` (gitignored). This document does not list secret values.

Typical names used by the existing app (confirm in code and `GETTING_STARTED.md`):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or the anon key name your project uses)
- `NEXT_PUBLIC_APP_URL`
- `GEMINI_API_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GCC_PULSE_REVIEW_TOKEN`

Never commit or paste live keys into git, chat, or docs.

---

## Database

Prototype SQL is at `src/app/supabase/schema.sql` and `src/app/supabase/seed.example.sql`. Apply it only through your existing Supabase workflow. Do not run the empty files under `supabase/migrations/`.

---

## Layout of the running app

- `/` — landing or dashboard depending on session
- `/sign-in` — authentication
- Product pages under `/companies`, `/cities`, `/providers`, `/signals`, `/extract`, `/review`
