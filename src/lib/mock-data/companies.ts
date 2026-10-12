import type { DemoClaim, DemoCompany, DemoSource } from "./types";

const demoSource: DemoSource = {
  id: "demo-source-general",
  title: "Illustrative source reference — no external citation",
  url: null,
  publisher: "GCC Pulse demo dataset",
  published_at: null,
  retrieved_at: "2026-10-01T00:00:00.000Z",
};

const claims = (companyName: string, city: string, suffix: string): DemoClaim[] => [
  {
    id: `demo-claim-${suffix}`,
    claim_type: "location_example",
    claim_text: `${companyName} is shown with an illustrative presence in ${city}.`,
    evidence_quote: "This is an example claim included only to demonstrate the review workflow.",
    confidence: "illustrative",
    review_status: "pending",
    uncertainty: "Fictional sample record; not a verified company location.",
    created_at: "2026-09-18T00:00:00.000Z",
    sources: [{ ...demoSource, id: `demo-source-${suffix}` }],
    companies: [{ name: companyName }],
  },
];

const definitions: Omit<DemoCompany, "gcc_locations" | "evidence_claims">[] = [
  { id: "asterion-digital", name: "Asterion Digital", parent_company: "Asterion Group", industry: "Enterprise technology", website: null, description: "Fictional example profile for exploring company records, locations, and evidence review.", created_at: "2026-09-02T00:00:00.000Z", capabilities: ["Cloud engineering", "Data platforms", "Product development"] },
  { id: "meridian-financial", name: "Meridian Financial Systems", parent_company: null, industry: "Financial services", website: null, description: "Fictional financial-services profile with illustrative capability and location details.", created_at: "2026-09-04T00:00:00.000Z", capabilities: ["Risk analytics", "Platform operations"] },
  { id: "northstar-health", name: "Northstar Health Technologies", parent_company: "Northstar Health Group", industry: "Healthcare technology", website: null, description: "Fictional healthcare technology profile for the GCC Pulse demo experience.", created_at: "2026-09-06T00:00:00.000Z", capabilities: ["Clinical operations", "Digital products", "Analytics"] },
  { id: "copperleaf-mobility", name: "Copperleaf Mobility", parent_company: null, industry: "Mobility", website: null, description: "Fictional mobility company sample with an unverified illustrative footprint.", created_at: "2026-09-09T00:00:00.000Z", capabilities: ["Embedded systems", "Supply-chain analytics"] },
  { id: "bluepeak-energy", name: "Bluepeak Energy Systems", parent_company: "Bluepeak Industries", industry: "Energy", website: null, description: "Fictional energy company sample record; all details are illustrative.", created_at: "2026-09-12T00:00:00.000Z", capabilities: ["Engineering", "Grid analytics"] },
  { id: "redwood-commerce", name: "Redwood Commerce Labs", parent_company: null, industry: "Retail technology", website: null, description: "Fictional retail technology profile for demonstrating search and comparison.", created_at: "2026-09-15T00:00:00.000Z", capabilities: ["Commerce platforms", "Customer analytics"] },
  { id: "silverline-aerospace", name: "Silverline Aerospace", parent_company: "Silverline Group", industry: "Aerospace", website: null, description: "Fictional aerospace sample profile with example capability tags.", created_at: "2026-09-17T00:00:00.000Z", capabilities: ["Systems engineering", "Digital manufacturing"] },
  { id: "granite-analytics", name: "Granite Analytics", parent_company: null, industry: "Business services", website: null, description: "Fictional analytics profile used to illustrate a source-aware registry.", created_at: "2026-09-19T00:00:00.000Z", capabilities: ["Decision science", "Data engineering"] },
  { id: "willow-bio", name: "Willow BioSystems", parent_company: null, industry: "Life sciences", website: null, description: "Fictional life-sciences organization; this sample is not a verified market record.", created_at: "2026-09-21T00:00:00.000Z", capabilities: ["Research operations", "Regulatory data"] },
  { id: "summit-industrial", name: "Summit Industrial AI", parent_company: "Summit Industrial", industry: "Manufacturing", website: null, description: "Fictional manufacturing technology profile for interface demonstration.", created_at: "2026-09-23T00:00:00.000Z", capabilities: ["Industrial AI", "Automation"] },
  { id: "harborpoint-insurance", name: "Harborpoint Insurance Services", parent_company: null, industry: "Insurance", website: null, description: "Fictional insurance sample record with clearly illustrative data.", created_at: "2026-09-26T00:00:00.000Z", capabilities: ["Claims operations", "Actuarial analytics"] },
  { id: "orbit-edge", name: "Orbit Edge Networks", parent_company: "Orbit Edge Holdings", industry: "Telecommunications", website: null, description: "Fictional telecommunications profile for exploring linked records.", created_at: "2026-09-29T00:00:00.000Z", capabilities: ["Network engineering", "Cybersecurity"] },
];

const locations: Record<string, string[]> = {
  "asterion-digital": ["Bengaluru", "Hyderabad"],
  "meridian-financial": ["Mumbai", "Pune"],
  "northstar-health": ["Hyderabad", "Chennai"],
  "copperleaf-mobility": ["Pune", "Bengaluru"],
  "bluepeak-energy": ["Chennai", "Delhi NCR"],
  "redwood-commerce": ["Bengaluru", "Gurugram"],
  "silverline-aerospace": ["Hyderabad", "Pune"],
  "granite-analytics": ["Mumbai", "Bengaluru"],
  "willow-bio": ["Chennai", "Hyderabad"],
  "summit-industrial": ["Pune", "Gurugram"],
  "harborpoint-insurance": ["Mumbai", "Delhi NCR"],
  "orbit-edge": ["Gurugram", "Bengaluru"],
};

const cityStates: Record<string, string> = {
  Bengaluru: "Karnataka",
  Hyderabad: "Telangana",
  Pune: "Maharashtra",
  Chennai: "Tamil Nadu",
  Mumbai: "Maharashtra",
  "Delhi NCR": "Delhi NCR",
  Gurugram: "Haryana",
};

export const demoCompanies: DemoCompany[] = definitions.map((company) => {
  const cities = locations[company.id];
  return {
    ...company,
    gcc_locations: cities.map((city, index) => ({
      id: `${company.id}-location-${index + 1}`,
      city,
      state: cityStates[city],
      address: null,
      function_areas: company.capabilities.slice(0, index + 2),
      status: "illustrative",
    })),
    evidence_claims: claims(company.name, cities[0], company.id),
  };
});
