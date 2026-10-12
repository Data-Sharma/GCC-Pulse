export type DemoLocation = {
  id: string;
  city: string;
  state: string;
  address: null;
  function_areas: string[];
  status: "illustrative";
};

export type DemoSource = {
  id: string;
  title: string;
  url: null;
  publisher: string;
  published_at: null;
  retrieved_at: string;
};

export type DemoClaim = {
  id: string;
  claim_type: string;
  claim_text: string;
  evidence_quote: string;
  confidence: "illustrative";
  review_status: "pending";
  uncertainty: string;
  created_at: string;
  sources: DemoSource[];
  companies?: { name: string }[];
};

export type DemoCompany = {
  id: string;
  name: string;
  parent_company: string | null;
  industry: string;
  website: null;
  description: string;
  created_at: string;
  gcc_locations: DemoLocation[];
  evidence_claims: DemoClaim[];
  capabilities: string[];
};

export type DemoMetric = {
  id: string;
  city: string;
  metric_name: string;
  metric_value: number;
  unit: string;
  definition: string;
  period_label: string;
  sources: DemoSource[];
  sector_mix: { sector: string; value: number }[];
  activity: { period: string; value: number }[];
};

export type DemoSignal = {
  id: string;
  company_id: string;
  city: string;
  signal_type: string;
  summary: string;
  signal_status: "unverified";
  event_date: string;
  created_at: string;
  companies: { name: string }[];
  sources: DemoSource[];
  confidence: "Early lead" | "Needs review";
};

export type DemoProvider = {
  id: string;
  name: string;
  category: string;
  website: null;
  description: string;
  evidence_note: string;
  service_areas: string[];
  services: string[];
};

export type DashboardMetric = {
  id: "companies" | "cities" | "signals" | "claims";
  label: string;
  value: number;
  description: string;
};

export type Company = DemoCompany;
export type City = DemoMetric;
export type ExpansionSignal = DemoSignal;
export type Provider = DemoProvider;
export type EvidenceClaim = DemoClaim;
export type SourceReference = DemoSource;
