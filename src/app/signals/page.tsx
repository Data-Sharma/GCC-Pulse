import { PageHeading } from "@/components/page-heading";
import { Notice } from "@/components/notice";
import { loadSignals } from "@/lib/data";
import { DemoBadge } from "@/components/demo-badge";
import { SignalWorkspace } from "@/components/signals/signal-workspace";
import { isDemoMode } from "@/config/data-mode";

export const dynamic = "force-dynamic";

export default async function SignalsPage() {
  let signals: Awaited<ReturnType<typeof loadSignals>> = []; let error = "";
  try { signals = await loadSignals(); } catch (e) { error = e instanceof Error ? e.message : "Could not load signals."; }
  return <div className="app-container product-page">
    <PageHeading eyebrow="Public announcements" title="Expansion Radar" description="Investigate public-information leads carefully. Hiring activity, an office mention, or an announcement does not automatically establish a confirmed GCC expansion." action={isDemoMode ? <DemoBadge /> : undefined} />
    {error && <div className="mb-4"><Notice tone="error">{error}</Notice></div>}
    {!error && <SignalWorkspace signals={signals} demoMode={isDemoMode} />}
  </div>;
}
