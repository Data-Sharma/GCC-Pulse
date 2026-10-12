# User journeys

Journeys mix **current** screens with **planned** steps. If a step has no page or API yet, it is planned.

---

## 1. Source ingestion and review

**Current**

1. Open `/extract` and submit content for Gemini extraction (`POST /api/extract`).
2. Persist via `/api/claims` (prototype).
3. Open `/review` and load `/api/review-queue`.
4. Approve or reject with `PATCH /api/claims/[id]` using reviewer authorization.

**Planned**

- Dedicated evidence library UI (`/evidence` directory reserved).
- Conflict panel and superseded claims.
- Ingestion jobs and source-quality scores.

---

## 2. City comparison

**Current**

- `/cities` lists or presents city intelligence using data helpers.

**Planned**

- `/cities/compare` (folder reserved; no `page.tsx` yet).
- Score breakdowns, metric source popovers, explicit missing-data labels.

---

## 3. Company research

**Current**

- `/companies` list and `/companies/[id]` detail.

**Planned**

- Subsidiary graph, location drill-in (`/locations/[locationId]` reserved).
- All profile facts cited to approved claims.

---

## 4. Cost estimation (TCO)

**Planned end-to-end**

1. User opens cost estimator (directory reserved under `(dashboard)/cost-estimator`).
2. Enters headcount, city, facility assumptions.
3. Sees a breakdown **and** an assumption list.
4. Every cost line cites a metric source or is marked “user assumption”.

No TCO API exists today (`/api/estimates` folder reserved only).
