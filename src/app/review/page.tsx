"use client";

import { useMemo, useState } from "react";
import { Search, ShieldCheck } from "lucide-react";
import { DemoBadge } from "@/components/demo-badge";
import { Notice } from "@/components/notice";
import { PageHeading } from "@/components/page-heading";
import { StatusBadge } from "@/components/status-badge";
import { isDemoMode } from "@/config/data-mode";
import { demoClaims } from "@/lib/mock-data";

type RelatedCompany = { name: string } | { name: string }[] | null;
type RelatedSource = { title: string; url: string | null; publisher: string | null; published_at: string | null } | { title: string; url: string | null; publisher: string | null; published_at: string | null }[] | null;
type Claim = {
  id: string;
  claim_text: string;
  claim_type: string;
  evidence_quote: string | null;
  uncertainty: string | null;
  review_status: string;
  created_at: string;
  companies?: RelatedCompany;
  sources?: RelatedSource;
};

const initialDemoClaims: Claim[] = demoClaims.map((claim) => ({
  ...claim,
  companies: claim.companies?.[0] ?? null,
  sources: claim.sources[0] ?? null,
}));

function firstRelated<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export default function ReviewPage() {
  const [token, setToken] = useState("");
  const [claims, setClaims] = useState<Claim[]>(() => isDemoMode ? initialDemoClaims : []);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  async function load() {
    if (!token) { setError("Enter the reviewer token."); return; }
    setLoading(true); setError(""); setMessage("");
    try {
      const res = await fetch("/api/review-queue", { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not load claims.");
      setClaims(json.claims ?? []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load claims.");
    } finally {
      setLoading(false);
    }
  }

  async function act(id: string, action: "approve" | "reject") {
    setBusyId(id); setError(""); setMessage("");
    if (isDemoMode) {
      setClaims((current) => current.map((claim) => claim.id === id ? { ...claim, review_status: action === "approve" ? "approved (local demo)" : "rejected (local demo)" } : claim));
      setMessage("Demo decision updated locally for this page session. No database write occurred.");
      setBusyId("");
      return;
    }
    try {
      const res = await fetch(`/api/claims/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Review action failed.");
      setClaims((current) => current.map((claim) => claim.id === id ? { ...claim, review_status: json.claim.review_status } : claim));
      setMessage("Review decision saved to the configured backend.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Review action failed.");
    } finally {
      setBusyId("");
    }
  }

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return claims.filter((claim) => {
      const company = firstRelated(claim.companies)?.name ?? "";
      const matchesSearch = !term || `${company} ${claim.claim_type} ${claim.claim_text} ${claim.review_status}`.toLowerCase().includes(term);
      const matchesStatus = statusFilter === "all" ||
        (statusFilter === "pending" ? claim.review_status.startsWith("pending") : !claim.review_status.startsWith("pending"));
      return matchesSearch && matchesStatus;
    });
  }, [claims, query, statusFilter]);
  const pendingCount = claims.filter((claim) => claim.review_status.startsWith("pending")).length;
  const reviewedCount = claims.length - pendingCount;

  return <div className="app-container product-page review-page">
    <PageHeading eyebrow="Human verification" title="Evidence Review" description="Compare candidate claims with source context before reaching a decision. Approval indicates review, not an absolute guarantee of truth." action={isDemoMode ? <DemoBadge /> : undefined} />
    {isDemoMode ? <div className="review-demo-banner"><ShieldCheck size={18} /><span><strong>Local review demo</strong><small>Actions update only this browser session and are never sent to Supabase.</small></span></div> :
      <section className="surface review-token-panel">
        <label className="small-label" htmlFor="review-token">Reviewer token</label>
        <input id="review-token" type="password" autoComplete="off" className="field" value={token} onChange={(event) => setToken(event.target.value)} />
        <button className="btn btn-secondary" disabled={!token || loading} onClick={load}>{loading ? "Loading…" : "Load pending claims"}</button>
        <p className="muted text-xs">The protected review API requires its configured reviewer token. Review permissions are not bypassed in live mode.</p>
      </section>}
    {error && <div className="mb-4"><Notice tone="error">{error}</Notice></div>}
    {message && <div className="mb-4"><Notice tone="success">{message}</Notice></div>}
    <section className="review-summary-grid">
      <article className="surface review-summary-card"><span>Queue size</span><strong>{claims.length}</strong><small>Loaded candidate claims</small></article>
      <article className="surface review-summary-card"><span>Awaiting review</span><strong>{pendingCount}</strong><small>Needs a source comparison</small></article>
      <article className="surface review-summary-card"><span>Reviewed locally</span><strong>{reviewedCount}</strong><small>{isDemoMode ? "Current page session" : "Backend review status"}</small></article>
    </section>
    <div className="surface directory-controls review-search"><label className="directory-search"><Search size={17} /><span className="sr-only">Search review queue</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by company, claim, or status" /></label><label className="filter-control"><span>Review status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">All statuses</option><option value="pending">Pending</option><option value="reviewed">Reviewed</option></select></label><p>{filtered.length} of {claims.length} claims</p></div>
    {!filtered.length ? <div className="surface empty-state"><ShieldCheck size={27} /><h2>{claims.length ? "No claims match your search" : isDemoMode ? "The demo queue is empty" : "No claims loaded"}</h2><p>{claims.length ? "Try another search term." : isDemoMode ? "Load the sample queue again by refreshing the page." : "Load pending claims with an authorized reviewer token."}</p></div> :
      <div className="review-queue">{filtered.map((claim) => {
        const company = firstRelated(claim.companies);
        const source = firstRelated(claim.sources);
        const isPending = claim.review_status.startsWith("pending");
        return <article key={claim.id} className="surface review-claim">
          <div className="review-claim-head"><span className="review-claim-icon"><ShieldCheck size={17} /></span><span className="eyebrow">{claim.claim_type.replaceAll("_", " ")}</span><StatusBadge status={claim.review_status} /></div>
          <h2>{company?.name || "Company not linked"}</h2>
          <p className="review-claim-text">{claim.claim_text}</p>
          <div className="evidence-quote"><span>Source context</span><blockquote>{claim.evidence_quote || "No source quote attached."}</blockquote><p>{source?.url ? <a href={source.url} target="_blank" rel="noreferrer">{source.title}</a> : source?.title || "No citation attached"} · {source?.publisher || "Publisher not specified"} · {source?.published_at || "Publication date unknown"}</p></div>
          {claim.uncertainty && <p className="review-uncertainty"><strong>Uncertainty:</strong> {claim.uncertainty}</p>}
          <label className="small-label" htmlFor={`review-note-${claim.id}`}>Reviewer notes <span className="muted">(local only)</span></label>
          <textarea id={`review-note-${claim.id}`} className="field review-note" value={notes[claim.id] ?? ""} onChange={(event) => setNotes((current) => ({ ...current, [claim.id]: event.target.value }))} placeholder="Add your review context…" />
          <div className="review-actions"><p>{isPending ? "Compare claim wording and source context before acting." : `Decision: ${claim.review_status}`}</p><div><button className="btn btn-primary" disabled={busyId === claim.id || !isPending || (!isDemoMode && !token)} onClick={() => void act(claim.id, "approve")}>{busyId === claim.id ? "Updating…" : "Approve"}</button><button className="btn btn-danger" disabled={busyId === claim.id || !isPending || (!isDemoMode && !token)} onClick={() => void act(claim.id, "reject")}>Reject</button></div></div>
        </article>;
      })}</div>}
  </div>;
}
