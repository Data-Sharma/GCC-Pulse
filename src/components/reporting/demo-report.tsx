"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowUpRight, CheckCircle2, CircleHelp, FileDown, MapPin, RotateCcw, ShieldAlert } from "lucide-react";
import { demoCities, demoCompanies, demoProviders } from "@/lib/mock-data";
import {
  REPORT_HANDOFF_KEY,
  ReportRequirementsSchema,
  type ReportRequirements,
} from "@/lib/reporting/requirements";

const moduleNames: Record<string, string> = {
  strategy: "Objectives & planning",
  location: "City shortlist",
  talent: "Talent considerations",
  "real-estate": "Real estate & workplace",
  policy: "Policy research checklist",
  providers: "Provider categories",
  "next-steps": "Suggested next steps",
};

function ChoiceList({ title, values }: { title: string; values: string[] }) {
  return (
    <div className="report-choice-block">
      <h3>{title}</h3>
      <ul>{values.map((value) => <li key={value}>{value}</li>)}</ul>
    </div>
  );
}

export function DemoReport() {
  const router = useRouter();
  const [requirements, setRequirements] = useState<ReportRequirements | null>(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const handoff = window.sessionStorage.getItem(REPORT_HANDOFF_KEY);
        if (!handoff) {
          setLoadError("This report preview is available in the browser tab where you completed the planning questions.");
          return;
        }
        const parsed = ReportRequirementsSchema.safeParse(JSON.parse(handoff));
        if (!parsed.success) {
          setLoadError("The report choices could not be validated. Start a new planning profile to try again.");
          return;
        }
        setRequirements(parsed.data);
      } catch (error) {
        console.error("Unable to load the local demo report.", error);
        setLoadError("The report could not be loaded from this browser session. Start a new planning profile to try again.");
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const displayedCities = useMemo(() => {
    if (!requirements || requirements.preferredCities.includes("No shortlist yet")) return demoCities;
    return demoCities.filter((city) => requirements.preferredCities.includes(city.city));
  }, [requirements]);

  const modules = requirements?.reportModules ?? [];
  const sectionLinks = modules.map((key) => ({ key, label: moduleNames[key] ?? key }));
  const startNew = () => {
    try {
      window.sessionStorage.removeItem(REPORT_HANDOFF_KEY);
      router.push("/requirements");
    } catch (error) {
      console.error("Unable to clear the local report from this browser session.", error);
      setLoadError("We could not clear the previous report choices. You can still use Edit inputs to update them.");
    }
  };

  if (loadError) {
    return (
      <main className="demo-report-page">
        <header className="workflow-header">
          <Link className="workflow-wordmark" href="/">GCC <span>Pulse</span></Link>
          <span className="workflow-demo-tag"><span />Illustrative demo</span>
        </header>
        <section className="report-unavailable">
          <CircleHelp size={25} />
          <h1>Report preview unavailable</h1>
          <p>{loadError}</p>
          <button className="workflow-primary-button" type="button" onClick={() => router.push("/requirements")}>Start a planning profile <ArrowUpRight size={16} /></button>
        </section>
      </main>
    );
  }

  if (!requirements) {
    return <main className="demo-report-page"><p className="report-loading" role="status">Opening your report preview…</p></main>;
  }

  return (
    <main className="demo-report-page">
      <header className="workflow-header report-header">
        <Link className="workflow-wordmark" href="/">GCC <span>Pulse</span></Link>
        <span className="workflow-demo-tag"><span />Illustrative demo report</span>
        <div className="report-header-actions">
          <button className="workflow-secondary-button" type="button" onClick={() => router.push("/requirements?edit=1")}><ArrowLeft size={15} />Edit inputs</button>
          <button className="workflow-primary-button" type="button" onClick={() => window.print()}><FileDown size={15} />Print / save PDF</button>
        </div>
      </header>

      <div className="report-layout">
        <aside className="report-sidebar">
          <p className="workflow-eyebrow">Your planning profile</p>
          <h1>{requirements.organizationName}</h1>
          <p>{requirements.industry} · {requirements.indiaPresence}</p>
          <span className="report-demo-label"><ShieldAlert size={14} /> Mock data — not live research</span>
          <nav aria-label="Report sections">
            {sectionLinks.map(({ key, label }) => <a href={`#report-${key}`} key={key}>{label}<ArrowUpRight size={12} /></a>)}
            <a href="#report-limitations">Evidence & limitations<ArrowUpRight size={12} /></a>
          </nav>
          <button className="report-restart-button" type="button" onClick={startNew}><RotateCcw size={14} />Start over</button>
        </aside>

        <article className="report-content">
          <div className="report-title-block">
            <p className="workflow-eyebrow">Personalized GCC planning preview</p>
            <h2>A starting point for your India GCC research.</h2>
            <p>Prepared for {requirements.reportAudience.toLowerCase()} · {requirements.reportDepth.toLowerCase()}</p>
            {requirements.reportQuestion && <div className="report-question"><span>Your key question</span><p>{requirements.reportQuestion}</p></div>}
          </div>

          <div className="report-prominent-disclaimer">
            <ShieldAlert size={19} />
            <div><strong>Illustrative demo — not a market report or recommendation.</strong><p>This preview is assembled in your browser from your choices and GCC Pulse&apos;s fictional sample dataset. It includes no live research, verified market facts, pricing, incentive eligibility, or external citations.</p></div>
          </div>

          {modules.includes("strategy") && (
            <section className="report-section" id="report-strategy">
              <div className="report-section-heading"><span>01</span><div><p className="workflow-eyebrow">Planning context</p><h2>Objectives & planning</h2></div></div>
              <div className="report-profile-grid">
                {[["Organization type", requirements.organizationType], ["Industry", requirements.industry], ["India context", requirements.indiaPresence], ["Indicative scale", requirements.scale], ["Planning horizon", requirements.timeframe]].map(([label, value]) => <div className="report-profile-item" key={label}><span>{label}</span><strong>{value}</strong></div>)}
              </div>
              <ChoiceList title="Your objectives" values={requirements.objectives} />
              <ChoiceList title="Functions of interest" values={requirements.functions} />
            </section>
          )}

          {modules.includes("location") && (
            <section className="report-section" id="report-location">
              <div className="report-section-heading"><span>02</span><div><p className="workflow-eyebrow">Location lens</p><h2>City shortlist</h2></div></div>
              <p className="report-section-intro">Your preference is <strong>{requirements.locationFlexibility.toLowerCase()}</strong>. The table below shows only the app&apos;s fictional sample-record counts; it is not a measure of talent, cost, demand, or city quality.</p>
              <ChoiceList title="Location priorities to investigate" values={requirements.locationPriorities} />
              <div className="report-table-wrap">
                <table className="report-table">
                  <thead><tr><th>City</th><th>Sample company profiles</th><th>State shown in sample records</th></tr></thead>
                  <tbody>{displayedCities.map((city) => <tr key={city.id}><th><MapPin size={13} />{city.city}</th><td>{city.metric_value} fictional profiles</td><td>{demoCompanies.find((company) => company.gcc_locations.some((location) => location.city === city.city))?.gcc_locations.find((location) => location.city === city.city)?.state ?? "Not shown"}</td></tr>)}</tbody>
                </table>
              </div>
              {displayedCities.length === 0 && <p className="report-inline-note">No sample records match the selected city shortlist. The shortlist is retained as a research preference.</p>}
              <p className="report-inline-note">Source: GCC Pulse fictional demo dataset. No external citation or live city data is represented.</p>
            </section>
          )}

          {modules.includes("talent") && (
            <section className="report-section" id="report-talent">
              <div className="report-section-heading"><span>03</span><div><p className="workflow-eyebrow">People & capabilities</p><h2>Talent considerations</h2></div></div>
              <ChoiceList title="Questions selected for your research" values={requirements.talentPriorities} />
              <div className="report-profile-grid"><div className="report-profile-item"><span>Indicative hiring scale</span><strong>{requirements.hiringScale}</strong></div><div className="report-profile-item"><span>Skills or roles</span><strong>{requirements.skills || "Not specified"}</strong></div></div>
              {requirements.talentNotes && <p className="report-user-note">{requirements.talentNotes}</p>}
              <p className="report-inline-note">No salary, availability, attrition, or skills-supply estimates are included. Verify any workforce assumptions against current, role-specific research.</p>
            </section>
          )}

          {modules.includes("real-estate") && (
            <section className="report-section" id="report-real-estate">
              <div className="report-section-heading"><span>04</span><div><p className="workflow-eyebrow">Workplace planning</p><h2>Real estate & workplace</h2></div></div>
              <ChoiceList title="Research needs" values={requirements.realEstateNeeds} />
              <ChoiceList title="Workplace priorities" values={requirements.workplacePriorities} />
              {requirements.realEstateNotes && <p className="report-user-note">{requirements.realEstateNotes}</p>}
              <p className="report-inline-note">No office inventory, availability, rent, or fit-out pricing is provided by this demo.</p>
            </section>
          )}

          {modules.includes("policy") && (
            <section className="report-section" id="report-policy">
              <div className="report-section-heading"><span>05</span><div><p className="workflow-eyebrow">Validation agenda</p><h2>Policy research checklist</h2></div></div>
              <ChoiceList title="Topics to verify with current primary sources" values={requirements.policyTopics} />
              {requirements.policyNotes && <p className="report-user-note">{requirements.policyNotes}</p>}
              <p className="report-inline-note">This is a list of questions, not legal or tax advice. It makes no claim that a scheme exists, applies, or is currently available.</p>
            </section>
          )}

          {modules.includes("providers") && (
            <section className="report-section" id="report-providers">
              <div className="report-section-heading"><span>06</span><div><p className="workflow-eyebrow">Ecosystem discovery</p><h2>Provider categories</h2></div></div>
              <ChoiceList title="Categories you selected" values={requirements.providerCategories} />
              <p className="report-section-intro">The demo directory contains {demoProviders.length} fictional provider examples across {new Set(demoProviders.map((provider) => provider.category)).size} sample categories. These entries are not real recommendations, verified providers, or endorsements.</p>
              {requirements.providerNotes && <p className="report-user-note">{requirements.providerNotes}</p>}
            </section>
          )}

          {modules.includes("next-steps") && (
            <section className="report-section" id="report-next-steps">
              <div className="report-section-heading"><span>07</span><div><p className="workflow-eyebrow">Suggested workflow</p><h2>Next steps for your team</h2></div></div>
              <ol className="report-next-steps">
                <li><CheckCircle2 size={17} /><span>Turn the objectives you selected into decision questions, owners, and a research timeline.</span></li>
                <li><CheckCircle2 size={17} /><span>Validate the city shortlist using comparable, current sources and consistent definitions.</span></li>
                <li><CheckCircle2 size={17} /><span>Confirm talent, workplace, and provider assumptions directly with qualified local sources.</span></li>
                <li><CheckCircle2 size={17} /><span>Have legal, tax, and policy questions reviewed by the appropriate professional advisers.</span></li>
              </ol>
            </section>
          )}

          <section className="report-section report-limitations" id="report-limitations">
            <div className="report-section-heading"><span>!</span><div><p className="workflow-eyebrow">Evidence boundaries</p><h2>What this preview can&apos;t tell you</h2></div></div>
            <p>This experience does not conduct research or access current sources. The included company, city, and provider examples are fictional. There are no sourced findings, comparative rankings, forecasts, current incentives, costs, or recommendations. Treat every sample value as interface demonstration only.</p>
            <details>
              <summary>What should be verified before making a decision?</summary>
              <ul><li>Current official central and state policy publications and eligibility conditions.</li><li>Role-specific hiring evidence, supply assumptions, and compensation benchmarks.</li><li>Real-estate inventory, lease terms, fit-out costs, and infrastructure availability.</li><li>Provider credentials, references, service scope, and commercial terms.</li><li>Publication dates, definitions, methodology, and primary evidence for every market claim.</li></ul>
            </details>
          </section>

          <div className="report-bottom-actions">
            <button className="workflow-secondary-button" type="button" onClick={() => router.push("/requirements?edit=1")}><ArrowLeft size={15} />Edit planning inputs</button>
            <button className="workflow-primary-button" type="button" onClick={startNew}><RotateCcw size={15} />Build another preview</button>
          </div>
          <p className="report-session-note">Report choices are held in this browser tab only so the preview can be reopened. No profile or contact details are sent to a server.</p>
        </article>
      </div>
    </main>
  );
}
