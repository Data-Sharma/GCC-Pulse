# GCC Pulse — Security

This is the **intended security baseline**, plus what the prototype already does. It is not a completed audit.

---

## Current baseline (prototype)

- Gemini and Supabase **service-role** usage belong on the server only.
- Reviewer writes are gated by a bearer token compared with `timingSafeEqual` in `src/lib/security.ts`.
- Prototype tables enable RLS with public **SELECT** policies. Comments in `src/app/supabase/schema.sql` state that public INSERT/UPDATE/DELETE policies are intentionally absent; writes use the service role on the server.
- Session helpers live in `src/lib/auth.ts` and `src/middleware.ts` (do not duplicate them under `src/lib/security/` while `security.ts` exists).

---

## Secret handling

- Store secrets in environment variables on the host (local `.env.local`, Vercel project env, Supabase dashboard).
- Never commit `.env.local`.
- Never print secret values in logs, docs, or issue trackers.
- Browser code may use only `NEXT_PUBLIC_*` values that are safe to expose.
- Planned: `scripts/check-env.mjs` will later verify *presence* of names, not values.

---

## Authorization (planned evolution)

| Layer | Current | Planned |
|-------|---------|---------|
| End-user session | Supabase auth + middleware | Org roles, invites |
| Reviewer API | Shared reviewer token | Per-user reviewer role + audit |
| Database | RLS read-mostly | Least-privilege write policies |
| Admin client | Server module in `server.ts` | Dedicated `admin.ts` with strict import rules |

---

## Safe errors

APIs should return generic messages to clients. Do not leak SQL, stack traces, token fragments, or raw model prompts.

---

## Source-content trust boundary

Extracted documents are **untrusted**. Treat titles, HTML, and PDF text as data, not as instructions to the model or as executable content in the UI (sanitize/escape). Prompt injection is an expected threat.

---

## Rate limiting

The repository already contains investigation notes around auth email rate limits. Any limiter added later should live in a dedicated module and must not be copied into `src/lib/security.ts` without an implementation task. A `src/lib/security/` directory was **not** created so it cannot clash with the existing `security.ts` file.

---

## Future security reviews

Before production:

- Secret rotation and env separation (preview vs production).
- RLS policy review for writes and PII.
- Dependency audit.
- Auth callback and cookie settings review.
- Formal incident process (`docs/operations/incident-response.md`).
