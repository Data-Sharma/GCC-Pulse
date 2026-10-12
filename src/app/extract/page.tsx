"use client";

import { useState } from "react";
import { FileSearch, RotateCcw, Sparkles, Upload } from "lucide-react";
import { DemoBadge } from "@/components/demo-badge";
import { Notice } from "@/components/notice";
import { PageHeading } from "@/components/page-heading";
import { ExtractionSchema, type Extraction } from "@/lib/validation";

type Result = { extraction: Extraction; review_status: "pending"; simulated: boolean };

const exampleText = "Illustrative sample announcement: Asterion Digital describes a hypothetical engineering team in Bengaluru. The fictional scenario mentions cloud engineering and data platform work. This sample text exists only to demonstrate how a source might be reviewed and is not a real company announcement.";

const demoResult: Extraction = {
  company_name: "Asterion Digital",
  parent_company: "Asterion Group",
  industry: "Enterprise technology",
  city: "Bengaluru",
  announcement_date: "2026-10-01 (illustrative)",
  signal_type: "expansion",
  summary: "Synthetic example claim: a fictional engineering team is associated with Bengaluru.",
  evidence_quote: "This is a predefined demo result, not an extract from a verified source.",
  uncertainty: "Fictional sample only. No real announcement or location has been verified.",
};

export default function ExtractPage() {
  const [sourceTitle, setSourceTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [publisher, setPublisher] = useState("");
  const [publishedAt, setPublishedAt] = useState("");
  const [text, setText] = useState("");
  const [inputType, setInputType] = useState<"text" | "file">("text");
  const [exampleLoaded, setExampleLoaded] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [reviewToken, setReviewToken] = useState("");

  function useExample() {
    setSourceTitle("Illustrative GCC Pulse extraction example");
    setSourceUrl("");
    setPublisher("GCC Pulse demo dataset");
    setPublishedAt("2026-10-01");
    setText(exampleText);
    setExampleLoaded(true);
    setResult(null);
    setError("");
    setMessage("");
  }

  async function readFile(file?: File) {
    if (!file) return;
    if (!/\.(txt|md)$/i.test(file.name)) {
      setError("Choose a plain text .txt or .md document. Files are read locally in your browser.");
      return;
    }
    if (file.size > 20_000) {
      setError("This prototype supports text files up to 20 KB.");
      return;
    }
    setError("");
    try {
      setText(await file.text());
      setSourceTitle(file.name);
      setExampleLoaded(false);
    } catch {
      setError("Could not read the selected text file. Try another .txt or .md file.");
    }
  }

  function runDemoExtraction() {
    setError("");
    setMessage("Simulated extraction only. No Gemini request was made and nothing was saved.");
    setResult({ extraction: demoResult, review_status: "pending", simulated: true });
  }

  async function runExtraction() {
    if (!reviewToken) { setError("Enter the reviewer token configured for this prototype."); return; }
    setBusy(true); setError(""); setMessage(""); setResult(null);
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${reviewToken}` },
        body: JSON.stringify({ text, sourceTitle, sourceUrl, publisher, publishedAt }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Extraction failed.");
      const parsed = ExtractionSchema.safeParse(json.extraction);
      if (!parsed.success) throw new Error("The extraction service returned invalid candidate claims.");
      setResult({ extraction: parsed.data, review_status: "pending", simulated: false });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Extraction failed.");
    } finally {
      setBusy(false);
    }
  }

  function updateText(key: Exclude<keyof Extraction, "signal_type">, value: string) {
    setResult((current) => current ? { ...current, extraction: { ...current.extraction, [key]: value } } : current);
  }

  function updateSignalType(value: Extraction["signal_type"]) {
    setResult((current) => current ? { ...current, extraction: { ...current.extraction, signal_type: value } } : current);
  }

  async function savePending() {
    if (!result || result.simulated) return;
    if (!reviewToken) { setError("Enter the reviewer token configured for this prototype."); return; }
    setBusy(true); setError(""); setMessage("");
    try {
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${reviewToken}` },
        body: JSON.stringify({ source: { title: sourceTitle || "Untitled source", url: sourceUrl, publisher, publishedAt, sourceText: text }, extraction: result.extraction }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not save claim.");
      setMessage(`Saved pending claim ${json.claimId}.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save claim.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setSourceTitle("");
    setSourceUrl("");
    setPublisher("");
    setPublishedAt("");
    setText("");
    setInputType("text");
    setExampleLoaded(false);
    setResult(null);
    setError("");
    setMessage("");
  }

  const fields: { key: keyof Extraction; label: string }[] = [
    { key: "company_name", label: "Company name" }, { key: "parent_company", label: "Parent company" },
    { key: "industry", label: "Industry" }, { key: "city", label: "City or location" },
    { key: "announcement_date", label: "Announcement date" }, { key: "signal_type", label: "Claim type" },
    { key: "summary", label: "Summary" }, { key: "evidence_quote", label: "Source reference / quote" },
    { key: "uncertainty", label: "Uncertainty" },
  ];

  return <div className="app-container product-page extraction-page">
    <PageHeading eyebrow="Source-to-claim workflow" title="AI Extraction" description="Create candidate claims from public source material. Simulated results are available without Gemini; real extraction remains behind the existing reviewer-token guard." action={<DemoBadge />} />
    <div className="extraction-workflow"><span className="workflow-step active-step"><i>1</i> Source</span><span /><span className={result ? "workflow-step active-step" : "workflow-step"}><i>2</i> Candidate claims</span><span /><span className="workflow-step"><i>3</i> Human review</span></div>
    <div className="extraction-grid">
      <section className="surface extraction-panel">
        <div className="workspace-card-heading"><div><p className="eyebrow">Step 01</p><h2>Source material</h2></div><button className="text-action" onClick={reset}><RotateCcw size={14} />Reset</button></div>
        <div className="demo-example-banner"><div><Sparkles size={17} /><span><strong>Try a safe example</strong><small>Fictional sample text · no external source</small></span></div><button className="btn btn-secondary" onClick={useExample}>Load example</button></div>
        <div className="input-type-control" role="group" aria-label="Choose source input type">
          <button className={inputType === "text" ? "selected" : ""} aria-pressed={inputType === "text"} onClick={() => setInputType("text")}>Paste text</button>
          <button className={inputType === "file" ? "selected" : ""} aria-pressed={inputType === "file"} onClick={() => setInputType("file")}>Upload text file</button>
        </div>
        <div className="source-fields">
          <div><label className="small-label" htmlFor="source-title">Source title</label><input id="source-title" className="field" value={sourceTitle} onChange={(event) => { setSourceTitle(event.target.value); setExampleLoaded(false); }} placeholder="Add a descriptive title" /></div>
          <div><label className="small-label" htmlFor="source-url">Source URL (optional)</label><input id="source-url" type="url" className="field" value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} placeholder="https://" /><p className="muted mt-1 text-xs">URL is citation metadata only. This prototype does not fetch web pages; provide the source text above.</p></div>
          <div className="source-fields-row">
            <div><label className="small-label" htmlFor="publisher">Publisher</label><input id="publisher" className="field" value={publisher} onChange={(event) => setPublisher(event.target.value)} placeholder="Publisher" /></div>
            <div><label className="small-label" htmlFor="published-at">Publication date</label><input id="published-at" type="date" className="field" value={publishedAt} onChange={(event) => setPublishedAt(event.target.value)} /></div>
          </div>
          {inputType === "text" ? <div><label className="small-label" htmlFor="source-text">Source text</label><textarea id="source-text" className="field source-textarea" maxLength={20000} value={text} onChange={(event) => { setText(event.target.value); setExampleLoaded(false); }} placeholder="Paste public announcement or report text…" /><p className="muted mt-1 text-right text-xs">{text.length.toLocaleString()} / 20,000 characters</p></div> :
            <label className="file-drop"><Upload size={22} /><strong>Choose a local text document</strong><span>Plain text .txt or .md · maximum 20 KB · read in this browser</span><input type="file" accept=".txt,.md,text/plain,text/markdown" onChange={(event) => void readFile(event.target.files?.[0])} /></label>}
        </div>
        <div className="token-panel"><label className="small-label" htmlFor="review-token">Reviewer token for live Gemini workflow</label><input id="review-token" type="password" className="field" autoComplete="off" value={reviewToken} onChange={(event) => setReviewToken(event.target.value)} /><p className="muted mt-1 text-xs">Only sent to the existing protected extraction and claim endpoints. Not needed for the local demo.</p></div>
        {error && <div className="mt-4"><Notice tone="error">{error}</Notice></div>}
        <div className="extraction-actions">
          <button className="btn btn-primary" disabled={busy || text.trim().length < 50 || !reviewToken} onClick={runExtraction}>{busy ? "Working…" : "Extract with Gemini"}</button>
          <button className="btn btn-secondary" disabled={!exampleLoaded || busy} onClick={runDemoExtraction}>Run simulated extraction</button>
        </div>
      </section>

      <section className="surface extraction-panel results-panel">
        <div className="workspace-card-heading"><div><p className="eyebrow">Step 02</p><h2>Candidate claims</h2></div>{result?.simulated && <DemoBadge>Simulated result</DemoBadge>}</div>
        <p className="muted result-intro">Candidate fields need comparison with their original source. Confidence labels do not replace human review.</p>
        {message && <div className="mb-4"><Notice tone={result?.simulated ? "info" : "success"}>{message}</Notice></div>}
        {!result ? <div className="extraction-empty"><FileSearch size={27} /><strong>Results will appear here</strong><span>Load the fictional example, then render its predefined demo result, or use the protected Gemini action.</span></div> :
          <div className="claim-result">
            <div className="claim-result-status"><span className="status status-pending">Pending review</span><span>{result.simulated ? "Predefined local sample" : "AI output · unverified"}</span></div>
            {fields.map(({ key, label }) => <div className="claim-field" key={key}>
              <label className="small-label" htmlFor={`claim-${key}`}>{label}</label>
              {["summary", "evidence_quote", "uncertainty"].includes(key) ?
                <textarea id={`claim-${key}`} className="field claim-textarea" value={String(result.extraction[key])} onChange={(event) => updateText(key as Exclude<keyof Extraction, "signal_type">, event.target.value)} /> :
                key === "signal_type" ?
                  <select id={`claim-${key}`} className="field" value={result.extraction.signal_type} onChange={(event) => updateSignalType(event.target.value as Extraction["signal_type"])}>{["new_gcc", "expansion", "office", "hiring", "other"].map((value) => <option key={value} value={value}>{value}</option>)}</select> :
                  <input id={`claim-${key}`} className="field" value={String(result.extraction[key])} onChange={(event) => updateText(key as Exclude<keyof Extraction, "signal_type">, event.target.value)} />}
            </div>)}
            {result.simulated ? <p className="demo-save-note">This result is local UI state only. It cannot be saved to the database.</p> : <button className="btn btn-primary w-full" onClick={savePending} disabled={busy || !reviewToken}>{busy ? "Saving…" : "Save source and pending claim"}</button>}
          </div>}
      </section>
    </div>
  </div>;
}
