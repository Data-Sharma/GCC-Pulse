"use client";

import { useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import { DemoBadge } from "@/components/demo-badge";
import { StatusBadge } from "@/components/status-badge";
type Signal = {
  id: string;
  city: string | null;
  signal_type: string;
  summary: string;
  signal_status: string;
  event_date: string | null;
  companies: { name: string }[];
  sources: { title: string; publisher: string | null }[];
  confidence?: string;
};

export function SignalWorkspace({ signals, demoMode }: { signals: Signal[]; demoMode: boolean }) {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("all");
  const [kind, setKind] = useState("all");
  const [status, setStatus] = useState("all");
  const [since, setSince] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [view, setView] = useState<"feed" | "timeline">("feed");
  const cities = [...new Set(signals.map((signal) => signal.city).filter((value): value is string => Boolean(value)))].sort();
  const types = [...new Set(signals.map((signal) => signal.signal_type))].sort();
  const statuses = [...new Set(signals.map((signal) => signal.signal_status))].sort();
  const term = query.trim().toLowerCase();
  const filtered = signals.filter((signal) =>
    (!term || `${signal.companies[0]?.name ?? ""} ${signal.city ?? ""} ${signal.summary}`.toLowerCase().includes(term)) &&
    (city === "all" || signal.city === city) &&
    (kind === "all" || signal.signal_type === kind) &&
    (status === "all" || signal.signal_status === status) &&
    (!since || (signal.event_date ?? "") >= since),
  );

  return (
    <>
      <section className="surface directory-controls signal-filters">
        <label className="directory-search"><Search size={17} /><span className="sr-only">Search signals</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search company, city, or summary" /></label>
        <label className="filter-control"><span>City</span><select value={city} onChange={(event) => setCity(event.target.value)}><option value="all">All cities</option>{cities.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label className="filter-control"><span>Signal type</span><select value={kind} onChange={(event) => setKind(event.target.value)}><option value="all">All types</option>{types.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label className="filter-control"><span>Status</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All statuses</option>{statuses.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label className="filter-control"><span>Observed since</span><input aria-label="Show signals observed on or after this date" type="date" value={since} onChange={(event) => setSince(event.target.value)} /></label>
        <div className="signal-view-toggle"><button aria-pressed={view === "feed"} onClick={() => setView("feed")}>Feed</button><button aria-pressed={view === "timeline"} onClick={() => setView("timeline")}>Timeline</button></div>
      </section>
      <div className="directory-toolbar"><p><strong>{filtered.length}</strong> {demoMode ? "illustrative " : ""}signal leads <span>· {demoMode ? "Not independently verified" : "Signal status reflects configured records"}</span></p>{demoMode && <DemoBadge />}</div>
      {!filtered.length ? <div className="surface empty-state"><h2>No signals match these filters</h2><p>Adjust the search or choose another city or signal type.</p><button className="btn btn-secondary" onClick={() => { setQuery(""); setCity("all"); setKind("all"); setStatus("all"); setSince(""); }}>Clear filters</button></div> :
        <div className={`signal-feed ${view === "timeline" ? "signal-feed-timeline" : ""}`}>{filtered.map((signal) => {
          const isExpanded = expanded === signal.id;
          return <article className="surface signal-result" key={signal.id}>
            <div className="signal-date"><span>{new Date(`${signal.event_date}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</span><i /></div>
            <div className="signal-result-body">
              <div className="signal-result-top"><span className="signal-kind">{signal.signal_type}</span><StatusBadge status={signal.signal_status} /></div>
              <h2>{signal.companies[0]?.name || "Company not linked"} <span>· {signal.city || "City not specified"}</span></h2>
              <p>{signal.summary}</p>
              {isExpanded && <div className="signal-detail"><p><strong>Interpretation:</strong> This lead is not, by itself, confirmation of a GCC launch or operating centre.</p><p><strong>Source:</strong> {signal.sources[0]?.title ?? "No source reference linked"} · {signal.sources[0]?.publisher ?? (demoMode ? "Demo dataset" : "Publisher unavailable")}</p><p><strong>Review state:</strong> {signal.signal_status.replaceAll("_", " ")}{demoMode ? " · Not independently verified" : ""}</p></div>}
              <button className="text-action" aria-expanded={isExpanded} onClick={() => setExpanded(isExpanded ? null : signal.id)}>{isExpanded ? "Hide details" : "Review signal details"} <ArrowUpRight size={14} /></button>
            </div>
          </article>;
        })}</div>}
    </>
  );
}
