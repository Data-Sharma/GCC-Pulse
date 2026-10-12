import type { DemoSignal, DemoSource } from "./types";
import { demoCompanies } from "./companies";

const source: DemoSource = {
  id: "demo-signal-source",
  title: "Illustrative announcement scenario — no external citation",
  url: null,
  publisher: "GCC Pulse demo dataset",
  published_at: null,
  retrieved_at: "2026-10-01T00:00:00.000Z",
};

const examples: [string, string, string, string][] = [
  ["asterion-digital", "Bengaluru", "Hiring activity", "A fictional hiring pattern is included to show how an early lead can be triaged. Hiring alone does not establish a new centre."],
  ["meridian-financial", "Mumbai", "Leadership appointment", "A fictional leadership-change scenario illustrates signal tracking and review status."],
  ["northstar-health", "Hyderabad", "Public expansion announcement", "A fictional announcement scenario is awaiting independent source review."],
  ["copperleaf-mobility", "Pune", "New office mention", "A fictional office mention is a research lead, not confirmation of a GCC launch."],
  ["bluepeak-energy", "Chennai", "Capability growth", "A fictional capability-growth scenario is marked as unverified."],
  ["redwood-commerce", "Gurugram", "Hiring activity", "A sample hiring lead needs corroboration before any expansion conclusion."],
  ["silverline-aerospace", "Hyderabad", "Public expansion announcement", "A fictional expansion scenario demonstrates evidence review controls."],
  ["granite-analytics", "Bengaluru", "New office mention", "A fictional office reference does not establish operational status."],
  ["willow-bio", "Chennai", "Capability growth", "This synthetic signal is included only as a UI example."],
  ["summit-industrial", "Pune", "Hiring activity", "Illustrative hiring information is not independently verified."],
];

export const demoSignals: DemoSignal[] = examples.map(([companyId, city, signalType, summary], index) => {
  const company = demoCompanies.find((record) => record.id === companyId);
  if (!company) throw new Error(`Demo signal references unknown company: ${companyId}`);
  const date = new Date(Date.UTC(2026, 9, 1 - index * 2)).toISOString();
  return {
    id: `demo-signal-${index + 1}`,
    company_id: companyId,
    city,
    signal_type: signalType,
    summary,
    signal_status: "unverified",
    event_date: date.slice(0, 10),
    created_at: date,
    companies: [{ name: company.name }],
    sources: [{ ...source, id: `demo-signal-source-${index + 1}` }],
    confidence: index % 2 === 0 ? "Early lead" : "Needs review",
  };
});
