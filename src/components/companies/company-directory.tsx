"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Building2, LayoutGrid, List, RotateCcw, Search } from "lucide-react";
import { DemoBadge } from "@/components/demo-badge";
import { StatusBadge } from "@/components/status-badge";

type CompanyRow = {
  id: string;
  name: string;
  industry: string | null;
  parent_company: string | null;
  gcc_locations?: { city: string }[];
  evidence_claims?: { review_status: string }[];
  created_at?: string;
};

export function CompanyDirectory({ companies, initialQuery = "", demoMode }: { companies: CompanyRow[]; initialQuery?: string; demoMode: boolean }) {
  const [query, setQuery] = useState(initialQuery);
  const [city, setCity] = useState("all");
  const [industry, setIndustry] = useState("all");
  const [recordStatus, setRecordStatus] = useState("all");
  const [sort, setSort] = useState("name");
  const [layout, setLayout] = useState<"grid" | "list">("list");
  const [limit, setLimit] = useState(8);

  const cities = useMemo(() => [...new Set(companies.flatMap((company) => company.gcc_locations?.map((location) => location.city) ?? []))].sort(), [companies]);
  const industries = useMemo(() => [...new Set(companies.map((company) => company.industry).filter((value): value is string => Boolean(value)))].sort(), [companies]);
  const isReviewed = (company: CompanyRow) => company.evidence_claims?.some((claim) => !["pending", "unreviewed"].includes(claim.review_status));
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const rows = companies.filter((company) =>
      (!term || `${company.name} ${company.industry ?? ""} ${company.parent_company ?? ""}`.toLowerCase().includes(term)) &&
      (city === "all" || company.gcc_locations?.some((location) => location.city === city)) &&
      (industry === "all" || company.industry === industry) &&
      (recordStatus === "all" || (recordStatus === "needs-review" ? !isReviewed(company) : isReviewed(company))),
    );
    return rows.sort((a, b) => sort === "industry"
      ? (a.industry ?? "").localeCompare(b.industry ?? "") || a.name.localeCompare(b.name)
      : sort === "newest"
        ? (b.created_at ?? "").localeCompare(a.created_at ?? "")
        : a.name.localeCompare(b.name));
  }, [companies, city, industry, query, recordStatus, sort]);

  function reset() {
    setQuery("");
    setCity("all");
    setIndustry("all");
    setRecordStatus("all");
    setSort("name");
    setLimit(8);
  }

  return (
    <>
      <section className="surface directory-controls" aria-label="Company registry filters">
        <label className="directory-search">
          <Search size={17} aria-hidden="true" />
          <span className="sr-only">Search company records</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search company, parent, or sector" />
        </label>
        <label className="filter-control"><span>City</span><select value={city} onChange={(event) => setCity(event.target.value)}><option value="all">All cities</option>{cities.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label className="filter-control"><span>Sector</span><select value={industry} onChange={(event) => setIndustry(event.target.value)}><option value="all">All sectors</option>{industries.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label className="filter-control"><span>Review status</span><select value={recordStatus} onChange={(event) => setRecordStatus(event.target.value)}><option value="all">All statuses</option><option value="needs-review">Needs review</option><option value="reviewed">Reviewed</option></select></label>
        <label className="filter-control"><span>Sort by</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="name">Company name</option><option value="industry">Sector</option><option value="newest">Recently added</option></select></label>
        <button className="btn btn-secondary directory-reset" onClick={reset}><RotateCcw size={15} />Reset</button>
      </section>

      <div className="directory-toolbar">
        <p><strong>{filtered.length}</strong> {demoMode ? "sample " : ""}{filtered.length === 1 ? "profile" : "profiles"} <span>· {demoMode ? "Fictional records for product demonstration" : "Configured company records"}</span></p>
        <div className="directory-view-toggle" aria-label="Result layout">
          <button aria-label="Grid view" aria-pressed={layout === "grid"} onClick={() => setLayout("grid")}><LayoutGrid size={16} /></button>
          <button aria-label="List view" aria-pressed={layout === "list"} onClick={() => setLayout("list")}><List size={16} /></button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="surface empty-state"><Building2 size={26} /><h2>No profiles match those filters</h2><p>Try another search or reset the filters to browse the sample dataset.</p><button className="btn btn-secondary" onClick={reset}>Clear filters</button></div>
      ) : (
        <div className={layout === "grid" ? "company-grid" : "company-list"}>
          {filtered.slice(0, limit).map((company, index) => (
            <Link className="surface company-result" href={`/companies/${company.id}`} key={company.id} style={{ animationDelay: `${index * 35}ms` }}>
              <span className="company-monogram">{company.name.slice(0, 1)}</span>
              <div className="company-result-copy">
                <div className="company-result-title"><h2>{company.name}</h2>{demoMode && <DemoBadge />}</div>
                <p>{company.industry || "Sector not specified"}{company.parent_company ? ` · Part of ${company.parent_company}` : ""}</p>
                <div className="company-result-meta"><span>{company.gcc_locations?.map((location) => location.city).join(" · ") || "Locations not available"}</span><span>{company.gcc_locations?.length ?? 0} {demoMode ? "sample " : ""}locations</span></div>
              </div>
              <StatusBadge status={company.evidence_claims?.[0]?.review_status || "pending"} />
              <span className="company-result-arrow" aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
      )}
      {filtered.length > limit && <button className="btn btn-secondary directory-load-more" onClick={() => setLimit((value) => value + 8)}>Load more profiles</button>}
    </>
  );
}
