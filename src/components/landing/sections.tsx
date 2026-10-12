import Link from "next/link";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Building2,
  Check,
  CheckCircle2,
  CircleDot,
  ClipboardList,
  Compass,
  FileCheck2,
  FileSearch,
  FileText,
  Layers3,
  MapPin,
  Network,
  Radar,
  Search,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "./reveal";
import { ChatSectionButton } from "./public-chatbot";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="landing-eyebrow"><span />{children}</p>;
}

export function HeroSection() {
  const cityNodes = [
    { label: "Delhi NCR", className: "city-node-delhi" },
    { label: "Mumbai", className: "city-node-mumbai" },
    { label: "Pune", className: "city-node-pune" },
    { label: "Hyderabad", className: "city-node-hyderabad" },
    { label: "Bengaluru", className: "city-node-bengaluru" },
    { label: "Chennai", className: "city-node-chennai" },
    { label: "Gurugram", className: "city-node-gurugram" },
  ];

  return (
    <section className="landing-hero">
      <div className="hero-grid" aria-hidden="true" />
      <div className="landing-container hero-layout">
        <div className="hero-copy">
          <Reveal>
            <p className="hero-eyebrow"><span className="hero-eyebrow-dot" /> India GCC ecosystem intelligence</p>
            <h1>Understand India&apos;s GCC ecosystem.</h1>
            <p className="hero-description">
              Build a planning report around your goals, ask GCC Pulse general
              questions, and explore the evidence behind India&apos;s GCC ecosystem.
            </p>
            <div className="hero-actions">
              <Link className="landing-button" href="/requirements">
                Build my GCC report <ArrowUpRight aria-hidden="true" size={16} />
              </Link>
              <a className="landing-button landing-button-quiet" href="#platform">
                Explore the platform <ArrowDownRight aria-hidden="true" size={17} />
              </a>
            </div>
            <p className="hero-account-note">
              Already have an account? <Link href="/sign-in">Sign in</Link>
            </p>
            <div className="hero-proof-line">
              <span><ShieldCheck aria-hidden="true" size={15} /> Evidence-first by design</span>
              <span><Layers3 aria-hidden="true" size={15} /> Connected ecosystem context</span>
            </div>
          </Reveal>
        </div>

        <Reveal className="hero-visual-reveal" delay={160}>
          <div className="hero-visual" aria-label="Illustrative GCC Pulse intelligence interface">
            <div className="hero-visual-topbar">
              <div className="window-dots" aria-hidden="true"><i /><i /><i /></div>
              <span className="visual-workspace-label"><Activity size={13} /> ECOSYSTEM OVERVIEW</span>
              <span className="visual-demo-pill">Illustrative</span>
            </div>
            <div className="map-visual">
              <div className="map-grid" aria-hidden="true" />
              <svg className="map-lines" viewBox="0 0 520 330" role="img" aria-label="Illustrative connections between Indian city nodes">
                <path className="map-outline" d="M203 33 245 48 264 75 297 92 303 121 332 133 314 160 323 183 301 201 292 233 269 259 262 286 239 301 218 279 211 250 191 226 183 199 162 176 172 150 159 129 174 108 168 82 186 63Z" />
                <path className="map-connection" d="M217 104 258 165 222 205 267 222 282 177 217 104" />
                <path className="map-connection map-connection-soft" d="M217 104 184 165M217 104 247 82M222 205 267 222M258 165 282 177" />
                <path className="map-connection map-connection-soft" d="M164 126 217 104M306 112 217 104M302 96 217 104" />
              </svg>
              {cityNodes.map(({ label, className }) => (
                <span className={`map-city-node ${className}`} key={label}>
                  <i />{label}
                </span>
              ))}
              <div className="map-legend"><span /> Illustrative city connections</div>
            </div>

            <div className="hero-float-card hero-profile-card">
              <div className="float-card-icon"><Building2 size={15} /></div>
              <div><span>COMPANY PROFILE</span><strong>India presence</strong><small>Locations · evidence · context</small></div>
              <ArrowUpRight size={14} />
            </div>
            <div className="hero-float-card hero-source-card">
              <div className="source-check"><FileCheck2 size={15} /></div>
              <div><span>SOURCE TRAIL</span><strong>Review the evidence</strong><small>Publication date · status</small></div>
            </div>
            <div className="hero-signal-card">
              <span className="signal-pulse" />
              <div><span>POTENTIAL SIGNAL</span><strong>Public information to investigate</strong></div>
              <span className="signal-status">Unverified</span>
            </div>
            <div className="hero-visual-caption">
              <span className="caption-mark"><Network size={14} /></span>
              <span>Connected records.<br /><b>Inspectable evidence.</b></span>
              <ArrowRight aria-hidden="true" size={15} />
            </div>
          </div>
        </Reveal>
      </div>
      <div className="hero-bottom-line">
        <div className="landing-container hero-bottom-inner">
          <span>Research infrastructure for a complex ecosystem</span>
          <div><i /> Discover <i /> Compare <i /> Investigate</div>
        </div>
      </div>
    </section>
  );
}

const sourceTypes = [
  { icon: FileText, label: "Company announcements", className: "fragment-card-a" },
  { icon: Building2, label: "Government publications", className: "fragment-card-b" },
  { icon: BarChart3, label: "Research reports", className: "fragment-card-c" },
  { icon: Users, label: "Hiring signals", className: "fragment-card-d" },
  { icon: MapPin, label: "Real estate information", className: "fragment-card-e" },
  { icon: Compass, label: "Service providers", className: "fragment-card-f" },
  { icon: FileSearch, label: "Setup & compliance", className: "fragment-card-g" },
];

export function ProblemSection() {
  const challenges = [
    {
      icon: Network,
      title: "Fragmented information",
      description: "Relevant context is spread across sources, organizations, and formats.",
    },
    {
      icon: BarChart3,
      title: "Limited comparability",
      description: "Definitions, reporting periods, and source quality can differ.",
    },
    {
      icon: Search,
      title: "Unclear evidence",
      description: "Claims need a visible source, publication date, and review state.",
    },
  ];

  return (
    <section className="landing-section landing-section-dark">
      <div className="landing-container">
        <div className="landing-section-heading">
          <SectionLabel>The challenge</SectionLabel>
          <h2>Critical intelligence.<br /><span>Scattered everywhere.</span></h2>
          <p className="landing-section-intro">
            Building or expanding a GCC in India involves navigating information
            spread across companies, cities, advisors, public announcements, and
            research sources.
          </p>
        </div>
        <div className="fragmentation-layout">
          <Reveal className="fragmentation-visual">
            <div className="fragmentation-label"><span /> THE INFORMATION LANDSCAPE</div>
            <div className="fragmentation-map">
              <svg className="fragmentation-lines" viewBox="0 0 760 380" aria-hidden="true">
                <path d="M119 69 373 185M365 65 373 185M634 72 373 185M124 306 373 185M367 319 373 185M635 294 373 185M640 188 373 185" />
              </svg>
              {sourceTypes.map(({ icon: Icon, label, className }) => (
                <div className={`fragment-card ${className}`} key={label}>
                  <span className="fragment-icon"><Icon size={15} /></span>
                  <span>{label}</span>
                  <span className="fragment-card-dot" />
                </div>
              ))}
              <div className="fragment-core">
                <div className="fragment-core-orbit"><i /><i /><i /></div>
                <span className="fragment-core-icon"><Network size={20} /></span>
                <strong>GCC decision</strong>
                <small>Context is disconnected</small>
              </div>
            </div>
            <div className="fragmentation-footnote">
              <span><i className="fragment-dot-muted" /> Independent sources</span>
              <span><i className="fragment-dot-blue" /> Need for connected context</span>
            </div>
          </Reveal>
          <div className="challenge-list">
            {challenges.map(({ icon: Icon, title, description }, index) => (
              <Reveal className="challenge-item" key={title} delay={index * 90}>
                <div className="challenge-index">0{index + 1}</div>
                <div className="challenge-icon"><Icon size={19} /></div>
                <div><h3>{title}</h3><p>{description}</p></div>
                <ArrowUpRight className="challenge-arrow" aria-hidden="true" size={16} />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function SolutionSection() {
  const steps = [
    { number: "01", icon: Search, title: "Discover", description: "Find relevant companies, centres, cities, providers, and public information." },
    { number: "02", icon: Layers3, title: "Structure", description: "Organize information into profiles, comparable fields, and potential signals." },
    { number: "03", icon: ShieldCheck, title: "Verify", description: "Inspect the source, publication date, and review status before relying on a claim." },
  ];

  return (
    <section className="landing-section landing-section-blueprint">
      <div className="landing-container">
        <div className="landing-section-heading landing-section-heading-centered">
          <SectionLabel>The GCC Pulse approach</SectionLabel>
          <h2>Turn scattered signals into<br />structured intelligence.</h2>
          <p className="landing-section-intro">
            One connected workflow for finding information, putting it in context,
            and tracing the evidence that supports it.
          </p>
        </div>
        <div className="solution-flow">
          {steps.map(({ number, icon: Icon, title, description }, index) => (
            <Reveal className="solution-step" key={number} delay={index * 100}>
              <div className="solution-step-top"><span>{number}</span><Icon size={19} /></div>
              <h3>{title}</h3>
              <p>{description}</p>
              {index < steps.length - 1 && <div className="solution-connector"><span /></div>}
            </Reveal>
          ))}
        </div>
        <Reveal className="structured-preview">
          <div className="structured-preview-intro">
            <span className="structured-preview-tag"><Layers3 size={13} /> STRUCTURED PROFILE</span>
            <h3>From a source to useful context.</h3>
            <p>Records can connect a company, location, claim, and source—while keeping their review state visible.</p>
          </div>
          <div className="structured-profile-card">
            <div className="structured-profile-header">
              <div className="structured-company-mark"><Building2 size={17} /></div>
              <div><span>COMPANY RECORD</span><strong>Example organization</strong></div>
              <span className="illustrative-chip">Illustrative</span>
            </div>
            <div className="structured-profile-fields">
              <div><span>Location</span><strong><MapPin size={13} /> India location</strong></div>
              <div><span>Claim status</span><strong className="status-amber"><CircleDot size={13} /> Needs review</strong></div>
              <div><span>Source trail</span><strong><FileText size={13} /> 1 linked example</strong></div>
            </div>
          </div>
        </Reveal>
        <div className="claim-state-key">
          <span><i className="state-source" /> Source-backed record</span>
          <span><i className="state-extracted" /> Extracted claim</span>
          <span><i className="state-potential" /> Potential signal · unverified</span>
        </div>
      </div>
    </section>
  );
}

function RegistryPreview() {
  return (
    <div className="feature-preview registry-preview">
      <div className="preview-toolbar"><span className="preview-toolbar-title"><Building2 size={13} /> Company registry</span><span className="preview-filter"><Search size={12} /> Filter records</span></div>
      <div className="registry-head"><span>COMPANY</span><span>LOCATION</span><span>RECORD</span></div>
      {[
        ["Example organization", "India", "Profile"],
        ["Illustrative company", "Multiple", "Sources"],
        ["Sample parent group", "India", "Review"],
      ].map(([company, location, status]) => (
        <div className="registry-row" key={company}><span><i />{company}</span><span>{location}</span><em>{status}</em></div>
      ))}
      <span className="preview-note">Illustrative interface · not live records</span>
    </div>
  );
}

function CompanyPreview() {
  return (
    <div className="feature-preview company-preview">
      <div className="company-preview-title"><span className="company-preview-logo"><Building2 size={15} /></span><span><small>COMPANY INTELLIGENCE</small><b>Example company</b></span><ArrowUpRight size={13} /></div>
      <div className="company-location"><MapPin size={13} /><span>India locations</span><i>2 example tags</i></div>
      <div className="company-source"><FileCheck2 size={13} /><span>Evidence linked to profile</span><span className="review-badge">Review state</span></div>
    </div>
  );
}

function CityPreview() {
  return (
    <div className="feature-preview city-preview">
      <div className="preview-toolbar"><span className="preview-toolbar-title"><MapPin size={13} /> City comparison</span><span className="preview-period">Source dates vary</span></div>
      {[
        ["Bengaluru", "● ● ● ●"],
        ["Hyderabad", "● ● ● ○"],
        ["Pune", "● ● ○ ○"],
      ].map(([city, dots], index) => (
        <div className="city-compare-row" key={city}>
          <span>{city}</span><span className={`city-bars city-bars-${index}`}>{dots}</span><small>Illustrative</small>
        </div>
      ))}
      <span className="preview-note">Example visualization · metrics require sourced data</span>
    </div>
  );
}

const providerCategories: { category: string; icon: LucideIcon }[] = [
  { category: "Strategy & advisory", icon: Compass },
  { category: "Talent & operations", icon: Users },
  { category: "Workplace & setup", icon: Building2 },
];

function SignalPreview() {
  return (
    <div className="feature-preview signal-preview">
      <div className="preview-toolbar"><span className="preview-toolbar-title"><Radar size={13} /> Signal feed</span><span className="signal-unverified"><i /> Potential</span></div>
      <div className="signal-preview-item"><span className="signal-line" /><div><b>Public information to investigate</b><small>Source date · illustrative example</small></div></div>
      <div className="signal-preview-item"><span className="signal-line signal-line-muted" /><div><b>Hiring or location mention</b><small>Not a confirmed expansion</small></div></div>
    </div>
  );
}

function ProviderPreview() {
  return (
    <div className="feature-preview provider-preview">
      <div className="preview-toolbar"><span className="preview-toolbar-title"><Users size={13} /> Provider directory</span><span className="preview-filter">Categories</span></div>
      {providerCategories.map(({ category, icon: Icon }) => (
        <div className="provider-category" key={category}><Icon size={14} /><span>{category}</span><ArrowRight size={12} /></div>
      ))}
      <span className="preview-note">Explore available provider records</span>
    </div>
  );
}

function EvidencePreview() {
  return (
    <div className="feature-preview evidence-preview-mini">
      <div className="evidence-mini-top"><FileText size={14} /><span>Illustrative claim</span><span className="review-badge">Pending review</span></div>
      <p>Claim connected to its source and publication details.</p>
      <div><span>Source</span><b>Example publication · date shown</b></div>
    </div>
  );
}

const modules = [
  {
    icon: Building2,
    title: "GCC Registry",
    description: "Discover companies, parent organizations, Indian locations, and available centre information.",
    href: "/companies",
    action: "Explore companies",
    preview: <RegistryPreview />,
    className: "feature-card-registry",
  },
  {
    icon: Network,
    title: "Company Intelligence",
    description: "Bring relevant company information, locations, capabilities, and evidence into a single profile.",
    href: "/companies",
    action: "View company intelligence",
    preview: <CompanyPreview />,
    className: "feature-card-company",
  },
  {
    icon: MapPin,
    title: "City Intelligence",
    description: "Compare GCC hubs using documented metrics and source-backed information.",
    href: "/cities",
    action: "Explore cities",
    preview: <CityPreview />,
    className: "feature-card-cities",
  },
  {
    icon: Radar,
    title: "Expansion Radar",
    description: "Investigate public announcements and potential signals—without treating leads as confirmed outcomes.",
    href: "/signals",
    action: "Explore signals",
    preview: <SignalPreview />,
    className: "feature-card-radar",
  },
  {
    icon: Users,
    title: "Provider Directory",
    description: "Explore organizations offering relevant GCC setup and operating services.",
    href: "/providers",
    action: "Explore providers",
    preview: <ProviderPreview />,
    className: "feature-card-providers",
  },
  {
    icon: ShieldCheck,
    title: "Evidence & Verification",
    description: "Understand how claims connect to sources, publication dates, and review status.",
    href: "#evidence",
    action: "Explore evidence principles",
    preview: <EvidencePreview />,
    className: "feature-card-evidence",
  },
];

export function PlatformSection() {
  return (
    <section id="platform" className="landing-section landing-section-dark">
      <div className="landing-container">
        <div className="landing-section-heading landing-section-heading-split">
          <div>
            <SectionLabel>The platform</SectionLabel>
            <h2>Explore the ecosystem<br /><span>from every angle.</span></h2>
          </div>
          <p className="landing-section-intro">
            A set of connected intelligence layers for exploring companies,
            locations, market signals, providers, and the evidence behind each record.
          </p>
        </div>
        <div className="feature-grid">
          {modules.map(({ icon: Icon, title, description, href, action, preview, className }, index) => (
            <Reveal className={`feature-card ${className}`} key={title} delay={(index % 3) * 70}>
              <div className="feature-card-heading">
                <span className="feature-icon"><Icon size={17} /></span>
                <span className="feature-index">0{index + 1} / 06</span>
              </div>
              <div className="feature-copy">
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
              {preview}
              <Link href={href} className="feature-action">{action}<ArrowUpRight size={14} /></Link>
            </Reveal>
          ))}
        </div>
        <div className="platform-ai-note">
          <span><Activity size={15} /></span>
          <p><b>AI-assisted, human-reviewed.</b> Extraction can help organize public information; it does not establish whether a claim is true.</p>
          <Link href="/extract">See extraction workspace <ArrowRight size={14} /></Link>
        </div>
      </div>
    </section>
  );
}

export function EvidenceSection() {
  const steps = [
    { number: "01", icon: FileText, title: "Original source", copy: "Keep the source title, URL, and publication details visible." },
    { number: "02", icon: Layers3, title: "Extracted claim", copy: "Connect structured claims back to the source that informed them." },
    { number: "03", icon: ShieldCheck, title: "Human review", copy: "Make the review state clear; AI extraction is not verification." },
    { number: "04", icon: Network, title: "Useful context", copy: "Use the reviewed record as a starting point for further investigation." },
  ];

  return (
    <section id="evidence" className="landing-section landing-section-evidence">
      <div className="landing-container">
        <div className="evidence-layout">
          <div className="evidence-copy">
            <SectionLabel>Evidence over assumption</SectionLabel>
            <h2>Every important claim should have a trail.</h2>
            <p>
              Intelligence is only useful when people can investigate where it
              came from, when it was published, and whether it has been reviewed.
            </p>
            <div className="evidence-principle"><ShieldCheck size={17} /><span>AI can assist with extraction. It cannot independently establish truth.</span></div>
            <Link className="text-link" href="/extract">Explore AI-assisted extraction <ArrowUpRight size={15} /></Link>
          </div>
          <Reveal className="evidence-visual">
            <div className="evidence-visual-header">
              <span><FileCheck2 size={15} /> EVIDENCE RECORD</span>
              <span className="illustrative-chip">Illustrative example</span>
            </div>
            <div className="evidence-claim-card">
              <span className="evidence-field-label">CLAIM · EXAMPLE ONLY</span>
              <p>A sample statement connected to its original publication.</p>
              <div className="evidence-flow">
                <div className="evidence-source">
                  <span><FileText size={15} /></span>
                  <div><small>SOURCE TITLE</small><b>Example public source</b><em>URL · publication date shown</em></div>
                </div>
                <div className="evidence-flow-connector"><span /></div>
                <div className="evidence-review-row">
                  <span className="review-icon"><ShieldCheck size={15} /></span>
                  <div><small>REVIEW STATUS</small><b>Illustrative · not verified</b></div>
                  <span className="status-pending-chip">Needs review</span>
                </div>
              </div>
              <div className="evidence-metadata">
                <span><small>Collected</small><b>Example date</b></span>
                <span><small>Review note</small><b>Check original source</b></span>
              </div>
            </div>
            <div className="evidence-visual-foot"><CheckCircle2 size={14} /> Source, claim, and review state stay connected</div>
          </Reveal>
        </div>
        <div className="evidence-chain">
          {steps.map(({ number, icon: Icon, title, copy }, index) => (
            <Reveal className="evidence-chain-step" key={number} delay={index * 70}>
              <span className="evidence-chain-icon"><Icon size={17} /></span>
              <span className="evidence-chain-number">{number}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
              {index < steps.length - 1 && <ArrowRight className="evidence-chain-arrow" aria-hidden="true" size={15} />}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HowItWorksSection() {
  const steps = [
    ["01", "Discover", "Find relevant entities and public information."],
    ["02", "Examine", "Explore company, city, provider, and signal context."],
    ["03", "Inspect", "Check source details, dates, and review states."],
    ["04", "Investigate", "Use what you learn to guide further research."],
  ];

  return (
    <section className="landing-section landing-section-dark">
      <div className="landing-container">
        <div className="landing-section-heading">
          <SectionLabel>A practical workflow</SectionLabel>
          <h2>Designed for investigation,<br /><span>not guesswork.</span></h2>
        </div>
        <div className="workflow-track">
          {steps.map(([number, title, description], index) => (
            <Reveal className="workflow-step" key={number} delay={index * 70}>
              <span className="workflow-number">{number}</span>
              <span className="workflow-track-dot">{index === 0 ? <Compass size={16} /> : index === 1 ? <Layers3 size={16} /> : index === 2 ? <Search size={16} /> : <ArrowRight size={16} />}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </Reveal>
          ))}
        </div>
        <p className="workflow-note">GCC Pulse supports research and discovery; decisions remain yours.</p>
      </div>
    </section>
  );
}

export function AudienceSection() {
  const audiences = [
    { icon: Building2, title: "Global companies", copy: "Understand the landscape while evaluating or expanding an India GCC." },
    { icon: FileSearch, title: "Strategy & research teams", copy: "Organize fragmented information and investigate emerging patterns." },
    { icon: Activity, title: "GCC operators", copy: "Explore ecosystem context, city intelligence, and relevant service categories." },
    { icon: Users, title: "Ecosystem providers", copy: "Understand the market and discover how your services fit the broader landscape." },
  ];

  return (
    <section id="about" className="landing-section landing-section-audience">
      <div className="landing-container">
        <div className="landing-section-heading landing-section-heading-centered">
          <SectionLabel>Who it is for</SectionLabel>
          <h2>Built for people navigating<br />the GCC ecosystem.</h2>
          <p className="landing-section-intro">
            A research and discovery platform for the people evaluating, building,
            operating, and studying India&apos;s GCC landscape.
          </p>
        </div>
        <div className="audience-grid">
          {audiences.map(({ icon: Icon, title, copy }, index) => (
            <Reveal className="audience-card" key={title} delay={index * 70}>
              <span className="audience-icon"><Icon size={19} /></span>
              <span className="audience-number">0{index + 1}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
              <span className="audience-card-line" />
            </Reveal>
          ))}
        </div>
        <p className="audience-availability">Profiles and feature coverage depend on the information currently available in the platform.</p>
      </div>
    </section>
  );
}

export function PlanningReportSection() {
  return (
    <section id="personalized-report" className="landing-section landing-section-alt">
      <div className="landing-container planning-intro-layout">
        <Reveal className="planning-intro-copy">
          <SectionLabel>A report shaped around your questions</SectionLabel>
          <h2>Start with your priorities.<br /><span>Leave with a useful research map.</span></h2>
          <p>Walk through objectives, functions, cities, talent, workplace, policy, and provider needs. Choose the report sections and audience that fit your planning.</p>
          <Link className="landing-button" href="/requirements">Build my GCC report <ArrowUpRight size={16} /></Link>
          <span className="planning-privacy-note"><ShieldCheck size={14} />No account required. Your contact details stay in the form.</span>
        </Reveal>
        <Reveal className="planning-preview-card" delay={100}>
          <div className="planning-preview-top"><span><ClipboardList size={15} /> PLANNING PROFILE</span><span>Illustrative</span></div>
          <h3>A clearer brief for your next conversation.</h3>
          <div className="planning-preview-row"><span>01</span><div><strong>Define the direction</strong><small>Objectives, functions, planning horizon</small></div><CheckCircle2 size={16} /></div>
          <div className="planning-preview-row"><span>02</span><div><strong>Set the research lens</strong><small>City, talent, workplace, policy, providers</small></div><CheckCircle2 size={16} /></div>
          <div className="planning-preview-row"><span>03</span><div><strong>Review demo boundaries</strong><small>Fictional samples, visible gaps, no live claims</small></div><CheckCircle2 size={16} /></div>
          <p>Answers tailor the local preview only. They are not submitted for research or saved to an account.</p>
        </Reveal>
      </div>
    </section>
  );
}

export function PublicQuestionsSection() {
  return (
    <section className="landing-section landing-public-questions">
      <div className="landing-container public-questions-layout">
        <div>
          <SectionLabel>Curious about the GCC landscape?</SectionLabel>
          <h2>Ask a question.<br /><span>Get a starting point, not a sales pitch.</span></h2>
          <p>Try the public demo Q&amp;A for general guidance on city comparisons, talent research, policy questions, or provider evaluation. It does not search the web or generate live findings.</p>
        </div>
        <div className="public-questions-card">
          <p><span className="public-questions-dot" /> PUBLIC DEMO Q&amp;A</p>
          <strong>General guidance, with evidence boundaries kept clear.</strong>
          <span>No sign-in · No Gemini call · No confidential inputs</span>
          <ChatSectionButton />
        </div>
      </div>
    </section>
  );
}

export function DifferentiationSection() {
  const fragmented = ["Separate source locations", "Inconsistent fields", "Manual cross-referencing", "Unclear evidence trail"];
  const connected = ["Connected ecosystem records", "Structured information", "Investigable signals", "Source trail and review status"];

  return (
    <section className="landing-section landing-section-dark">
      <div className="landing-container">
        <div className="landing-section-heading landing-section-heading-centered">
          <SectionLabel>A connected intelligence layer</SectionLabel>
          <h2>Not another directory.<br /><span>A clearer way to connect context.</span></h2>
          <p className="landing-section-intro">
            The aim is to connect ecosystem information with the evidence behind
            it—not to replace the original sources or the judgment of the researcher.
          </p>
        </div>
        <div className="comparison-layout">
          <Reveal className="comparison-card comparison-fragmented">
            <div className="comparison-heading"><span className="comparison-icon"><Network size={17} /></span><div><small>A FRAGMENTED APPROACH</small><h3>Information in silos</h3></div></div>
            <div className="comparison-items">{fragmented.map((item) => <div key={item}><span className="comparison-dash" />{item}</div>)}</div>
            <div className="comparison-art fragmented-art" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div>
          </Reveal>
          <div className="comparison-bridge"><ArrowRight size={18} /><span>Connect<br />the context</span></div>
          <Reveal className="comparison-card comparison-connected" delay={100}>
            <div className="comparison-heading"><span className="comparison-icon"><Layers3 size={17} /></span><div><small>THE GCC PULSE APPROACH</small><h3>Evidence-linked context</h3></div></div>
            <div className="comparison-items">{connected.map((item) => <div key={item}><Check size={14} />{item}</div>)}</div>
            <div className="comparison-art connected-art" aria-hidden="true"><i /><i /><i /><i /><b /><span /><span /><span /></div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function FinalCtaSection() {
  return (
    <section className="landing-final-cta">
      <div className="cta-grid" aria-hidden="true" />
      <div className="cta-glow cta-glow-one" aria-hidden="true" />
      <div className="cta-glow cta-glow-two" aria-hidden="true" />
      <Reveal className="landing-container landing-cta-content">
        <p className="landing-eyebrow"><span /> Start exploring</p>
        <h2>Make sense of India&apos;s<br />GCC ecosystem.</h2>
        <p>Start exploring companies, cities, expansion signals, and the evidence connecting them.</p>
        <div className="hero-actions cta-actions">
          <Link className="landing-button" href="/requirements">Build a planning report <ArrowUpRight size={16} /></Link>
          <Link className="landing-button landing-button-quiet" href="/sign-in#create-account">Create your account <ArrowUpRight size={16} /></Link>
          <Link className="landing-button landing-button-quiet" href="/sign-in">Sign in <ArrowRight size={16} /></Link>
        </div>
        <span className="cta-footnote">Try the local demo report, or create a personal or organization account.</span>
      </Reveal>
    </section>
  );
}

export function LandingFooter() {
  const links = [
    { label: "GCC Registry", href: "/companies" },
    { label: "City Intelligence", href: "/cities" },
    { label: "Expansion Radar", href: "/signals" },
    { label: "Providers", href: "/providers" },
    { label: "Build a planning report", href: "/requirements" },
    { label: "Evidence principles", href: "#evidence" },
  ];

  return (
    <footer className="landing-footer">
      <div className="landing-container">
        <div className="footer-main">
          <div className="footer-brand">
            <Link href="/" className="landing-wordmark">GCC <span>Pulse</span></Link>
            <p>Making India&apos;s GCC ecosystem easier to understand, investigate, compare, and navigate.</p>
          </div>
          <div className="footer-platform">
            <h2>Explore the platform</h2>
            <div className="footer-link-grid">
              {links.map(({ label, href }) => <Link key={label} href={href}>{label}<ArrowUpRight size={12} /></Link>)}
            </div>
          </div>
          <div className="footer-account">
            <h2>Your workspace</h2>
            <Link href="/sign-in">Sign in <ArrowUpRight size={13} /></Link>
            <Link href="/sign-in#create-account">Create an account <ArrowUpRight size={13} /></Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} GCC Pulse</span>
          <span>Evidence first. Context connected.</span>
        </div>
      </div>
    </footer>
  );
}
