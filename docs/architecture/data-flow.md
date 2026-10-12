# Data flow — source to intelligence

This is the **target** lifecycle. Steps marked *current* already have code or tables; others are planned.

```text
[Source document]
        │  ingest metadata (URL, publisher, retrieved_at, hash)
        ▼
[Extraction]  *current API: POST /api/extract*
        │  Gemini on the server proposes structured fields
        │  Zod validates the model payload
        ▼
[Claim record]  *current: evidence_claims + sources*
        │  review_status = pending (prototype)
        ▼
[Human review]  *current: PATCH /api/claims/[id], /review, review-queue*
        │  approved | rejected
        ▼
[Intelligence views]
        │  companies, locations, city metrics, providers, signals
        ▼
[UI]
        provenance + freshness shown with the fact  (partially planned)
```

## Source → claim

1. A reviewer (or later an ingestion job) supplies source text or a URL.
2. The extract API returns candidate claims; it does not, by itself, have to persist them.
3. The claims API persists source + claim rows (current prototype).

## Claim → reviewed fact

Reviewers approve or reject. The prototype uses `pending` / `approved` / `rejected` on `evidence_claims`. Planned states include `conflicting` and `superseded` (`docs/data/claim-lifecycle.md`).

## Reviewed fact → displayed record

Company pages, city metrics, and signals should prefer **approved** claims and still show the supporting source. Conflict resolution UI is planned.

## Failures

- Invalid model JSON → 4xx from validation; nothing silent is stored.
- Missing reviewer token → writes fail (current security helper).
- Unknown metrics → display “unknown”, not zero.
