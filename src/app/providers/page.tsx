import { PageHeading } from "@/components/page-heading";
import { Notice } from "@/components/notice";
import { loadProviders } from "@/lib/data";
import { DemoBadge } from "@/components/demo-badge";
import { ProviderWorkspace } from "@/components/providers/provider-workspace";
import { isDemoMode } from "@/config/data-mode";

export const dynamic = "force-dynamic";

export default async function ProvidersPage() {
  let providers: Awaited<ReturnType<typeof loadProviders>> = []; let error = "";
  try { providers = await loadProviders(); } catch (e) { error = e instanceof Error ? e.message : "Could not load providers."; }
  return <div className="app-container product-page">
    <PageHeading eyebrow="Service ecosystem" title="Provider Directory" description="Explore service categories and sample coverage areas. Listings are not endorsements or evidence of provider performance." action={isDemoMode ? <DemoBadge /> : undefined} />
    {error && <div className="mb-4"><Notice tone="error">{error}</Notice></div>}
    {!error && <ProviderWorkspace providers={providers} demoMode={isDemoMode} />}
  </div>;
}
