"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ArrowRight, BookOpen, Building2, FileText, LoaderCircle, Send, ShieldCheck } from "lucide-react";
import { PROFILE_DRAFT_KEY } from "@/lib/reporting/requirements";

type ApiError = { error?: string };
type Profile = {
  id: string;
  company_name: string;
  requirements: Record<string, unknown>;
  updated_at: string;
};
type Source = {
  id: string;
  scope: string;
  title: string;
  url: string | null;
  publisher: string | null;
  published_at: string | null;
  retrieved_at: string;
  excerpt: string | null;
  category: string;
  verification_status: string;
  source_type: string;
  trust_tier: string;
  source_status: string;
  ingestion_status: string;
  ingestion_stage: string | null;
  ingestion_error: string | null;
  latestDocument: {
    id: string;
    chunk_count: number;
    embedding_model: string | null;
    updated_at: string;
  } | null;
  recentStages: { id: string; stage: string; status: string; error_code: string | null }[];
};
type SavedReport = {
  id: string;
  status: string;
  title: string;
  created_at: string;
  error_message: string | null;
  validation_status?: string;
  provider?: string | null;
  model?: string | null;
};
type ReportCitation = {
  sourceId: string;
  title: string;
  url: string | null;
  publisher: string | null;
  publishedAt: string | null;
  retrievedAt: string;
  verificationStatus: string;
  chunkIds: string[];
};
type Report = SavedReport & {
  report: {
    executiveSummary: string;
    sections: {
      id: string;
      title: string;
      summary: string;
      evidenceStatus: string;
      findings: { text: string; kind: string; sourceIds: string[]; chunkIds: string[] }[];
    }[];
    actionPlan: { priority: string; action: string; rationale: string }[];
    limitations: string[];
  } | null;
  evidence_source_ids: string[];
  evidence_manifest: {
    chunk_id: string;
    source_id: string;
    source_title: string;
    publisher: string | null;
    canonical_url: string | null;
    publication_date: string | null;
    retrieved_at: string;
    verification_status: string;
    section_heading: string | null;
    retrieval_rank: number;
    research_question_ids: string[];
  }[];
  profile_snapshot: Record<string, unknown> | null;
  citedSources: {
    id: string;
    title: string;
    url: string | null;
    publisher: string | null;
    published_at: string | null;
    retrieved_at: string;
    verification_status: string;
  }[];
};
type ChatMessage = { id: string; role: "user" | "assistant"; content: string; citations: ReportCitation[] };

async function responsePayload<T>(response: Response): Promise<T & ApiError> {
  return response.json() as Promise<T & ApiError>;
}

function ErrorNotice({ children }: { children: string }) {
  const signInRequired = children.toLowerCase().startsWith("sign in");
  return <p className="requirements-field-error" role="alert">{children}{signInRequired && <> <Link href="/sign-in">Sign in</Link></>}</p>;
}

export function ProfileWorkspace() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [draftAvailable, setDraftAvailable] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        setDraftAvailable(Boolean(window.localStorage.getItem(PROFILE_DRAFT_KEY)));
      } catch (cause) {
        console.error("Unable to check for a browser-saved profile draft.", cause);
      }
      fetch("/api/gcc/profile").then(responsePayload<{ profile: Profile | null }>).then((payload) => {
        if (!payload.profile && payload.error) setError(payload.error);
        else setProfile(payload.profile);
      }).catch(() => setError("Could not load the saved profile. Try again.")).finally(() => setLoading(false));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const requirements = profile?.requirements ?? {};
  const details: { label: string; value: unknown }[] = [
    { label: "Industry", value: requirements.industry },
    { label: "India presence", value: requirements.indiaPresence },
    { label: "Expansion stage", value: requirements.expansionStage },
    { label: "Target locations", value: requirements.preferredCities },
    { label: "Core functions", value: requirements.functions },
    { label: "Timeline", value: requirements.timeframe },
  ];
  return (
    <section className="workspace-page">
      <div className="page-heading">
        <div><span className="section-eyebrow">YOUR GCC WORKSPACE</span><h1>Company profile</h1><p>Manage the planning context used to tailor your saved reports.</p></div>
        <Link className="workflow-primary-button" href="/requirements?edit=true">{profile ? "Edit profile" : "Build profile"} <ArrowRight size={16} /></Link>
      </div>
      {loading ? <p role="status">Loading profile…</p> : error ? <><ErrorNotice>{error}</ErrorNotice>{draftAvailable && <Link className="workflow-secondary-button" href="/requirements?edit=true">Resume your browser-saved draft <ArrowRight size={15} /></Link>}</> : profile ? (
        <article className="workspace-card">
          <div className="workspace-card-heading"><Building2 size={20} /><div><h2>{profile.company_name}</h2><p>Saved {new Date(profile.updated_at).toLocaleDateString()}</p></div></div>
          <dl className="workspace-detail-grid">{details.map(({ label, value }) => (
            <div key={label}><dt>{label}</dt><dd>{Array.isArray(value) ? value.join(", ") : String(value ?? "Not specified")}</dd></div>
          ))}</dl>
          <div className="requirements-demo-note"><ShieldCheck size={16} /><p>Your profile is private to your account. Contact details are excluded from report-generation prompts.</p></div>
        </article>
      ) : (
        <article className="workspace-card"><h2>Start with your company context</h2><p>Build a saved profile before adding company-specific knowledge or generating reports.</p>{draftAvailable ? <Link className="workflow-primary-button" href="/requirements?edit=true">Resume your browser-saved draft <ArrowRight size={16} /></Link> : <Link className="workflow-primary-button" href="/requirements">Start profile <ArrowRight size={16} /></Link>}</article>
      )}
    </section>
  );
}

export function KnowledgeWorkspace() {
  const [sources, setSources] = useState<Source[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [publisher, setPublisher] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [contentText, setContentText] = useState("");
  const [category, setCategory] = useState("landscape");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [sourcesLoading, setSourcesLoading] = useState(true);
  const [idempotencyKey, setIdempotencyKey] = useState<string | null>(null);

  const loadSources = useCallback(async () => {
    const response = await fetch("/api/gcc/knowledge");
    const payload = await responsePayload<{ sources: Source[] }>(response);
    if (!response.ok) throw new Error(payload.error || "Could not load knowledge sources.");
    setSources(payload.sources);
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadSources().catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Could not load sources."))
        .finally(() => setSourcesLoading(false));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadSources]);

  async function addSource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const submissionKey = idempotencyKey ?? crypto.randomUUID();
      if (!idempotencyKey) setIdempotencyKey(submissionKey);
      const response = await fetch("/api/gcc/knowledge", {
        method: "POST",
        headers: { "content-type": "application/json", "idempotency-key": submissionKey },
        body: JSON.stringify({ title, url, publisher, excerpt, contentText, category }),
      });
      const payload = await responsePayload<{ source: Source; notice?: string }>(response);
      if (!response.ok) {
        await loadSources();
        throw new Error(payload.error || "Could not save the source.");
      }
      setTitle("");
      setUrl("");
      setPublisher("");
      setExcerpt("");
      setContentText("");
      setIdempotencyKey(null);
      setNotice(contentText ? "Text was chunked, embedded, and indexed as unverified source material." : payload.notice || "Source details saved.");
      await loadSources();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save the source.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="workspace-page">
      <div className="page-heading"><div><span className="section-eyebrow">SOURCES & EVIDENCE</span><h1>Knowledge base</h1><p>Save source metadata and excerpts for use as limited report context.</p></div></div>
      <div className="workspace-two-column">
        <form className="workspace-card workspace-form" onSubmit={addSource}>
          <h2><BookOpen size={19} /> Add a source</h2>
          <p>Paste text you are permitted to use. URLs are citation references only: GCC Pulse does not fetch them. Supplied text remains unverified.</p>
          <label>Source title<input required maxLength={300} value={title} onChange={(event) => setTitle(event.target.value)} /></label>
          <label>URL (optional)<input type="url" maxLength={2000} value={url} onChange={(event) => setUrl(event.target.value)} /></label>
          <label>Publisher (optional)<input maxLength={200} value={publisher} onChange={(event) => setPublisher(event.target.value)} /></label>
          <label>Category<select value={category} onChange={(event) => setCategory(event.target.value)}>{["company", "landscape", "city", "talent", "real-estate", "policy", "provider", "risk", "other"].map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
          <label>Excerpt (optional)<textarea maxLength={5000} rows={5} value={excerpt} onChange={(event) => setExcerpt(event.target.value)} /></label>
          <label>Source text to index (optional; up to 50,000 characters)<textarea maxLength={50000} rows={8} value={contentText} onChange={(event) => setContentText(event.target.value)} placeholder="Paste source text that you have permission to use. This content is untrusted and may be included in report/chat context." /></label>
          {error && <ErrorNotice>{error}</ErrorNotice>}{notice && <p role="status">{notice}</p>}
          <button className="workflow-primary-button" type="submit" disabled={busy}>{busy && <LoaderCircle className="workflow-spinner" size={16} />}{contentText ? "Save and index unverified source" : "Save metadata only"}</button>
        </form>
        <div className="workspace-card">
          <h2>Saved sources</h2>
          {sourcesLoading ? <p role="status">Loading saved sources…</p> : sources.length ? <ul className="workspace-source-list">{sources.map((source) => <li key={source.id}>
            <strong>{source.title}</strong><span>{source.publisher || "Publisher not specified"} · {source.category} · {source.verification_status.replace("_", " ")}</span>
            <span>Ingestion: {source.ingestion_status.replace("_", " ")}{source.ingestion_stage ? ` at ${source.ingestion_stage}` : ""}{source.latestDocument ? ` · ${source.latestDocument.chunk_count} chunks · ${source.latestDocument.embedding_model || "embedding model pending"}` : ""}</span>
            {source.ingestion_error && <span role="alert">Ingestion error code: {source.ingestion_error}</span>}
            {source.url && <a href={source.url} target="_blank" rel="noreferrer">Open source URL</a>}
            {source.excerpt && <p>{source.excerpt}</p>}
            {source.ingestion_status === "failed" && source.latestDocument && <button className="workflow-secondary-button" type="button" disabled={busy} onClick={async () => {
              setBusy(true);
              setError("");
              try {
                const response = await fetch(`/api/gcc/knowledge/${source.id}/ingest`, { method: "POST" });
                const payload = await responsePayload<ApiError>(response);
                if (!response.ok) throw new Error(payload.error || "Could not retry ingestion.");
                setNotice("Source ingestion completed.");
                await loadSources();
              } catch (cause) {
                setError(cause instanceof Error ? cause.message : "Could not retry ingestion.");
              } finally {
                setBusy(false);
              }
            }}>Retry ingestion</button>}
            {source.recentStages.length > 0 && <small>Recent stages: {source.recentStages.slice(0, 6).map((stage) => `${stage.stage} ${stage.status}`).join(" · ")}</small>}
          </li>)}</ul> : !error ? <p>No company sources yet. Verified global sources are included only when available.</p> : null}
          <div className="requirements-demo-note"><ShieldCheck size={16} /><p>Company sources stay unverified until independently checked. Only completed chunks are retrieved. Report/chat responses distinguish source verification and show evidence gaps.</p></div>
        </div>
      </div>
    </section>
  );
}

export function ReportsWorkspace() {
  const router = useRouter();
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [reportsLoading, setReportsLoading] = useState(true);
  const [generationKey, setGenerationKey] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState("");

  const loadReports = useCallback(async () => {
    const response = await fetch("/api/gcc/reports");
    const payload = await responsePayload<{ reports: SavedReport[] }>(response);
    if (!response.ok) throw new Error(payload.error || "Could not load reports.");
    setReports(payload.reports);
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadReports().catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Could not load reports."))
        .finally(() => setReportsLoading(false));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadReports]);

  async function generateReport() {
    setBusy(true);
    setError("");
    setGenerationStatus("Submitting a profile-specific research plan and retrieving authorized evidence…");
    try {
      const requestKey = generationKey ?? crypto.randomUUID();
      if (!generationKey) setGenerationKey(requestKey);
      const response = await fetch("/api/gcc/reports", {
        method: "POST",
        headers: { "content-type": "application/json", "idempotency-key": requestKey },
        body: JSON.stringify({ consent }),
      });
      const payload = await responsePayload<{ report: SavedReport; reportId: string; status?: string }>(response);
      if (!response.ok) {
        await loadReports();
        if (response.status === 202 && payload.reportId) {
          setGenerationStatus("Generation is already running. Waiting for its saved status…");
          for (let attempt = 0; attempt < 24; attempt += 1) {
            await new Promise((resolve) => window.setTimeout(resolve, 2500));
            const statusResponse = await fetch(`/api/gcc/reports/${payload.reportId}`);
            const statusPayload = await responsePayload<{ report: SavedReport }>(statusResponse);
            if (!statusResponse.ok) throw new Error(statusPayload.error || "Could not check report status.");
            if (statusPayload.report.status === "completed") {
              setGenerationKey(null);
              router.push(`/reports/${payload.reportId}`);
              return;
            }
            if (statusPayload.report.status === "failed") {
              setGenerationKey(null);
              throw new Error(statusPayload.report.error_message || "Report generation failed.");
            }
          }
          throw new Error("Report generation is still running. Its saved status is available in the report library.");
        }
        if (payload.reportId && payload.status === "failed") setGenerationKey(null);
        if (payload.reportId) throw new Error(`${payload.error || "Report generation failed."} Saved status: ${payload.status ?? "failed"}.`);
        throw new Error(payload.error || "Could not generate the report.");
      }
      setGenerationKey(null);
      router.push(`/reports/${payload.report.id}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not generate the report.");
      setBusy(false);
      setGenerationStatus("");
    }
  }

  return (
    <section className="workspace-page">
      <div className="page-heading"><div><span className="section-eyebrow">SAVED INTELLIGENCE</span><h1>Report library</h1><p>Reports are created from your saved profile and permitted knowledge sources.</p></div></div>
      <article className="workspace-card report-generation-card">
        <div><h2>Generate a tailored planning report</h2><p>Gemini processes your profile and relevant knowledge excerpts on the server. Contact details are excluded. Reports identify unknowns rather than inventing evidence.</p></div>
        <label className="workspace-consent"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />I agree to send my saved planning profile and relevant source excerpts to Google Gemini to generate this report.</label>
        {generationStatus && <p role="status">{generationStatus}</p>}
        {error && <ErrorNotice>{error}</ErrorNotice>}
        <button className="workflow-primary-button" type="button" disabled={!consent || busy} onClick={generateReport}>{busy ? <><LoaderCircle className="workflow-spinner" size={16} />Generating report</> : <>Generate with Gemini <ArrowRight size={16} /></>}</button>
      </article>
      <div className="workspace-card">
        <h2>Saved reports</h2>
        {reportsLoading ? <p role="status">Loading saved reports…</p> : reports.length ? <ul className="workspace-report-list">{reports.map((report) => <li key={report.id}>
          <FileText size={18} /><div><Link href={`/reports/${report.id}`}>{report.title}</Link><span>{new Date(report.created_at).toLocaleString()} · {report.status}</span>{report.error_message && <p>{report.error_message}</p>}</div>
        </li>)}</ul> : !error ? <p>No generated reports yet.</p> : null}
      </div>
    </section>
  );
}

export function ReportWorkspace({ reportId }: { reportId: string }) {
  const [report, setReport] = useState<Report | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState("");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [chatError, setChatError] = useState("");
  const [chatConsent, setChatConsent] = useState(false);

  const loadReport = useCallback(async () => {
    const response = await fetch(`/api/gcc/reports/${reportId}`);
    const payload = await responsePayload<{ report: Report; citedSources: Report["citedSources"] }>(response);
    if (!response.ok) throw new Error(payload.error || "Could not load this report.");
    setReport({ ...payload.report, citedSources: payload.citedSources });
    try {
      const chatResponse = await fetch(`/api/gcc/reports/${reportId}/chat`);
      const chatPayload = await responsePayload<{ conversationId: string | null; messages: ChatMessage[] }>(chatResponse);
      if (!chatResponse.ok) throw new Error(chatPayload.error || "Could not load saved report chat.");
      setConversationId(chatPayload.conversationId || "");
      setMessages(chatPayload.messages);
    } catch (cause) {
      setChatError(cause instanceof Error ? cause.message : "Could not load saved report chat.");
    }
  }, [reportId]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadReport().catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Could not load report.")).finally(() => setLoading(false));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadReport]);

  async function askQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setChatError("");
    const submittedQuestion = question;
    const userMessageId = `q-${Date.now()}`;
    try {
      const response = await fetch(`/api/gcc/reports/${reportId}/chat`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: submittedQuestion, consent: chatConsent, ...(conversationId ? { conversationId } : {}) }),
      });
      const payload = await responsePayload<{ conversationId: string; answer: string; citations: ReportCitation[] }>(response);
      if (payload.conversationId) setConversationId(payload.conversationId);
      if (!response.ok) {
        if (payload.conversationId) setMessages((current) => [...current, { id: userMessageId, role: "user", content: submittedQuestion, citations: [] }]);
        throw new Error(payload.error || "Could not answer the question.");
      }
      setMessages((current) => [...current,
        { id: userMessageId, role: "user", content: submittedQuestion, citations: [] },
        { id: `a-${Date.now()}`, role: "assistant", content: payload.answer, citations: payload.citations },
      ]);
      setQuestion("");
    } catch (cause) {
      setChatError(cause instanceof Error ? cause.message : "Could not answer the question.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p role="status">Loading report…</p>;
  if (error) return <section className="workspace-page"><ErrorNotice>{error}</ErrorNotice><Link href="/reports">Back to reports</Link></section>;
  if (!report) return null;
  return (
    <section className="workspace-page">
      <div className="page-heading"><div><span className="section-eyebrow">SAVED GCC INTELLIGENCE</span><h1>{report.title}</h1><p>{report.status} · {new Date(report.created_at).toLocaleString()}</p></div><Link href="/reports">All reports</Link></div>
      {report.status !== "completed" || !report.report ? (
        <article className="workspace-card"><h2>Report {report.status}</h2><p>{report.error_message || "This report has no completed content."}</p><Link className="workflow-secondary-button" href="/reports">Return to report library</Link></article>
      ) : (
        <>
          <article className="workspace-card report-summary"><h2>Executive summary</h2><p>{report.report.executiveSummary}</p><p>{report.evidence_source_ids.length || "No"} cited source(s). Validation: {report.validation_status || "legacy/unrecorded"}. {report.provider && report.model ? `Generated with ${report.provider}/${report.model}.` : ""}</p>{report.citedSources.length > 0 && <div className="report-citation-list"><strong>Retrieved evidence sources</strong>{report.citedSources.map((source) => <span key={source.id}>{source.url ? <a href={source.url} target="_blank" rel="noreferrer">{source.title}</a> : source.title} · {source.published_at ? `published ${source.published_at} · ` : ""}retrieved {source.retrieved_at.slice(0, 10)} · {source.verification_status.replace("_", " ")}</span>)}</div>}</article>
          <div className="report-section-grid">{report.report.sections.map((section) => <article className="workspace-card" key={section.id}>
            <span className={`evidence-status evidence-${section.evidenceStatus}`}>{section.evidenceStatus}</span><h2>{section.title}</h2><p>{section.summary}</p>
            <ul className="report-finding-list">{section.findings.map((finding, index) => <li key={`${section.id}-${index}`}><span>{finding.kind}</span>{finding.text}{finding.chunkIds.length > 0 && <small>Evidence: {finding.chunkIds.map((chunkId) => {
              const chunk = report.evidence_manifest.find((item) => item.chunk_id === chunkId);
              const source = report.citedSources.find((item) => item.id === chunk?.source_id);
              const label = `${source?.title ?? chunk?.source_title ?? "Source"}${chunk?.section_heading ? ` — ${chunk.section_heading}` : ""}${source?.published_at ? ` · published ${source.published_at}` : ""}${chunk ? ` · retrieved ${chunk.retrieved_at.slice(0, 10)} · ${chunk.verification_status.replace("_", " ")}` : ""}`;
              return source?.url ? <a key={chunkId} href={source.url} target="_blank" rel="noreferrer">{label}</a> : <span key={chunkId}>{label}</span>;
            })}</small>}</li>)}</ul>
          </article>)}</div>
          {report.report.actionPlan.length > 0 && <article className="workspace-card"><h2>Action plan</h2><ol>{report.report.actionPlan.map((item, index) => <li key={`${item.priority}-${index}`}><strong>{item.priority}: {item.action}</strong><p>{item.rationale}</p></li>)}</ol></article>}
          {report.report.limitations.length > 0 && <article className="workspace-card"><h2>Limitations & evidence gaps</h2><ul>{report.report.limitations.map((item, index) => <li key={index}>{item}</li>)}</ul></article>}
          <article className="workspace-card report-chat-card">
            <h2>Ask about this report</h2><p>Grok receives your question, report context, profile snapshot, and relevant authorized source excerpts to answer. This chat is separate from public Q&amp;A and does not browse the web.</p>
            <div className="report-chat-messages" aria-live="polite">{messages.map((message) => <div className={`report-chat-message ${message.role}`} key={message.id}><strong>{message.role === "user" ? "You" : "GCC Pulse report assistant"}</strong><p>{message.content}</p>{message.citations.length > 0 && <small>Sources: {message.citations.map((id) => {
              const label = `${id.title}${id.publishedAt ? ` · published ${id.publishedAt}` : ""} · retrieved ${id.retrievedAt.slice(0, 10)} · ${id.verificationStatus.replace("_", " ")}`;
              return id.url ? <a key={id.sourceId} href={id.url} target="_blank" rel="noreferrer">{label}</a> : <span key={id.sourceId}>{label}</span>;
            })}</small>}</div>)}</div>
            <label className="workspace-consent"><input type="checkbox" checked={chatConsent} onChange={(event) => setChatConsent(event.target.checked)} />I agree to send this question and relevant report/profile/source excerpts to xAI Grok for a grounded answer.</label>
            <form className="report-chat-form" onSubmit={askQuestion}><label htmlFor="report-question">Your question</label><div><input id="report-question" value={question} maxLength={4000} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask for clarification grounded in this report" required /><button type="submit" aria-label="Send question" disabled={busy || !chatConsent || !question.trim()}>{busy ? <LoaderCircle className="workflow-spinner" size={16} /> : <Send size={16} />}</button></div></form>
            {chatError && <ErrorNotice>{chatError}</ErrorNotice>}
          </article>
        </>
      )}
    </section>
  );
}
