import type { DemoClaim, DemoSource } from "./types";
import { demoCompanies } from "./companies";

const source: DemoSource = {
  id: "demo-review-source",
  title: "Illustrative review item — no external citation",
  url: null,
  publisher: "GCC Pulse demo dataset",
  published_at: null,
  retrieved_at: "2026-10-01T00:00:00.000Z",
};

export const demoClaims: DemoClaim[] = demoCompanies.slice(0, 8).map((company, index) => ({
  id: `demo-review-claim-${index + 1}`,
  claim_type: ["location_example", "capability_example", "announcement_example"][index % 3],
  claim_text: `${company.name} — illustrative ${company.capabilities[0].toLowerCase()} example associated with ${company.gcc_locations[0].city}.`,
  evidence_quote: "Synthetic example text, provided to demonstrate source comparison and review controls.",
  confidence: "illustrative",
  review_status: "pending",
  uncertainty: "Mock claim only. Not a real-world assertion or verified source excerpt.",
  created_at: new Date(Date.UTC(2026, 8, 28 - index)).toISOString(),
  sources: [{ ...source, id: `demo-review-source-${index + 1}` }],
  companies: [{ name: company.name }],
}));
