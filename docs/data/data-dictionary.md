# Data dictionary (logical)

This describes **logical entities**. It does **not** alter SQL. The prototype physical schema remains `src/app/supabase/schema.sql`.

---

## Current prototype entities

| Entity | Purpose | Notes |
|--------|---------|--------|
| **Company** | Named organization in the registry | `companies` |
| **GCC location** | A site belonging to a company | `gcc_locations`; status `active` / `announced` / `unverified` |
| **Source** | Evidence document metadata | `sources` |
| **Evidence claim** | Extracted assertion linked to source (and optionally company/location) | `evidence_claims` |
| **Provider** | Ecosystem service firm | `providers` |
| **City metric** | Numeric or labeled city statistic | `city_metrics` |
| **Expansion signal** | Announcement or similar | `expansion_signals` |

Field-level detail should be read from the existing schema file, not duplicated here as SQL.

---

## Planned logical entities (not created in this task)

- **Organization / workspace** — tenant for future multi-user accounts.
- **Membership / role** — authorization beyond reviewer token.
- **Subsidiary link** — explicit parent/child company graph.
- **Micro-market** — sub-city geography.
- **Claim conflict** — pair or group of incompatible claims.
- **Review decision audit** — who decided, when, why.
- **Estimate / TCO run** — saved assumption sets and outputs.
- **Source quality score** — derived, versioned methodology.

Do not add these tables until a schema-change task is approved.
