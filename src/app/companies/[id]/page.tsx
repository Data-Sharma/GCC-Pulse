import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeading } from "@/components/page-heading";
import { Notice } from "@/components/notice";
import { StatusBadge } from "@/components/status-badge";
import { DemoBadge } from "@/components/demo-badge";
import { isDemoMode } from "@/config/data-mode";
import { demoSignals } from "@/lib/mock-data";
import { loadCompany } from "@/lib/data";

export const dynamic = "force-dynamic";

type Company = {
  id: string;
  name: string;
  parent_company: string | null;
  industry: string | null;
  website: string | null;
  description: string | null;
  gcc_locations: Array<{
    id: string;
    city: string;
    state: string | null;
    address: string | null;
    function_areas: string[];
    status: string;
  }>;
  capabilities?: string[];
  evidence_claims: Array<{
    id: string;
    claim_type: string;
    claim_text: string;
    evidence_quote: string | null;
    confidence: string;
    review_status: string;
    uncertainty: string | null;
    created_at: string;
    sources: Array<{
      id: string;
      title: string;
      url: string | null;
      publisher: string | null;
      published_at: string | null;
      retrieved_at: string;
    }>;
  }>;
};

export default async function CompanyProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let company: Company | null = null;
  try { company = await loadCompany(id); } catch {
    return <div className="app-container"><Notice tone="error">Could not load the company profile. Check database configuration.</Notice></div>;
  }
  if (!company) notFound();
  const relatedSignals = isDemoMode ? demoSignals.filter((signal) => signal.company_id === company.id) : [];
  return <div className="app-container product-page">
    <Link href="/companies" className="mb-5 inline-block text-sm font-bold text-blue-700">← Back to registry</Link>
    <PageHeading eyebrow="Company profile" title={company.name} description={company.description || "No description has been added yet."} action={isDemoMode ? <DemoBadge /> : undefined} />
    <div className="mb-5"><Notice>{isDemoMode ? "Illustrative fictional company profile. Location, capability, and evidence examples are not verified claims." : "Company information reflects the configured data source. Check claim-level review states before relying on it."}</Notice></div>
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="surface p-5">
        <h2 className="section-title">Organization details</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div><dt className="text-xs text-slate-500">Parent organization</dt><dd className="mt-1 font-semibold">{company.parent_company || "Not available"}</dd></div>
          <div><dt className="text-xs text-slate-500">Industry</dt><dd className="mt-1 font-semibold">{company.industry || "Not available"}</dd></div>
          <div className="sm:col-span-2"><dt className="text-xs text-slate-500">Website</dt><dd className="mt-1 break-words">{company.website ? <a href={company.website} target="_blank" rel="noreferrer" className="text-blue-700 underline">{company.website}</a> : "Not available"}</dd></div>
        </dl>
      </section>
      <section className="surface p-5">
        <h2 className="section-title">Indian locations</h2>
        {!company.gcc_locations?.length ? (
          <p className="muted mt-3 text-sm">No locations linked yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {company.gcc_locations.map((loc: typeof company.gcc_locations[number]) => (
              <li key={loc.id} className="rounded-xl border border-slate-200 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong>
                    {loc.city}
                    {loc.state ? `, ${loc.state}` : ""}
                  </strong>
                  <StatusBadge status={loc.status} />
                </div>
                {loc.address && <p className="mt-1 text-sm text-slate-600">{loc.address}</p>}
                {loc.function_areas?.length > 0 && <p className="muted mt-2 text-xs">Functions: {loc.function_areas.join(", ")}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
    {company.capabilities?.length ? <section className="surface mt-5 p-5"><h2 className="section-title">Capability areas</h2><div className="provider-tags mt-4">{company.capabilities.map((capability) => <span key={capability}>{capability}</span>)}</div></section> : null}
    <section className="surface mt-5 p-5">
      <h2 className="section-title">Illustrative activity timeline</h2>
      <ol className="company-timeline mt-4">
        {company.gcc_locations.map((location) => <li key={location.id}><span /><div><strong>{location.city} location example</strong><p>{location.status === "illustrative" ? "Sample record · Not verified" : `Location status: ${location.status}`}</p></div></li>)}
        {company.evidence_claims.map((claim) => <li key={claim.id}><span /><div><strong>Evidence claim added</strong><p>{new Date(claim.created_at).toLocaleDateString("en-IN")} · {claim.review_status}</p></div></li>)}
      </ol>
    </section>
    {relatedSignals.length > 0 && <section className="surface mt-5 p-5"><div className="workspace-card-heading"><div><p className="eyebrow">Research leads</p><h2>Related public signals</h2></div><DemoBadge /></div><div className="mt-4 space-y-3">{relatedSignals.map((signal) => <article className="related-signal" key={signal.id}><span className="status status-pending">{signal.signal_status}</span><strong>{signal.signal_type} · {signal.city}</strong><p>{signal.summary}</p><small>Illustrative scenario · No external source attached</small></article>)}</div></section>}
    <section className="surface mt-5 p-5">
      <h2 className="section-title">Evidence and claims</h2>
      {!company.evidence_claims?.length ? (
        <p className="muted mt-3 text-sm">No evidence claims linked to this company.</p>
      ) : (
        <div className="mt-4 space-y-4">
          {company.evidence_claims.map((claim: typeof company.evidence_claims[number]) => (
            <article key={claim.id} className="border-b border-slate-100 pb-4 last:border-0">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={claim.review_status} />
                <span className="text-xs text-slate-500">{claim.claim_type}</span>
              </div>
              <p className="mt-2 font-semibold">{claim.claim_text}</p>
              {claim.evidence_quote && (
                <blockquote className="mt-2 border-l-2 border-blue-300 pl-3 text-sm italic text-slate-600">
                  &quot;{claim.evidence_quote}&quot;
                </blockquote>
              )}
              {claim.uncertainty && <p className="mt-2 text-sm text-amber-800">Uncertainty: {claim.uncertainty}</p>}
              {claim.sources && (
                <p className="mt-2 text-sm text-slate-500">
                  Source:{" "}
                  {Array.isArray(claim.sources) && claim.sources.length > 0
                    ? (() => {
                        const src = claim.sources[0];
                        return src.url ? (
                          <a href={src.url} target="_blank" rel="noreferrer" className="text-blue-700 underline">
                            {src.title}
                          </a>
                        ) : (
                          src.title
                        );
                      })()
                    : "Source not linked"}{" "}
                  · {(Array.isArray(claim.sources) && claim.sources[0]?.publisher) || "Publisher unknown"} · Published{" "}
                  {(Array.isArray(claim.sources) && claim.sources[0]?.published_at) || "date unknown"}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  </div>;
}
