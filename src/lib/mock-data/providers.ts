import type { DemoProvider } from "./types";

const examples: [string, string, string, string[]][] = [
  ["Cedarstone Advisory", "Strategy and advisory", "Fictional strategy advisory profile for demonstrating provider discovery.", ["Market-entry planning", "Operating models"]],
  ["Lattice Legal Studio", "Legal and compliance", "Fictional legal-services profile. No endorsement or client relationship is implied.", ["Entity setup", "Regulatory research"]],
  ["Northwind Tax Partners", "Tax and audit", "Fictional tax and audit profile for the demo directory.", ["Tax planning", "Audit readiness"]],
  ["UrbanArc Workspaces", "Commercial real estate", "Fictional real-estate services profile; availability is not represented.", ["Site selection", "Workplace planning"]],
  ["Bridgeway Talent Co.", "Recruitment", "Fictional recruitment profile with illustrative service areas.", ["Leadership search", "Talent mapping"]],
  ["Harborline People Ops", "Payroll and EOR", "Fictional payroll and employer-of-record profile.", ["Payroll operations", "People support"]],
  ["Signalpath Technology", "Technology and operations support", "Fictional technology operations profile for UI demonstration.", ["Cloud operations", "Service desk"]],
  ["Clearframe Compliance", "Legal and compliance", "Fictional compliance support profile; no verified credentials are claimed.", ["Policy design", "Compliance workflows"]],
  ["Foundry Finance Desk", "Tax and audit", "Fictional finance support profile with no performance claims.", ["Accounting setup", "Controls design"]],
  ["Avenue One Search", "Recruitment", "Fictional talent partner profile; no candidate network or outcomes are asserted.", ["Technical hiring", "Talent operations"]],
];

export const demoProviders: DemoProvider[] = examples.map(([name, category, description, services], index) => ({
  id: `demo-provider-${index + 1}`,
  name,
  category,
  website: null,
  description,
  evidence_note: "Demo profile. Not verified, endorsed, or connected to a real provider.",
  service_areas: ["Bengaluru", "Hyderabad", "Pune", "Chennai", "Mumbai", "Delhi NCR", "Gurugram"].slice(index % 4, (index % 4) + 4),
  services,
}));
