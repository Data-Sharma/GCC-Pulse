This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Demo and live data

The authenticated product defaults to a fictional, self-contained demo dataset so the dashboard and directories can be explored without seeded Supabase records or a Gemini API key. Demo company, city, signal, provider, and claim records are defined under `src/lib/mock-data/` and are visibly labelled as illustrative. Demo review decisions and provider contact actions remain local to the current page session.

To use the existing Supabase-backed data loaders instead, set this public, non-secret build-time variable before starting the development server or building for deployment:

```env
NEXT_PUBLIC_GCC_PULSE_DATA_MODE=live
```

If the variable is unset or has any other value, the app uses demo data. Rebuild or restart the development server after changing the variable. Live extraction and claim review continue to use the existing protected API endpoints and their reviewer-token configuration. The data-mode setting does not disable Supabase authentication, change access controls, or write demo records to the database.

## Authenticated GCC planning workspace

The signed-in workspace includes:

- `/profile` to view a private company profile; `/requirements` creates or edits the profile and saves it through the authenticated API.
- `/knowledge` to store company-specific source metadata and paste approved source text for chunking and indexing. Adding a URL does not fetch or verify it; URLs are retained as references only, and pasted material is marked unverified.
- `/reports` to consent to sending the saved planning profile and retrieved source excerpts to Google Gemini, generate a persistent evidence-grounded report, and review failed or completed reports.
- `/reports/[reportId]` to view a saved report, chunk-level citations and evidence gaps, and ask questions grounded in that report and authorized source material. The report chat requires explicit consent before sending the question, report/profile context, and source excerpts to xAI Grok.

Apply migrations `0005_gcc_profiles_reports_knowledge.sql` and `0006_gcc_rag_ingestion_and_retrieval.sql` in order to the configured Supabase project before using the authenticated workflow. Migration 0006 enables pgvector, adds versioned documents, chunks and embeddings, ingestion-stage history, report evidence manifests, a hybrid vector/lexical search function, and database-backed AI rate limits. The API derives ownership from the authenticated Supabase session; it does not accept a client-supplied user ID. Applying migrations is a deployment step and is not performed automatically by the application.

Start from `.env.example`. Configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; set `GEMINI_API_KEY` for report generation and embeddings, and `GROK_API_KEY` for report chat. Optional provider variables override the documented model/API defaults. `GEMINI_EMBEDDING_DIMENSIONS` must remain `3072` to match the migration's vector column. Keep provider credentials server-only; never prefix them with `NEXT_PUBLIC_`. The Gemini and xAI keys are never exposed to the browser. Missing configuration, migration/schema errors, model failures, and persistence failures return explicit errors; failed generations remain marked failed rather than being shown as completed.

Pasted source text is normalized, deduplicated, divided into overlapping chunks, embedded, and validated before it becomes searchable. The ingestion API does not fetch submitted URLs. Retrieval is restricted to the signed-in user's company knowledge and verified global sources. Report facts must cite retrieved chunk IDs; citations are resolved against stored source metadata. Ingestion stages, provider/model metadata, validation status, and evidence manifests are persisted for troubleshooting.

Report generation is decision-support, not a live market-research or legal service. It does not browse the web: it uses the user's saved planning context and retrieved knowledge excerpts. User-provided excerpts are unverified, and current market, policy, tax, compensation, cost, and legal claims require independent verification. The report prompt excludes optional contact name, role, and email. Avoid entering highly confidential information.

The public `/reports/demo` preview remains a separate illustrative demo. Public “Ask GCC Pulse” is still deterministic general Q&A and does not call Gemini; it is separate from authenticated report-specific chat. Neither public feature is a live research service or a source of verified findings.

After applying migration 0006, verify the `gcc_hybrid_search` RPC and `vector(3072)` column in the target Supabase project, then test with two authenticated users to confirm that each account can retrieve only its own company sources. The migration and live provider paths are not exercised by the local build; use non-production test accounts and approved sample text for deployment verification.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
