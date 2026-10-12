# City scoring methodology (planned)

Transparent scoring is **not implemented** as a shipped engine. `src/features/cities/scoring.ts` and `src/config/scoring.ts` are empty placeholders. `src/app/cities/page.tsx` is the current UI surface.

---

## Principles

1. **Weights are documented** — a city score is a weighted sum of named metrics, not a hidden model.
2. **Normalization is explicit** — each metric maps to a 0–1 scale with a written min/max or rank method.
3. **Freshness decays** — older `retrieved_at` / `period_label` reduces influence or shows a warning; it does not silently drop the city.
4. **Missing data** — omit the metric from the weighted sum **and** show a coverage percentage. Do not treat null as zero.
5. **Sources on every bar** — the UI should open the supporting `city_metrics.source_id`.

## Example (illustrative only, not production weights)

Talent availability, operating cost, connectivity, real-estate readiness, and policy environment might be five families of metrics. Actual weights require a product decision later.

## What not to do

- Do not scrape unofficial indexes into Pulse and relabel them as original research.
- Do not compare cities that have disjoint metric sets without labeling incomparability.
