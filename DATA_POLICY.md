# GCC Pulse — Data Policy

This policy describes **how GCC Pulse should treat evidence and personal data**. Implementation may lag. Legal and privacy review is still **future work**.

---

## Evidence provenance

Every claim shown as intelligence should be able to answer:

- Which **source** supports it (title, URL, publisher)?
- When was it **published** and **retrieved**?
- Was it extracted by **AI** or **manually**?
- Has a **human** approved, rejected, or not yet reviewed it?
- What **quote or payload** was extracted?

The prototype `sources` and `evidence_claims` tables already encode much of this. Product UI should not hide provenance in later phases.

---

## Source freshness

Display a retrieved-at / published-at label on metrics and claims (**planned** UI: freshness components). Stale sources should remain visible but marked—not silently dropped.

---

## Data quality

Prefer:

- Primary or official sources over aggregators when both exist.
- Dated documents over undated blogs.
- Corroboration from independent sources for high-impact facts (headcount, site openings).

Quality scoring is **planned** (`docs/data/source-quality-policy.md`). Do not invent scores in the UI until the methodology ships.

---

## Conflicts

If two approved claims disagree (for example two headcounts for the same location), the product should surface a **conflict**, not pick a winner in code without explanation. Conflict UI is planned (`conflict-panel` placeholder).

---

## Unknown values

Missing data is not zero. City scores and TCO outputs must label unknowns. Do not impute silently.

---

## Retention (planned)

- Source copies and extraction payloads: retain while the derived claims are in use, then follow a documented retention schedule.
- Auth accounts: follow Supabase project policy; deletion requests are a future process.
- Logs: no secrets; retention window TBD.

This repository does **not** currently automate deletion jobs.

---

## Privacy and legal review (future)

- Minimize personal data in sources (prefer organizational facts).
- Review scraping/terms of source sites before automated ingestion.
- If PII appears in evidence quotes, redact in UI and restrict access.

Until that review, treat all ingested text as potentially sensitive.
