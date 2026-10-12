import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Building2,
  CircleCheck,
  FileSearch,
  MapPinned,
  Radar,
  ShieldCheck,
} from "lucide-react";
import { DemoBadge } from "@/components/demo-badge";
import { Notice } from "@/components/notice";
import { PageHeading } from "@/components/page-heading";
import { isDemoMode } from "@/config/data-mode";
import { demoActivity, demoDashboardMetrics } from "@/lib/mock-data";
import { loadCompanies, loadPendingClaims, loadProviders, loadSignals } from "@/lib/data";

export async function DashboardOverview() {
  let companies: Awaited<ReturnType<typeof loadCompanies>> = [];
  let providers: Awaited<ReturnType<typeof loadProviders>> = [];
  let signals: Awaited<ReturnType<typeof loadSignals>> = [];
  let claims: Awaited<ReturnType<typeof loadPendingClaims>> = [];
  let error = "";

  try {
    [companies, providers, signals, claims] = await Promise.all([
      loadCompanies(),
      loadProviders(),
      loadSignals(),
      loadPendingClaims(),
    ]);
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "Could not load dashboard data.";
  }

  const cityCounts = companies.reduce<Record<string, number>>((result, company) => {
    for (const location of company.gcc_locations ?? []) {
      result[location.city] = (result[location.city] ?? 0) + 1;
    }
    return result;
  }, {});
  const cities = Object.entries(cityCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const cards = [
    { label: "Company profiles", count: isDemoMode ? demoDashboardMetrics.companies.value : companies.length, icon: Building2, detail: isDemoMode ? demoDashboardMetrics.companies.description : "Loaded from configured source" },
    { label: "Cities represented", count: isDemoMode ? demoDashboardMetrics.cities.value : cities.length, icon: MapPinned, detail: isDemoMode ? demoDashboardMetrics.cities.description : "Across loaded company records" },
    { label: "Expansion signals", count: isDemoMode ? demoDashboardMetrics.signals.value : signals.length, icon: Radar, detail: isDemoMode ? demoDashboardMetrics.signals.description : "Leads, not confirmed expansions" },
    { label: "Claims to review", count: isDemoMode ? demoDashboardMetrics.claims.value : claims.length, icon: ShieldCheck, detail: isDemoMode ? demoDashboardMetrics.claims.description : "Pending source review" },
  ];
  const quickActions = [
    { href: "/companies", label: "Explore companies", icon: Building2 },
    { href: "/cities", label: "Compare cities", icon: MapPinned },
    { href: "/signals", label: "Review signals", icon: Radar },
    { href: "/extract", label: "Try document extraction", icon: FileSearch },
  ];
  const maxCityValue = Math.max(1, ...cities.map(([, value]) => value));
  const activity = isDemoMode ? demoActivity : [];
  const maxActivity = Math.max(1, ...activity.map((item) => item.records + item.signals));

  return (
    <div className="app-container product-page dashboard-page">
      <PageHeading
        eyebrow="Your GCC intelligence workspace"
        title="A clearer view of India's GCC ecosystem."
        description={isDemoMode ? "Explore connected sample records, compare city context, and inspect how evidence moves through review. Demo metrics describe only this fictional dataset." : "Explore connected company, city, signal, and evidence records from your configured data source."}
        action={isDemoMode ? <DemoBadge /> : undefined}
      />
      {error && <div className="mb-5"><Notice tone="error">{error}</Notice></div>}

      <section className="welcome-panel">
        <div><p className="eyebrow">Workspace overview</p><h2>Intelligence, with context.</h2><p>{isDemoMode ? "Browse the demonstration dataset and try the product workflows. Nothing in demo mode is written to Supabase." : "Explore connected company, city, signal, and evidence records from your configured data source."}</p></div>
        <Link href="/companies" className="btn btn-primary">Explore the registry <ArrowRight size={16} /></Link>
        <span className="welcome-orbit" aria-hidden="true" />
      </section>

      <section className="metric-grid" aria-label="Sample dataset metrics">
        {cards.map(({ label, count, icon: Icon, detail }) => <article className="surface metric-card" key={label}>
          <div className="metric-card-top"><span className="metric-icon"><Icon size={18} /></span><span>{isDemoMode ? "DEMO" : "LIVE"}</span></div>
          <p className="metric-value">{count.toLocaleString()}</p><h2>{label}</h2><p className="metric-detail">{detail}</p>
        </article>)}
      </section>

      <section className="dashboard-grid">
        <article className="surface dashboard-card activity-card">
          <div className="workspace-card-heading"><div><p className="eyebrow">{isDemoMode ? "Illustrative trend" : "Activity history"}</p><h2>Ecosystem activity</h2></div>{isDemoMode && <span className="chart-legend"><i /> Sample profiles <i className="legend-cyan" /> Demo signals</span>}</div>
          {activity.length > 0 ? <div className="activity-chart" role="img" aria-label="Illustrative sample profile and signal counts across six periods">
            <div className="chart-y-axis"><span>16</span><span>12</span><span>8</span><span>4</span><span>0</span></div>
            <div className="chart-grid-lines"><i /><i /><i /><i /><i /></div>
            <div className="chart-columns">{activity.map((point) => <div className="chart-period" key={point.period}><div className="chart-bars"><span className="bar-blue" style={{ height: `${point.records / maxActivity * 100}%` }} /><span className="bar-cyan" style={{ height: `${point.signals / maxActivity * 100}%` }} /></div><span>{point.period}</span></div>)}</div>
          </div> : <div className="chart-live-empty">A historical activity series is not available from the configured source.</div>}
          <p className="chart-caption">{isDemoMode ? "Sample counts by period · Illustrative data, not a market time series" : "Historical series is shown only when available in the configured source"}</p>
        </article>

        <article className="surface dashboard-card city-distribution">
          <div className="workspace-card-heading"><div><p className="eyebrow">Sample locations</p><h2>City distribution</h2></div><Link href="/cities" className="icon-link" aria-label="Open city intelligence"><ArrowUpRight size={17} /></Link></div>
          {cities.map(([city, value]) => <div className="distribution-row" key={city}><div><span>{city}</span><strong>{value}</strong></div><span className="distribution-track"><i style={{ width: `${Math.max(5, value / maxCityValue * 100)}%` }} /></span></div>)}
          <p className="chart-caption">Illustrative records · Not a city ranking</p>
        </article>
      </section>

      <section className="dashboard-grid lower-dashboard-grid">
        <article className="surface dashboard-card">
          <div className="workspace-card-heading"><div><p className="eyebrow">Research leads</p><h2>Recent expansion signals</h2></div><Link href="/signals" className="text-action">View all <ArrowRight size={14} /></Link></div>
          <div className="dashboard-list">{signals.slice(0, 4).map((signal) => <div className="dashboard-list-item" key={signal.id}><span className="list-dot" /><div><strong>{signal.companies[0]?.name || "Company not linked"}</strong><p>{signal.signal_type} · {signal.city || "Location not specified"}</p></div><span className="status status-pending">Unverified</span></div>)}</div>
        </article>
        <article className="surface dashboard-card">
          <div className="workspace-card-heading"><div><p className="eyebrow">Registry preview</p><h2>Recent company profiles</h2></div><Link href="/companies" className="text-action">View all <ArrowRight size={14} /></Link></div>
          <div className="dashboard-list">{companies.slice(0, 4).map((company) => <Link href={`/companies/${company.id}`} className="dashboard-list-item dashboard-company-item" key={company.id}><span className="company-monogram small-monogram">{company.name.slice(0, 1)}</span><div><strong>{company.name}</strong><p>{company.industry || "Sector not specified"}</p></div><ArrowUpRight size={15} /></Link>)}</div>
        </article>
      </section>

      <section className="dashboard-grid lower-dashboard-grid">
        <article className="surface dashboard-card">
          <div className="workspace-card-heading"><div><p className="eyebrow">Evidence first</p><h2>Review queue</h2></div><Link href="/review" className="text-action">Open review <ArrowRight size={14} /></Link></div>
          <div className="dashboard-list">{claims.slice(0, 3).map((claim) => <div className="dashboard-list-item" key={claim.id}><CircleCheck className="review-list-icon" size={17} /><div><strong>{claim.companies?.[0]?.name || "Unlinked claim"}</strong><p>{claim.claim_type} · Needs source review</p></div><span className="status status-pending">Pending</span></div>)}</div>
          <p className="chart-caption">Actions in demo review stay in this browser session; nothing is saved.</p>
        </article>
        <article className="surface dashboard-card quick-actions-card">
          <div className="workspace-card-heading"><div><p className="eyebrow">Get started</p><h2>Quick actions</h2></div><Activity size={18} /></div>
          <div className="quick-actions-grid">{quickActions.map(({ href, label, icon: Icon }) => <Link href={href} className="quick-action" key={href}><span><Icon size={17} /></span><strong>{label}</strong><ArrowUpRight size={14} /></Link>)}</div>
          <p className="chart-caption">{providers.length} demo provider profiles are available to explore.</p>
        </article>
      </section>

      {!isDemoMode && <p className="chart-caption">Live data mode. Records and actions are provided by the configured backend.</p>}
    </div>
  );
}
