# Acceptance criteria (product-level)

These criteria apply to **future** feature work unless noted as already true.

---

## Trust

- A user can see the source behind a displayed claim or metric.
- AI-extracted items start unreviewed (prototype: `confidence` / `review_status` on `evidence_claims`).
- Rejected claims do not appear as verified facts.
- Conflicts are visible rather than last-write-wins (planned).

## Security

- Browser bundles do not contain `GEMINI_API_KEY` or `SUPABASE_SERVICE_ROLE_KEY`.
- Unauthenticated users cannot write claims (prototype: reviewer token + no public write RLS).
- API errors do not include secrets or stack traces.

## Persistence

- Sources and claims survive process restart (Supabase).
- Existing schema remains the prototype contract until a dedicated migration change.
- Unknown / null metrics persist as null, not coerced zeros.

## User workflow

- Sign-in and session restore work via current `/sign-in` and `/auth/callback`.
- Reviewers can list pending claims and record a decision.
- Authenticated home shows the workspace; signed-out home shows the landing page (current `src/app/page.tsx`).

## Non-goals for structure-only work

Empty placeholders must not be required for `next build` to succeed. They are not imported.
