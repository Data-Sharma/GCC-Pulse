# Supabase migration reconciliation

## Why this exists

The live Supabase project already had the original GCC tables, but the repository's numbered migrations 0001–0004 were empty and the RAG migrations were recorded remotely under timestamped versions. That made the repository unable to reproduce the intended schema reliably.

## Migration sequence

- `20261019050000_initial_schema.sql`: idempotent baseline from `src/app/supabase/schema.sql`; public reads of evidence claims are limited to approved claims.
- `20261019050407_gcc_profiles_reports_knowledge.sql`: profiles, reports, company knowledge sources, conversations and messages.
- `20261019050426_gcc_rag_ingestion_and_retrieval.sql`: documents, chunks, 3072-dimensional Gemini embeddings, hybrid retrieval, evidence manifests, and request limits.
- `20261019050435_restrict_rls_auto_enable_execution.sql`: removes direct API-role execution of the event-trigger helper.
- `20261019050535_index_foreign_keys.sql`: indexes for foreign-key lookups.
- `20261019053604_harden_rate_limit_and_public_claims.sql` and `20261019053653_harden_public_claims_and_rate_limit_function.sql`: preserve the applied hardening steps in remote migration history.
- `20261019053721_index_report_evidence_fk.sql`: covers the report-evidence composite foreign key.

## Safety notes

- The empty legacy migration files were removed from this branch rather than retained as misleading migration history.
- The original GCC schema is preserved; no tables or rows are dropped.
- The baseline uses `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, and replaceable policies to support an already-provisioned project.
- Before merging, inspect the pull request and verify the migration list against the target Supabase project.
- Do not run `supabase db reset` against production.
- The rate-limit function remains `SECURITY DEFINER` intentionally because the app invokes it through authenticated Supabase RPC. It validates `auth.uid()`, restricts operation names, uses a fixed search path, and limits per-user requests. Review this design before changing its grants.
- Enable leaked-password protection in Supabase Dashboard → Authentication → Settings → Password Security; this setting is not managed by SQL migrations.
