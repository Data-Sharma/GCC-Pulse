import { demoCities } from "./cities";
import { demoClaims } from "./claims";
import { demoCompanies } from "./companies";
import { demoSignals } from "./signals";
import type { DashboardMetric } from "./types";

export const demoDashboardMetrics: Record<DashboardMetric["id"], DashboardMetric> = {
  companies: {
    id: "companies",
    label: "Company profiles",
    value: demoCompanies.length,
    description: "Fictional profiles in the sample registry.",
  },
  cities: {
    id: "cities",
    label: "Cities represented",
    value: demoCities.length,
    description: "Illustrative city entries, not market coverage.",
  },
  signals: {
    id: "signals",
    label: "Expansion signals",
    value: demoSignals.length,
    description: "Unverified example leads, not confirmed expansions.",
  },
  claims: {
    id: "claims",
    label: "Claims to review",
    value: demoClaims.length,
    description: "Synthetic claims in the local review queue.",
  },
};
