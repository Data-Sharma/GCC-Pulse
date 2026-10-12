import { PageHeading } from "@/components/page-heading";
import { Notice } from "@/components/notice";
import { EmptyState } from "@/components/empty-state";
import { loadMetrics } from "@/lib/data";
import { DemoBadge } from "@/components/demo-badge";
import { CityWorkspace } from "@/components/cities/city-workspace";
import { isDemoMode } from "@/config/data-mode";

export const dynamic = "force-dynamic";

export default async function CitiesPage() {
  let metrics: Awaited<ReturnType<typeof loadMetrics>> = [];
  let error = "";
  try { 
    metrics = await loadMetrics();
  } catch (e) { 
    error = e instanceof Error ? e.message : "Could not load city metrics."; 
  }
  return <div className="app-container product-page">
    <PageHeading eyebrow="Market comparison" title="City Intelligence" description="Compare sample ecosystem indicators while keeping definitions, time periods, and evidence coverage visible." action={isDemoMode ? <DemoBadge /> : undefined} />
    {error && <div className="mb-4"><Notice tone="error">{error}</Notice></div>}
    {isDemoMode ? <CityWorkspace cities={metrics} /> : <div className="surface overflow-hidden">{!metrics.length ? <EmptyState title="No city metrics yet" description="Add metrics with definitions, units, periods, and source links." /> :
      <div className="table-scroll"><table className="data-table"><thead><tr><th>City</th><th>Metric</th><th>Value</th><th>Definition</th><th>Period</th><th>Source</th></tr></thead><tbody>
        {metrics.map(m => {
          const source = Array.isArray(m.sources) ? m.sources[0] : m.sources;
          return <tr key={m.id}><td className="font-bold">{m.city}</td><td>{m.metric_name}</td><td>{m.metric_value ?? "Not available"} {m.unit || ""}</td><td className="min-w-64">{m.definition}</td><td>{m.period_label || "Not specified"}</td><td>{source?.url ? <a href={source.url} target="_blank" rel="noreferrer" className="text-blue-700 underline">{source.title}</a> : source?.title || "Source not linked"}</td></tr>;
        })}
      </tbody></table></div>}
    </div>}
  </div>;
}
