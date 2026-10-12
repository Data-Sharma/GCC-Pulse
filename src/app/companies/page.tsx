import { PageHeading } from "@/components/page-heading";
import { Notice } from "@/components/notice";
import { DemoBadge } from "@/components/demo-badge";
import { CompanyDirectory } from "@/components/companies/company-directory";
import { loadCompanies } from "@/lib/data";
import { isDemoMode } from "@/config/data-mode";

export const dynamic = "force-dynamic";

export default async function CompaniesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  let rows: Awaited<ReturnType<typeof loadCompanies>> = [];
  let error = "";
  try { rows = await loadCompanies(); } catch (e) { error = e instanceof Error ? e.message : "Could not load registry."; }
  return <div className="app-container product-page">
    <PageHeading eyebrow="Company intelligence" title="GCC Registry" description={isDemoMode ? "Explore a structured directory with linked locations and clear evidence states. Sample entries are fictional and do not describe verified companies or centres." : "Explore configured company records and linked locations. Review evidence status before relying on centre details."} action={isDemoMode ? <DemoBadge /> : undefined} />
    {error && <div className="mb-4"><Notice tone="error">{error}</Notice></div>}
    {!error && <CompanyDirectory companies={rows} initialQuery={q} demoMode={isDemoMode} />}
  </div>;
}
