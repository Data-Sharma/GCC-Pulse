"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, CircleHelp, LoaderCircle, ShieldCheck } from "lucide-react";
import {
  initialRequirements,
  PROFILE_DRAFT_KEY,
  RequirementsSchema,
  type Requirements,
} from "@/lib/reporting/requirements";

const steps = [
  { title: "Company profile", description: "Tell us who you are and the kind of organization you operate.", fields: ["organizationName", "organizationType", "industry", "businessModel", "website", "contactRole", "contactEmail"] },
  { title: "Current footprint", description: "Add context about your current operations. Use “Not decided yet” when needed.", fields: ["operatingCountries", "indiaPresence", "existingIndiaLocations", "companySize", "indiaHeadcount", "currentFunctions"] },
  { title: "Expansion strategy", description: "Define your objectives, functions, stage, scale, and timing.", fields: ["expansionStage", "objectives", "functions", "scale", "timeframe", "urgency", "expectedInitialHeadcount", "expectedFutureHeadcount"] },
  { title: "Location", description: "Describe the kind of city shortlist that would be useful.", fields: ["preferredCities", "locationPriorities", "locationFlexibility"] },
  { title: "Talent", description: "Shape the talent section around your roles, skills, and hiring priorities.", fields: ["talentPriorities", "hiringScale", "skills", "seniority", "compensationPriorities", "attritionPriorities", "talentNotes"] },
  { title: "Workplace", description: "Add workspace, size, and budget context if known.", fields: ["realEstateNeeds", "workplacePriorities", "officeSize", "workspacePreference", "budgetRange", "realEstateNotes"] },
  { title: "Policy", description: "Choose policy topics to include in your research checklist.", fields: ["policyTopics", "policyNotes"] },
  { title: "Providers", description: "Select relevant provider categories and selection criteria.", fields: ["providerCategories", "providerCriteria", "providerEngagement", "providerNotes"] },
  { title: "Risks & questions", description: "Capture constraints, known risks, and questions your team still needs to resolve.", fields: ["risks", "constraints", "openQuestions"] },
  { title: "Report", description: "Choose the report sections, audience, and level of detail.", fields: ["reportModules", "reportAudience", "reportDepth", "reportQuestion"] },
  { title: "Review", description: "Check your profile and expansion requirements before saving.", fields: [] },
] as const;

const stepSchemas = [
  RequirementsSchema.pick({ organizationName: true, organizationType: true, industry: true, businessModel: true, website: true, contactRole: true, contactEmail: true }),
  RequirementsSchema.pick({ operatingCountries: true, indiaPresence: true, existingIndiaLocations: true, companySize: true, indiaHeadcount: true, currentFunctions: true }),
  RequirementsSchema.pick({ expansionStage: true, objectives: true, functions: true, scale: true, timeframe: true, urgency: true, expectedInitialHeadcount: true, expectedFutureHeadcount: true }),
  RequirementsSchema.pick({ preferredCities: true, locationPriorities: true, locationFlexibility: true }),
  RequirementsSchema.pick({ talentPriorities: true, hiringScale: true, skills: true, seniority: true, compensationPriorities: true, attritionPriorities: true, talentNotes: true }),
  RequirementsSchema.pick({ realEstateNeeds: true, workplacePriorities: true, officeSize: true, workspacePreference: true, budgetRange: true, realEstateNotes: true }),
  RequirementsSchema.pick({ policyTopics: true, policyNotes: true }),
  RequirementsSchema.pick({ providerCategories: true, providerCriteria: true, providerEngagement: true, providerNotes: true }),
  RequirementsSchema.pick({ risks: true, constraints: true, openQuestions: true }),
  RequirementsSchema.pick({ reportModules: true, reportAudience: true, reportDepth: true, reportQuestion: true }),
];

type ArrayField =
  | "objectives"
  | "currentFunctions"
  | "functions"
  | "preferredCities"
  | "locationPriorities"
  | "talentPriorities"
  | "seniority"
  | "compensationPriorities"
  | "attritionPriorities"
  | "realEstateNeeds"
  | "workplacePriorities"
  | "policyTopics"
  | "providerCategories"
  | "providerCriteria"
  | "reportModules";

const objectives = ["Evaluate India as a GCC location", "Plan a new GCC setup", "Expand an existing centre", "Compare cities", "Understand talent availability", "Research the provider ecosystem", "Build an internal business case", "General market research"];
const functions = ["Technology & engineering", "Data & analytics", "Finance & accounting", "Customer operations", "Research & development", "Human resources", "Cybersecurity", "Supply chain", "Legal & compliance"];
const currentFunctions = ["Engineering", "AI & data", "Finance", "Operations", "R&D", "Cybersecurity", "HR", "Other", "No functions operating in India yet", "Not decided yet"];
const cities = ["Bengaluru", "Hyderabad", "Pune", "Chennai", "Mumbai", "Delhi NCR", "Gurugram", "No shortlist yet"];
const locationPriorities = ["Talent availability", "Operating ecosystem", "Connectivity", "Real-estate options", "Provider availability", "Policy context", "Cost factors to investigate", "No fixed priorities yet"];
const talentPriorities = ["Relevant skill pools", "Hiring scale and sequencing", "University ecosystem", "Leadership and specialist roles", "Talent-retention questions", "Workforce planning", "No specific priorities yet"];
const seniorityLevels = ["Entry-level", "Mid-career", "Senior individual contributors", "People leaders", "Executive leadership", "Not decided yet"];
const compensationPriorities = ["Role-specific benchmarks", "Total compensation mix", "Offer competitiveness", "Benefits and allowances", "Not decided yet"];
const attritionPriorities = ["Retention risks", "Tenure patterns", "Role-specific attrition", "Employer value proposition", "Not decided yet"];
const realEstateNeeds = ["Compare office-market context", "Understand workspace options", "Plan a phased footprint", "Explore flexible workspace", "Review infrastructure considerations", "No real-estate requirement yet"];
const workplacePriorities = ["Access to relevant talent", "Transport and connectivity", "Scalability", "Workplace experience", "Business continuity", "No fixed priorities yet"];
const policyTopics = ["State-level incentives to investigate", "Central-government programmes", "Eligibility and application process", "Data, privacy, and compliance", "Employment and labour regulation", "Tax and entity setup questions", "No specific policy topics yet"];
const providerCategories = ["Talent acquisition", "Real estate and facilities", "Legal and compliance", "Technology and cloud", "Finance and tax", "Workplace and operations", "No provider shortlist yet"];
const providerCriteria = ["Relevant GCC setup experience", "Local delivery coverage", "References and credentials", "Transparent commercial terms", "Security and compliance", "Not decided yet"];
const reportModules = [
  ["strategy", "Objectives & planning"],
  ["location", "City shortlist"],
  ["talent", "Talent considerations"],
  ["real-estate", "Real estate & workplace"],
  ["policy", "Policy research checklist"],
  ["providers", "Provider categories"],
  ["next-steps", "Suggested next steps"],
];

function SelectField({
  label,
  value,
  options,
  onChange,
  error,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <label className="requirements-field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
      {error && <small className="requirements-field-error">{error}</small>}
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  error,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  type?: string;
}) {
  return (
    <label className="requirements-field">
      <span>{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
      {error && <small className="requirements-field-error">{error}</small>}
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="requirements-field requirements-field-wide">
      <span>{label} <em>Optional</em></span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={3} />
    </label>
  );
}

function OptionGrid({
  title,
  options,
  selected,
  onToggle,
  error,
}: {
  title: string;
  options: readonly string[];
  selected: string[];
  onToggle: (option: string) => void;
  error?: string;
}) {
  return (
    <fieldset className="requirements-choice-field">
      <legend>{title} <em>Select all that apply</em></legend>
      <div className="requirements-option-grid">
        {options.map((option) => {
          const checked = selected.includes(option);
          return (
            <button
              aria-pressed={checked}
              className={`requirements-option${checked ? " is-selected" : ""}`}
              key={option}
              onClick={() => onToggle(option)}
              type="button"
            >
              <span className="requirements-option-check">{checked && <Check size={13} />}</span>
              {option}
            </button>
          );
        })}
      </div>
      {error && <small className="requirements-field-error">{error}</small>}
    </fieldset>
  );
}

export function RequirementsWizard() {
  const router = useRouter();
  const [requirements, setRequirements] = useState<Requirements>(initialRequirements);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generationStage, setGenerationStage] = useState("");
  const [generationError, setGenerationError] = useState("");
  const [draftReady, setDraftReady] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        if (new URLSearchParams(window.location.search).has("edit")) {
          const response = await fetch("/api/gcc/profile");
          if (response.ok) {
            const payload: unknown = await response.json();
            if (typeof payload === "object" && payload !== null && "profile" in payload) {
              const saved = payload.profile;
              if (typeof saved === "object" && saved !== null && "requirements" in saved) {
                const parsed = RequirementsSchema.safeParse(saved.requirements);
                if (parsed.success && !cancelled) {
                  setRequirements(parsed.data);
                  setDraftReady(true);
                  return;
                }
              }
            }
          }
        }
        const draft = window.localStorage.getItem(PROFILE_DRAFT_KEY);
        if (draft) {
          const parsed = RequirementsSchema.safeParse(JSON.parse(draft));
          if (parsed.success && !cancelled) setRequirements(parsed.data);
        }
      } catch (error) {
        console.error("Unable to restore the local profile draft.", error);
        if (!cancelled) setGenerationError("The local draft could not be restored. You can continue with a new profile.");
      } finally {
        if (!cancelled) setDraftReady(true);
      }
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!draftReady) return;
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(PROFILE_DRAFT_KEY, JSON.stringify(requirements));
      } catch (error) {
        console.error("Unable to save the local profile draft.", error);
        setGenerationError("This browser could not save your draft locally. Sign in and save the profile before leaving.");
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [requirements, draftReady]);

  const setField = <K extends keyof Requirements>(field: K, value: Requirements[K]) => {
    setRequirements((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const toggleOption = (field: ArrayField, option: string) => {
    const current = requirements[field];
    const updated = current.includes(option)
      ? current.filter((value) => value !== option)
      : option.startsWith("No ") || option === "Not decided yet"
        ? [option]
        : [...current.filter((value) => !value.startsWith("No ") && value !== "Not decided yet"), option];
    setField(field, updated);
  };

  const validateStep = (currentStep: number) => {
    const schema = currentStep === steps.length - 1 ? RequirementsSchema : stepSchemas[currentStep];
    const result = schema.safeParse(requirements);
    if (result.success) {
      setErrors({});
      return true;
    }
    const nextErrors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const field = String(issue.path[0] ?? "form");
      nextErrors[field] = issue.message;
    }
    setErrors(nextErrors);
    return false;
  };

  const nextStep = () => {
    if (!validateStep(step)) return;
    setStep((current) => Math.min(current + 1, steps.length - 1));
    setGenerationError("");
  };

  const saveProfile = async () => {
    if (!validateStep(steps.length - 1)) return;
    setGenerationError("");
    setShowSignIn(false);
    setGenerationStage("Saving your profile securely…");
    try {
      const response = await fetch("/api/gcc/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requirements),
      });
      const payload = await response.json() as { error?: string };
      if (response.status === 401) {
        setShowSignIn(true);
        setGenerationStage("");
        return;
      }
      if (!response.ok) throw new Error(payload.error || "Could not save the profile.");
      window.localStorage.removeItem(PROFILE_DRAFT_KEY);
      router.push("/profile");
    } catch (error) {
      console.error("Unable to save the profile.", error);
      setGenerationError(error instanceof Error ? error.message : "Could not save the profile. Please try again.");
      setGenerationStage("");
    }
  };

  const fieldError = (field: string) => errors[field];
  const current = steps[step];

  return (
    <main className="requirements-page">
      <header className="workflow-header">
        <Link className="workflow-wordmark" href="/">GCC <span>Pulse</span></Link>
        <span className="workflow-demo-tag"><span />Profile setup</span>
      </header>
      <div className="requirements-layout">
        <aside className="requirements-aside">
          <p className="workflow-eyebrow">Personalized GCC planning</p>
          <h1>Start with the questions that matter to you.</h1>
          <p>Save your company context and expansion requirements to support tailored, evidence-aware reports.</p>
          <div className="requirements-privacy">
            <ShieldCheck size={17} />
            <p><strong>Your profile, under your control</strong><br />Unsaved drafts stay in this browser. Saved answers are tied to your account; contact details are excluded from report-generation prompts. Don&apos;t enter highly confidential information.</p>
          </div>
          <div className="requirements-contact">
            <CircleHelp size={16} />
            <span>Not ready to decide? Choose “Not decided” or “No specific priorities yet” wherever available.</span>
          </div>
        </aside>

        <section className="requirements-card" aria-labelledby="requirements-step-title">
          <div className="requirements-card-top">
            <span>STEP {String(step + 1).padStart(2, "0")} <span className="requirements-step-total">/ {String(steps.length).padStart(2, "0")}</span></span>
            <span>{Math.round(((step + 1) / steps.length) * 100)}% complete</span>
          </div>
          <div className="requirements-progress" role="progressbar" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={step + 1}>
            <span style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
          </div>
          <div className="requirements-step-heading">
            <p className="workflow-eyebrow">{step === steps.length - 1 ? "Final check" : `Planning profile · ${String(step + 1).padStart(2, "0")}`}</p>
            <h2 id="requirements-step-title">{current.title}</h2>
            <p>{current.description}</p>
          </div>

          <div className="requirements-form" key={step} aria-busy={!draftReady}>
            {step === 0 && (
              <>
                <div className="requirements-form-grid">
                  <TextField label="Organization name" value={requirements.organizationName} onChange={(value) => setField("organizationName", value)} placeholder="Your organization" error={fieldError("organizationName")} />
                  <SelectField label="Organization type" value={requirements.organizationType} options={["Established enterprise", "High-growth company", "Startup", "Research or advisory team", "Other"]} onChange={(value) => setField("organizationType", value as Requirements["organizationType"])} />
                  <SelectField label="Industry" value={requirements.industry} options={["Financial services", "Technology", "Healthcare & life sciences", "Manufacturing", "Retail & consumer", "Telecommunications", "Energy & utilities", "Other"]} onChange={(value) => setField("industry", value as Requirements["industry"])} />
                  <SelectField label="Business model" value={requirements.businessModel} options={["Business-to-business", "Business-to-consumer", "Marketplace or platform", "Financial services", "Healthcare", "Industrial or manufacturing", "Other", "Not decided yet"]} onChange={(value) => setField("businessModel", value as Requirements["businessModel"])} />
                  <TextField label="Company website" value={requirements.website} onChange={(value) => setField("website", value)} placeholder="https://example.com" error={fieldError("website")} />
                  <TextField label="Your name" value={requirements.contactName ?? ""} onChange={(value) => setField("contactName", value)} placeholder="Optional" />
                  <TextField label="Role or team" value={requirements.contactRole ?? ""} onChange={(value) => setField("contactRole", value)} placeholder="Optional" />
                  <TextField label="Work email" value={requirements.contactEmail ?? ""} onChange={(value) => setField("contactEmail", value)} placeholder="Optional" type="email" error={fieldError("contactEmail")} />
                </div>
              </>
            )}
            {step === 1 && (
              <>
                <div className="requirements-form-grid">
                  <TextField label="Countries where you currently operate" value={requirements.operatingCountries} onChange={(value) => setField("operatingCountries", value)} placeholder="Comma-separated, if useful" />
                  <SelectField label="India presence" value={requirements.indiaPresence} options={["Exploring India", "Planning a new GCC", "Already operating a GCC", "Expanding an existing GCC", "Researching the ecosystem"]} onChange={(value) => setField("indiaPresence", value as Requirements["indiaPresence"])} />
                  <TextField label="Current India locations" value={requirements.existingIndiaLocations} onChange={(value) => setField("existingIndiaLocations", value)} placeholder="Cities or states, if any" />
                  <SelectField label="Approximate global company size" value={requirements.companySize} options={["Under 500", "500–5,000", "5,000–25,000", "25,000+", "Not decided yet"]} onChange={(value) => setField("companySize", value as Requirements["companySize"])} />
                  <SelectField label="Current India headcount" value={requirements.indiaHeadcount} options={["None yet", "Under 100", "100–500", "500–2,000", "2,000+", "Not decided yet"]} onChange={(value) => setField("indiaHeadcount", value as Requirements["indiaHeadcount"])} />
                </div>
                <OptionGrid title="Functions currently operated in India" options={currentFunctions} selected={requirements.currentFunctions} onToggle={(value) => toggleOption("currentFunctions", value)} error={fieldError("currentFunctions")} />
              </>
            )}
            {step === 2 && (
              <>
                <SelectField label="Expansion stage" value={requirements.expansionStage} options={["Exploring", "Planning", "Setting up", "Expanding", "Not decided yet"]} onChange={(value) => setField("expansionStage", value as Requirements["expansionStage"])} />
                <OptionGrid title="Main business objectives" options={objectives} selected={requirements.objectives} onToggle={(value) => toggleOption("objectives", value)} error={fieldError("objectives")} />
                <OptionGrid title="Functions currently operated or planned for India" options={functions} selected={requirements.functions} onToggle={(value) => toggleOption("functions", value)} error={fieldError("functions")} />
                <div className="requirements-form-grid">
                  <SelectField label="Indicative scale" value={requirements.scale} options={["Under 100", "100–500", "500–1,000", "1,000+", "Not decided"]} onChange={(value) => setField("scale", value as Requirements["scale"])} />
                  <SelectField label="Planning horizon" value={requirements.timeframe} options={["Within 6 months", "6–12 months", "1–2 years", "Longer term", "Research only"]} onChange={(value) => setField("timeframe", value as Requirements["timeframe"])} />
                  <SelectField label="Decision urgency" value={requirements.urgency} options={["High — near-term decision", "Medium — active planning", "Low — early exploration", "Not decided yet"]} onChange={(value) => setField("urgency", value as Requirements["urgency"])} />
                  <SelectField label="Expected initial headcount" value={requirements.expectedInitialHeadcount} options={["Under 100", "100–500", "500–1,000", "1,000+", "Not decided yet"]} onChange={(value) => setField("expectedInitialHeadcount", value as Requirements["expectedInitialHeadcount"])} />
                  <SelectField label="Expected future headcount" value={requirements.expectedFutureHeadcount} options={["Under 100", "100–500", "500–2,000", "2,000+", "Not decided yet"]} onChange={(value) => setField("expectedFutureHeadcount", value as Requirements["expectedFutureHeadcount"])} />
                </div>
              </>
            )}
            {step === 3 && (
              <>
                <OptionGrid title="Cities to include" options={cities} selected={requirements.preferredCities} onToggle={(value) => toggleOption("preferredCities", value)} error={fieldError("preferredCities")} />
                <OptionGrid title="Location priorities" options={locationPriorities} selected={requirements.locationPriorities} onToggle={(value) => toggleOption("locationPriorities", value)} error={fieldError("locationPriorities")} />
                <SelectField label="How open are you to alternatives?" value={requirements.locationFlexibility} options={["One preferred city", "Shortlist of cities", "Open to recommendations", "Not decided"]} onChange={(value) => setField("locationFlexibility", value as Requirements["locationFlexibility"])} />
              </>
            )}
            {step === 4 && (
              <>
                <OptionGrid title="Talent questions" options={talentPriorities} selected={requirements.talentPriorities} onToggle={(value) => toggleOption("talentPriorities", value)} error={fieldError("talentPriorities")} />
                <OptionGrid title="Role seniority" options={seniorityLevels} selected={requirements.seniority} onToggle={(value) => toggleOption("seniority", value)} error={fieldError("seniority")} />
                <OptionGrid title="Compensation research priorities" options={compensationPriorities} selected={requirements.compensationPriorities} onToggle={(value) => toggleOption("compensationPriorities", value)} error={fieldError("compensationPriorities")} />
                <OptionGrid title="Attrition and retention priorities" options={attritionPriorities} selected={requirements.attritionPriorities} onToggle={(value) => toggleOption("attritionPriorities", value)} error={fieldError("attritionPriorities")} />
                <div className="requirements-form-grid">
                  <SelectField label="Indicative hiring scale" value={requirements.hiringScale} options={["Under 100 roles", "100–500 roles", "500+ roles", "Not decided"]} onChange={(value) => setField("hiringScale", value as Requirements["hiringScale"])} />
                  <TextField label="Skills or roles of interest" value={requirements.skills} onChange={(value) => setField("skills", value)} placeholder="Optional" />
                  <TextAreaField label="Additional talent context" value={requirements.talentNotes} onChange={(value) => setField("talentNotes", value)} placeholder="What would help make this section useful?" />
                </div>
              </>
            )}
            {step === 5 && (
              <>
                <OptionGrid title="Real-estate research needs" options={realEstateNeeds} selected={requirements.realEstateNeeds} onToggle={(value) => toggleOption("realEstateNeeds", value)} error={fieldError("realEstateNeeds")} />
                <OptionGrid title="Workplace priorities" options={workplacePriorities} selected={requirements.workplacePriorities} onToggle={(value) => toggleOption("workplacePriorities", value)} error={fieldError("workplacePriorities")} />
                <div className="requirements-form-grid">
                  <SelectField label="Approximate office size" value={requirements.officeSize} options={["Under 10,000 sq ft", "10,000–50,000 sq ft", "50,000–150,000 sq ft", "150,000+ sq ft", "Not decided yet"]} onChange={(value) => setField("officeSize", value as Requirements["officeSize"])} />
                  <SelectField label="Workspace preference" value={requirements.workspacePreference} options={["Long-term lease", "Flexible workspace", "Build-to-suit", "Hybrid or phased", "Not decided yet"]} onChange={(value) => setField("workspacePreference", value as Requirements["workspacePreference"])} />
                  <SelectField label="Indicative budget range" value={requirements.budgetRange} options={["Under $1M annual operating budget", "$1M–$5M", "$5M–$20M", "$20M+", "Prefer not to say", "Not decided yet"]} onChange={(value) => setField("budgetRange", value as Requirements["budgetRange"])} />
                </div>
                <TextAreaField label="Additional workplace context" value={requirements.realEstateNotes} onChange={(value) => setField("realEstateNotes", value)} placeholder="Optional considerations or questions" />
              </>
            )}
            {step === 6 && (
              <>
                <OptionGrid title="Policy topics to investigate" options={policyTopics} selected={requirements.policyTopics} onToggle={(value) => toggleOption("policyTopics", value)} error={fieldError("policyTopics")} />
                <TextAreaField label="Questions for the policy checklist" value={requirements.policyNotes} onChange={(value) => setField("policyNotes", value)} placeholder="Optional; for example, which eligibility questions should your team verify?" />
              </>
            )}
            {step === 7 && (
              <>
                <OptionGrid title="Provider categories" options={providerCategories} selected={requirements.providerCategories} onToggle={(value) => toggleOption("providerCategories", value)} error={fieldError("providerCategories")} />
                <OptionGrid title="Provider selection criteria" options={providerCriteria} selected={requirements.providerCriteria} onToggle={(value) => toggleOption("providerCriteria", value)} error={fieldError("providerCriteria")} />
                <SelectField label="Preferred engagement model" value={requirements.providerEngagement} options={["Project-based", "Ongoing managed service", "Advisory retainer", "Mix of engagements", "Not decided yet"]} onChange={(value) => setField("providerEngagement", value as Requirements["providerEngagement"])} />
                <TextAreaField label="Provider research context" value={requirements.providerNotes} onChange={(value) => setField("providerNotes", value)} placeholder="Optional; describe any service categories or selection criteria." />
              </>
            )}
            {step === 8 && (
              <>
                <TextAreaField label="Known risks" value={requirements.risks} onChange={(value) => setField("risks", value)} placeholder="Optional risks the report should keep visible" />
                <TextAreaField label="Constraints" value={requirements.constraints} onChange={(value) => setField("constraints", value)} placeholder="Optional operational, timing, or budget constraints" />
                <TextAreaField label="Unresolved questions" value={requirements.openQuestions} onChange={(value) => setField("openQuestions", value)} placeholder="Questions your team still needs to answer" />
              </>
            )}
            {step === 9 && (
              <>
                <OptionGrid title="Report sections" options={reportModules.map(([, label]) => label)} selected={requirements.reportModules.map((moduleKey) => reportModules.find(([key]) => key === moduleKey)?.[1] ?? moduleKey)} onToggle={(label) => {
                  const moduleKey = reportModules.find(([, optionLabel]) => optionLabel === label)?.[0];
                  if (moduleKey) toggleOption("reportModules", moduleKey);
                }} error={fieldError("reportModules")} />
                <div className="requirements-form-grid">
                  <SelectField label="Primary audience" value={requirements.reportAudience} options={["Executive leadership", "Strategy team", "GCC operations", "Real estate team", "Talent team", "Research team"]} onChange={(value) => setField("reportAudience", value as Requirements["reportAudience"])} />
                  <SelectField label="Preferred depth" value={requirements.reportDepth} options={["Executive overview", "Decision support", "Research checklist"]} onChange={(value) => setField("reportDepth", value as Requirements["reportDepth"])} />
                  <TextField label="A key question to answer" value={requirements.reportQuestion} onChange={(value) => setField("reportQuestion", value)} placeholder="Optional" />
                </div>
              </>
            )}
            {step === 10 && (
              <div className="requirements-review">
                {[
                      ["Company profile", 0, [requirements.organizationName, requirements.organizationType, requirements.industry, requirements.businessModel, requirements.website, requirements.contactRole, requirements.contactEmail]],
                      ["Current footprint", 1, [requirements.operatingCountries, requirements.indiaPresence, requirements.existingIndiaLocations, requirements.companySize, requirements.indiaHeadcount, ...requirements.currentFunctions]],
                      ["Expansion strategy", 2, [...requirements.objectives, ...requirements.functions, requirements.expansionStage, requirements.scale, requirements.timeframe, requirements.urgency, requirements.expectedInitialHeadcount, requirements.expectedFutureHeadcount]],
                      ["Location", 3, [...requirements.preferredCities, ...requirements.locationPriorities, requirements.locationFlexibility]],
                      ["Talent", 4, [...requirements.talentPriorities, ...requirements.seniority, ...requirements.compensationPriorities, ...requirements.attritionPriorities, requirements.hiringScale, requirements.skills, requirements.talentNotes]],
                      ["Workplace", 5, [...requirements.realEstateNeeds, ...requirements.workplacePriorities, requirements.officeSize, requirements.workspacePreference, requirements.budgetRange, requirements.realEstateNotes]],
                      ["Policy", 6, [...requirements.policyTopics, requirements.policyNotes]],
                      ["Providers", 7, [...requirements.providerCategories, ...requirements.providerCriteria, requirements.providerEngagement, requirements.providerNotes]],
                      ["Risks & questions", 8, [requirements.risks, requirements.constraints, requirements.openQuestions]],
                      ["Report", 9, [...requirements.reportModules.map((moduleKey) => reportModules.find(([key]) => key === moduleKey)?.[1] ?? moduleKey), requirements.reportAudience, requirements.reportDepth, requirements.reportQuestion]],
                    ].map(([label, sectionIndex, values]) => (
                      <div className="requirements-review-row" key={label as string}>
                        <strong>{label}</strong>
                        <p>{(values as string[]).filter(Boolean).join(" · ") || "No details provided"}</p>
                        <button type="button" onClick={() => setStep(sectionIndex as number)}>Edit</button>
                      </div>
                    ))}
                    <div className="requirements-demo-note"><ShieldCheck size={16} /><p><strong>Saving creates a private profile.</strong> Generated reports are separate records. They use only permitted knowledge-base material and clearly mark unknowns; unsupported market or policy claims will not be invented.</p></div>
                  </div>
            )}
          </div>

          {generationError && <p className="requirements-error-banner" role="alert">{generationError}</p>}
          {showSignIn && <div className="requirements-auth-gate" role="alert"><p><strong>Sign in to save your profile.</strong> Your draft stays in this browser. After signing in, open Company Profile to resume it on this device.</p><div><Link className="workflow-primary-button" href="/sign-in">Sign in</Link><Link className="workflow-secondary-button" href="/sign-in#create-account">Create account</Link></div></div>}
          {generationStage && <p className="requirements-generation-status" role="status"><LoaderCircle size={16} />{generationStage}</p>}
          <div className="requirements-actions">
            <button className="workflow-secondary-button" type="button" onClick={() => step === 0 ? router.push("/") : setStep((currentStep) => currentStep - 1)} disabled={Boolean(generationStage)}>
              <ArrowLeft size={15} />{step === 0 ? "Back to GCC Pulse" : "Previous"}
            </button>
            {step < steps.length - 1 ? (
              <button className="workflow-primary-button" type="button" onClick={nextStep}>Continue <ArrowRight size={15} /></button>
            ) : (
              <button className="workflow-primary-button" type="button" onClick={saveProfile} disabled={Boolean(generationStage) || !draftReady}>
                {generationStage ? <><LoaderCircle className="workflow-spinner" size={16} /> Saving profile</> : <>Save profile securely <ArrowRight size={15} /></>}
              </button>
            )}
          </div>
          <p className="requirements-footnote">Draft stays in this browser until you save it to your authenticated account.</p>
        </section>
      </div>
    </main>
  );
}
