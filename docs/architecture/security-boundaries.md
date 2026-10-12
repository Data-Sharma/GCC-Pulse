# Security boundaries

## Trust zones

| Zone | Runs where | May hold | Must not hold |
|------|------------|----------|----------------|
| **Browser** | User device | Session cookies, `NEXT_PUBLIC_*` | Gemini key, service-role key, reviewer token (except when a reviewer tool sends it to the API) |
| **Next.js server** | Vercel / `next dev` | All secrets, Gemini calls, service-role client | None of those values in responses |
| **Supabase Auth** | Supabase | User credentials | Application domain secrets |
| **PostgreSQL + RLS** | Supabase | Domain rows | Service-role key (that's a dashboard/env secret) |
| **Gemini** | Google API | Prompts and source excerpts | Long-term store of GCC Pulse credentials |

## Browser

- Render escaped source quotes; never `eval` retrieved content.
- Public env vars are visible to anyone; treat them as public.

## Server

- Route Handlers and server modules import `server-only` where already used (`src/lib/security.ts`).
- Planned `src/lib/supabase/admin.ts` should only be imported from server code.

## Database

- RLS is enabled on prototype tables with public read policies.
- Writes currently rely on the service role from the server plus a reviewer token check.
- Future: per-role write policies and org isolation.

## Secrets

- Local: `.env.local` (gitignored; this task did not read or change it).
- Hosted: Vercel environment variables, separated by preview/production.
- Rotation: planned operational practice (`docs/operations/incident-response.md`).
