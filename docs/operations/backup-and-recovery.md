# Backup and recovery (future expectations)

No automated backup job is configured in this repository. Operators should use **Supabase-native** backups for the hosted database.

---

## Expectations

- **Database:** Point-in-time recovery / daily backups as enabled on the Supabase plan. Document the retention window in the dashboard.
- **Objects:** If source files are stored later (not in the current prototype schema), back up that bucket separately.
- **Application:** The git repository is the backup of code. Do not treat Vercel deployments as the only copy.
- **Secrets:** Stored in Vercel/Supabase, not in git. Recovery = restore env vars from a password manager.

---

## Restore (planned runbook)

1. Identify the incident time and stop writers if needed.
2. Restore PostgreSQL to a new instance or PITR timestamp.
3. Verify row counts for `companies`, `sources`, `evidence_claims`.
4. Point the app env at the restored project **or** fail over DNS.
5. Record the event (`incident-response.md`).

Empty `supabase/seed.sql` is not a backup. `src/app/supabase/seed.example.sql` is example data only.
