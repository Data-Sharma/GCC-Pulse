# Deployment (intended)

GCC Pulse is intended to deploy the existing Next.js app to **Vercel**. This file documents the process; it does not deploy anything.

---

## Project

- Framework: Next.js (App Router, `src/app`)
- Build command: `next build` (npm script `build`)
- Output: Vercel Next.js defaults (do not add a dummy `vercel.json` in a structure-only change)

---

## Environment variable separation

| Name pattern | Preview | Production |
|--------------|---------|------------|
| `NEXT_PUBLIC_*` | Preview Supabase project **or** shared public URL if explicitly chosen | Production project |
| `GEMINI_API_KEY` | Restricted key / quota | Production key |
| `SUPABASE_SERVICE_ROLE_KEY` | Preview project only | Production project only |
| `GCC_PULSE_REVIEW_TOKEN` | Distinct from production | Distinct, rotated |

Do not reuse the production service role in preview.

---

## Checklist (when you actually deploy)

1. Connect the git repository to a Vercel project.
2. Set env vars in the Vercel dashboard (not in git).
3. Confirm `npm run build` locally without importing empty placeholders.
4. Run smoke checks on `/`, `/sign-in`, and existing APIs.
5. Confirm RLS still blocks anonymous writes.

Root `README.md` still contains the default Vercel blurb from create-next-app; this file is the GCC Pulse-oriented plan.
