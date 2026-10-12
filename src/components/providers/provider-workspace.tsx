"use client";

import { useState } from "react";
import { BriefcaseBusiness, MapPin, Search } from "lucide-react";
import { DemoBadge } from "@/components/demo-badge";
import { Notice } from "@/components/notice";

type Provider = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  evidence_note: string | null;
  service_areas?: string[];
  services?: string[];
  website?: string | null;
};

export function ProviderWorkspace({ providers, demoMode }: { providers: Provider[]; demoMode: boolean }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [city, setCity] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const categories = [...new Set(providers.map((provider) => provider.category))].sort();
  const cities = [...new Set(providers.flatMap((provider) => provider.service_areas ?? []))].sort();
  const term = query.trim().toLowerCase();
  const filtered = providers.filter((provider) => (!term || `${provider.name} ${provider.category} ${provider.description ?? ""}`.toLowerCase().includes(term)) &&
      (category === "all" || provider.category === category) &&
      (city === "all" || provider.service_areas?.includes(city)));

  return <>
    <section className="surface directory-controls">
      <label className="directory-search"><Search size={17} /><span className="sr-only">Search providers</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search providers or services" /></label>
      <label className="filter-control"><span>Category</span><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">All categories</option>{categories.map((value) => <option key={value}>{value}</option>)}</select></label>
      <label className="filter-control"><span>Service area</span><select value={city} onChange={(event) => setCity(event.target.value)}><option value="all">All areas</option>{cities.map((value) => <option key={value}>{value}</option>)}</select></label>
    </section>
    <div className="directory-toolbar"><p><strong>{filtered.length}</strong> {demoMode ? "demo " : ""}profiles <span>· {demoMode ? "Not verified or endorsed" : "Listings are not endorsements"}</span></p>{demoMode && <DemoBadge />}</div>
    {feedback && <div className="mb-4"><Notice>{feedback}</Notice></div>}
    {!filtered.length ? <div className="surface empty-state"><BriefcaseBusiness size={26} /><h2>No providers match these filters</h2><p>Try another service category or city.</p><button className="btn btn-secondary" onClick={() => { setQuery(""); setCategory("all"); setCity("all"); }}>Clear filters</button></div> :
      <div className="provider-grid">{filtered.map((provider) => <article className="surface provider-result" key={provider.id}>
        <div className="provider-result-top"><span className="provider-icon"><BriefcaseBusiness size={20} /></span>{demoMode && <DemoBadge />}</div>
        <p className="eyebrow">{provider.category}</p><h2>{provider.name}</h2><p className="provider-description">{provider.description}</p>
        <div className="provider-tags">{(provider.services ?? []).map((service) => <span key={service}>{service}</span>)}</div>
        {expanded === provider.id && <div className="provider-details"><p><MapPin size={14} /> Service areas: {(provider.service_areas ?? []).join(", ") || "Not listed"}</p><p>{provider.evidence_note}</p></div>}
        <div className="provider-actions"><button className="btn btn-secondary" onClick={() => setExpanded(expanded === provider.id ? null : provider.id)}>{expanded === provider.id ? "Hide profile" : "View profile"}</button><button className="btn btn-primary" onClick={() => setFeedback(`Demo action only: no message was sent to ${provider.name}.`)}>Contact (demo)</button></div>
      </article>)}</div>}
  </>;
}
