# Glossary

| Term | Meaning in GCC Pulse |
|------|----------------------|
| **GCC** | Global Capability Centre: a captive or hybrid delivery hub, typically in India, serving a parent enterprise. |
| **Source** | A retrieved document or page with metadata (URL, publisher, dates, hash). Table: `sources`. |
| **Claim** | A structured assertion extracted from a source (`evidence_claims`). Not yet a “fact” until reviewed. |
| **Evidence provenance** | Traceability from a UI fact back to source + quote + extractor + review status. |
| **Entity resolution** | Planned process of deciding that two names/records are the same company or location. |
| **Micro-market** | Planned geographic grain finer than city (corridor, SEZ, suburb). Not a table yet. |
| **TCO** | Total cost of ownership: modeled people + facilities + services costs with listed assumptions. Planned. |
| **Review status** | Prototype values: `pending`, `approved`, `rejected`. Planned: `conflicting`, `superseded`. |
| **Reviewer token** | Shared bearer secret (`GCC_PULSE_REVIEW_TOKEN`) used by the prototype write APIs. |
| **Signal** | An expansion-related event (`expansion_signals`) such as an announcement. |
| **City metric** | A named, sourced measurement for a city (`city_metrics`). |
| **Provider** | An ecosystem vendor (talent, real estate, etc.) in `providers`. |
| **Modular monolith** | One deployable app with internal domain folders. |
| **RLS** | PostgreSQL Row Level Security as configured in Supabase. |
