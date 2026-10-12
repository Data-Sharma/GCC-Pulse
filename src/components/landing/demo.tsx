"use client";

import { useState } from "react";
import { ArrowRight, Check, CircleHelp, FileText, MapPin, ShieldCheck } from "lucide-react";

const demos = [
  {
    question: "Compare major GCC hubs.",
    answer: "A useful comparison starts with a consistent set of city indicators.",
    findings: [
      "Compare the same metric and reporting period across each city.",
      "Review definitions and source dates before drawing conclusions.",
    ],
    entities: ["Bengaluru", "Hyderabad", "Pune"],
    next: "Open City Intelligence to inspect available metrics and their sources.",
  },
  {
    question: "Investigate a company's India presence.",
    answer: "Build a company view from the records and public information available.",
    findings: [
      "Connect a company to its parent organization and known locations.",
      "Separate sourced profile details from claims that still need review.",
    ],
    entities: ["Company profile", "Parent organization", "India locations"],
    next: "Search the GCC Registry, then follow the sources attached to a profile.",
  },
  {
    question: "Review a potential expansion signal.",
    answer: "Treat an announcement or hiring pattern as a lead to investigate, not a confirmed outcome.",
    findings: [
      "Check what the source explicitly says and when it was published.",
      "Keep potential signals distinct from confirmed company or location records.",
    ],
    entities: ["Public announcement", "Hiring activity", "Potential signal"],
    next: "Explore the signal record and validate its source before relying on it.",
  },
];

export function IntelligenceDemo() {
  const [selected, setSelected] = useState(0);
  const demo = demos[selected];

  return (
    <section id="intelligence" className="landing-section landing-section-alt">
      <div className="landing-container">
        <div className="landing-section-heading landing-section-heading-split">
          <div>
            <p className="landing-eyebrow"><span /> See how it comes together</p>
            <h2>From one question to a clearer picture.</h2>
          </div>
          <p className="landing-section-intro">
            Choose a research question to preview how structured context and
            evidence can help guide the next step.
          </p>
        </div>

        <div className="demo-layout">
          <div className="demo-question-list" role="group" aria-label="Choose a demo question">
            {demos.map((item, index) => (
              <button
                key={item.question}
                type="button"
                className={`demo-question${selected === index ? " is-selected" : ""}`}
                aria-pressed={selected === index}
                onClick={() => setSelected(index)}
              >
                <span className="demo-question-index">0{index + 1}</span>
                <span>{item.question}</span>
                <ArrowRight aria-hidden="true" size={16} />
              </button>
            ))}
            <p className="demo-hint">
              <CircleHelp aria-hidden="true" size={15} />
              This is a static product demonstration, not a live query.
            </p>
          </div>

          <div className="demo-result" aria-live="polite">
            <div className="demo-result-top">
              <span className="demo-illustrative-label"><span /> Illustrative demo</span>
              <span className="demo-not-live">Not live data</span>
            </div>
            <p className="demo-kicker">Research prompt</p>
            <h3>{demo.question}</h3>
            <p className="demo-answer">{demo.answer}</p>
            <div className="demo-result-grid">
              <div className="demo-findings">
                <p className="demo-kicker">Key considerations</p>
                {demo.findings.map((finding) => (
                  <div className="demo-finding" key={finding}>
                    <Check aria-hidden="true" size={15} />
                    <span>{finding}</span>
                  </div>
                ))}
              </div>
              <div className="demo-entities">
                <p className="demo-kicker">Relevant context</p>
                <div className="demo-entity-list">
                  {demo.entities.map((entity) => (
                    <span key={entity}><MapPin aria-hidden="true" size={13} />{entity}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="demo-source-row">
              <div className="demo-source-icon"><FileText aria-hidden="true" size={17} /></div>
              <div>
                <p>Source examples</p>
                <span>Illustrative placeholders · verify against original sources</span>
              </div>
              <ShieldCheck aria-hidden="true" className="demo-source-shield" size={18} />
            </div>
            <div className="demo-result-footer">
              <span>Freshness: illustrative only</span>
              <span className="demo-review-state">Not verified</span>
            </div>
            <div className="demo-next-step">
              <span>Suggested next step</span>
              <p>{demo.next}</p>
            </div>
          </div>
        </div>
        <p className="demo-disclaimer">
          Example content is illustrative and does not represent live or verified market information.
        </p>
      </div>
    </section>
  );
}
