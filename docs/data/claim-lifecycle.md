# Claim lifecycle

## Current (prototype)

`evidence_claims.review_status` allows:

| State | Meaning |
|-------|---------|
| **pending** | Extracted or entered; not human-approved. |
| **approved** | Reviewer accepted the claim. |
| **rejected** | Reviewer declined the claim. |

Extractor is `manual` or `ai`. Confidence includes `unreviewed`.

Transitions today go through `PATCH /api/claims/[id]` (existing handler).

---

## Planned states

| State | Meaning |
|-------|---------|
| **conflicting** | Two or more approved (or pending) claims cannot both be true. |
| **superseded** | A newer approved claim replaces this one; history is kept. |

Planned rules:

- Rejected claims stay stored for audit; they do not feed registry totals.
- Supersede never deletes provenance.
- Only reviewers (future: named roles) may leave `pending`.

Empty modules under `src/features/claims` and `src/features/review` will own this logic later.
