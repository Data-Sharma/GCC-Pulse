# Incident response (starter)

This is a **starter process** for a solo operator. It is not a 24/7 SOC playbook.

---

## Severity (working definition)

- **SEV1** — data leak of secrets or PII; production down for all users.
- **SEV2** — auth broken, extraction down, or database degraded.
- **SEV3** — incorrect claims displayed; non-critical UI bugs.

---

## Security incident

1. Rotate exposed keys (Gemini, Supabase service role, reviewer token, Vercel).
2. Revoke compromised sessions in Supabase Auth if applicable.
3. Disable public access if RLS was bypassed (dashboard).
4. Capture timestamps and request IDs **without** copying secret values into tickets.
5. After containment, review `SECURITY.md` and add an ADR if the architecture must change.

## Availability incident

1. Check Vercel deployment status and Next.js logs.
2. Check Supabase status (API, Auth, DB).
3. Check Gemini quota/errors on the extract path.
4. Roll back the Vercel deployment if a recent release caused the outage.
5. Communicate status to users if the product is public.

## Evidence / data-quality incident

1. Mark affected claims rejected or hide them from UI (implementation later).
2. Do not silently delete provenance.
3. Re-extract only after the source is understood.

## Contacts

Solo project: the repository owner is the incident commander. Add on-call contacts here when they exist. Do not put personal access tokens in this file.
