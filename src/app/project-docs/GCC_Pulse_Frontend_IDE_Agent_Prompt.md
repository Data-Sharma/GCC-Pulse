# GCC Pulse — IDE Agent Frontend Implementation Prompt

## Mission

Act as a senior frontend engineer working inside the existing GCC Pulse repository. Implement the frontend precisely according to the project blueprint and source files included in this repository or supplied alongside this prompt.

**Do not merely describe the implementation. Inspect the repository, create or update the files, paste the corresponding code into the correct paths, and verify the result.**

The product is a source-backed intelligence workspace for India's Global Capability Centre (GCC) ecosystem. The prototype is being built by one developer under a 40-hour deadline. Prioritize complete, coherent user flows and faithful implementation over unnecessary abstractions or line-count inflation.

## 1. Mandatory first steps

1. Inspect the current repository before changing anything.
2. Identify the framework, package manager, existing route structure, existing styles, installed dependencies, and files already implemented.
3. Read the full frontend blueprint and codebase source document supplied with this prompt. If present, inspect:
   - `FRONTEND_BLUEPRINT.md`
   - `README.md`
   - `src/app/globals.css`
   - `src/app/layout.tsx`
   - `src/components/`
   - all `src/app/**/page.tsx` files
   - all `src/app/api/**/route.ts` files
   - `src/lib/`
   - `supabase/schema.sql`
4. Treat the supplied blueprint and code snippets as the source of truth for the expected structure and behavior.
5. Produce a short implementation plan, then execute it. Do not stop after writing the plan.
6. Preserve existing working code and `.env.local`. Never print secrets or copy secret values into source files.
7. Do not run destructive commands, overwrite environment files, or remove existing user work without a clear need.

### If the blueprint/source document is missing

Search the current workspace for the supplied Markdown codebase and blueprint. If neither can be found, do not invent missing source code and claim it came from the blueprint. Implement only the requirements in this prompt and report the missing files.

## 2. Implementation objective

Build a responsive frontend for GCC Pulse with these routes:

| Route | Purpose |
|---|---|
| `/` | Overview dashboard and navigation |
| `/companies` | Searchable GCC company registry |
| `/companies/[id]` | Company profile, Indian locations, and evidence |
| `/cities` | City metrics with definitions, units, periods, and sources |
| `/providers` | Provider directory without unsupported rankings |
| `/signals` | Public announcement and expansion-signal list |
| `/extract` | Gemini-assisted extraction from pasted source text |
| `/review` | Human review of pending claims |

The interface must make it easy to understand what is known, what source supports it, what remains uncertain, and whether a claim has been reviewed.

## 3. Precise file placement and code fidelity

1. Follow the exact file paths in the supplied codebase document.
2. Open each existing file before changing it.
3. Keep files that already match the intended implementation.
4. Create missing files at their exact paths and paste the corresponding supplied code.
5. Compare differing files with the supplied version and make the smallest necessary change.
6. Keep imports, route names, exported symbols, types, and Supabase table/column names consistent.
7. Keep the frontend, Next.js API routes, shared validation, AI integration, and Supabase access in the same repository unless the existing architecture clearly requires otherwise.
8. Do not create duplicate pages, components, API routes, or parallel implementations.
9. Do not paste the entire Markdown document into one source file. Split code into the exact individual files specified by its headings.
10. Never put Markdown prose or code fences into `.tsx`, `.ts`, `.css`, `.sql`, `.json`, or `.mjs` files.
11. If supplied code has a genuine type/build error, fix the smallest necessary issue and report the correction.

## 4. Frontend design system

Use the existing stack in the repository. The intended stack is Next.js App Router, React, TypeScript, Tailwind CSS, `lucide-react`, Supabase, server-side Google Gemini, and Zod.

### Visual direction
- Professional B2B research workspace, not a marketing landing page.
- Light neutral background, white cards, subtle borders, readable dark text, and blue accent actions.
- Compact analyst-friendly navigation.
- Clear page titles, descriptions, tables, cards, badges, and source metadata.
- Responsive desktop navigation and compact/horizontal mobile navigation.
- Consistent spacing, border radius, typography, focus styles, and buttons.
- Avoid fake charts, fake counts, invented market statistics, placeholder testimonials, unnecessary animation, and decorative clutter.
- Reuse shared page headings, notices, status badges, and empty states.
- Keep styling consistent with `src/app/globals.css`.

### Accessibility
- Use semantic landmarks, headings, links, buttons, labels, and tables.
- Every input must have a visible label or accessible name.
- Interactive controls must be keyboard accessible and have visible focus styles.
- Announce errors accessibly.
- Do not communicate status by color alone.
- Tables must remain usable on small screens.
- Use safe `rel="noreferrer"` for external links opened in a new tab.
- Do not use clickable `<div>` elements when a button or link is appropriate.

## 5. Required screen behavior

### Overview (`src/app/page.tsx`)
- Show counts for records actually loaded from the database.
- Label them as current dataset coverage; never imply the count is India's total GCC count.
- Link to the main exploration and workflow pages.
- Show database errors clearly.
- Never invent counts or silently substitute fake data when Supabase is not configured.

### GCC registry (`src/app/companies/page.tsx`)
- Support company-name search.
- Display company, parent organization, industry, and website where available.
- Link each company to `/companies/[id]`.
- Show clear empty and error states.
- Do not expose raw stack traces.

### Company profile (`src/app/companies/[id]/page.tsx`)
- Display company details and linked Indian locations.
- Show location status.
- Display claims with evidence quote, source title, publisher, URL, publication date, uncertainty, and review status when available.
- Handle missing records with a not-found state.
- Render missing values as unavailable rather than inventing them.

### City intelligence (`src/app/cities/page.tsx`)
- Display city, metric name, value, unit, definition, period, and source.
- Preserve source definitions and periods.
- Do not produce a composite city ranking without a documented methodology and comparable data.
- Handle empty, partial, and error states.

### Provider explorer (`src/app/providers/page.tsx`)
- Display provider name, category, description, website, and evidence notes.
- Do not invent quality scores, reviews, verified delivery records, or rankings.
- Make clear that directory presence is not endorsement.

### Expansion radar (`src/app/signals/page.tsx`)
- Display company, city, signal type, summary, status, event date, and source metadata.
- Distinguish an announcement or hiring signal from proof of an operating GCC.
- Make unreviewed, potential, confirmed, and rejected states understandable.

### AI extraction (`src/app/extract/page.tsx`)
- Accept pasted source text with a visible maximum length and validation.
- Collect optional source title, URL, publisher, and publication date.
- Call `POST /api/extract`; never call Gemini directly from browser code.
- Show loading, success, and actionable error states.
- Render structured fields as editable controls before saving.
- Preserve evidence quote and uncertainty.
- Clearly mark results as candidate claims, not verified facts.
- Save through the existing claim API and use the reviewer guard if required.
- Do not fetch arbitrary URLs supplied by the user.
- Never expose `GEMINI_API_KEY` or `SUPABASE_SERVICE_ROLE_KEY` to the browser.

### Claim review (`src/app/review/page.tsx`)
- Load pending claims through the existing API.
- Require the configured prototype reviewer token where applicable.
- Show claim text, evidence quote, uncertainty, source details, and status.
- Support approve/reject actions through the existing API.
- Show errors for authorization or API failures.
- Do not describe the temporary token as production authentication.

## 6. API integration boundaries

Expected endpoints:
- `POST /api/extract`
- `POST /api/claims`
- `GET /api/review-queue`
- `PATCH /api/claims/[id]`

Rules:
1. Inspect existing route handlers before implementing client calls.
2. Match request and response payloads exactly to existing schemas.
3. Use shared TypeScript types where available.
4. Do not invent a competing API shape.
5. Handle non-2xx responses.
6. Keep secrets out of client components, public environment variables, console logs, and rendered HTML.
7. Do not create a second Supabase client configuration unnecessarily.
8. If a contract must change, update client and server together, validate with Zod, and explain the change.

## 7. Source-backed data and trust rules

- Do not fabricate companies, provider endorsements, city rankings, market counts, salaries, office costs, or incentives.
- Do not turn missing values into zero.
- Do not call AI-generated claims verified.
- Keep each evidence quote associated with its source.
- Show review status and uncertainty when available.
- Distinguish confirmed facts, announcements, potential signals, and unreviewed AI suggestions.
- Preserve publication and retrieval dates when available.
- Clearly label any demo data and keep it separate from factual claims.
- Do not scrape websites or fetch user-supplied URLs as part of frontend work.

## 8. Repository safety and quality

- Do not recreate the Next.js app if it already exists.
- Do not change package managers or replace lockfiles without a concrete reason.
- Preserve the existing `src/app` layout and `@/*` alias.
- Do not modify `.env.local` or print environment values.
- Never commit API keys or service-role credentials.
- Avoid `any` where clear types are practical.
- Do not add large dependencies for features the existing stack can handle.
- Avoid overengineering: this is a solo-built 40-hour prototype.

## 9. Required execution sequence

### Phase A — Audit
- Inspect the repository, dependencies, blueprint, and source code.
- Identify missing files, mismatches, and conflicts.
- Make a short plan and then continue into implementation.

### Phase B — Implement
- Create missing components and pages at exact paths.
- Paste the corresponding supplied code into each correct file.
- Align imports and types.
- Wire pages to existing data functions and API routes.
- Add accessible loading, empty, success, and error states.
- Preserve environment settings and existing local changes.

### Phase C — Validate
Run available checks, preferably:

```powershell
npm run lint
npx tsc --noEmit
npm run build
```

If a check fails, inspect the full error and fix issues introduced by the implementation. Do not disable lint rules or weaken TypeScript to hide errors. Never report a command as successful unless it completed successfully.

If installation is needed, inspect `package.json` and the lockfile first. Do not blindly replace dependency versions.

### Phase D — Browser smoke test
If a browser tool is available, visit:
- `/`
- `/companies`
- `/cities`
- `/providers`
- `/signals`
- `/extract`
- `/review`
- a valid company profile if data exists

Check responsive layout, browser-console errors, empty-data states, and at least one failed API request. If browser testing is unavailable, state that clearly.

### Phase E — Final report
Report:
1. Files created.
2. Files updated.
3. Features implemented.
4. Commands actually run and their results.
5. Unresolved errors.
6. Required environment/database setup.
7. Remaining security limitations.

Do not claim the app is production-ready while authentication, authorization, rate limiting, deployment, or other safeguards remain incomplete.

## 10. Definition of done

The task is complete only when:
- Every required route has a coherent UI.
- Pages share consistent design and navigation.
- Data-backed pages handle loaded, empty, partial, and error states.
- Company profiles expose evidence and review status.
- Extraction calls server-side Gemini and permits review before saving.
- Claim review uses the existing protected API routes.
- No secrets are exposed to browser code.
- No unsupported market claims or fake statistics are presented.
- Lint and TypeScript checks are attempted and accurately reported.
- Remaining setup and limitations are documented.

**Start by inspecting the current repository and reading the blueprint/source files. Then implement the frontend files in place. Do not stop at analysis or produce only another blueprint.**
