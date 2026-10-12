import { z } from "zod";
import type { Requirements } from "@/lib/reporting/requirements";

export const ResearchQuestionSchema = z.object({
  id: z.string().min(1).max(50),
  topic: z.enum(["location", "talent", "real-estate", "policy", "providers", "setup", "risk"]),
  rationale: z.string().min(1).max(500),
  query: z.string().min(1).max(1000),
  geography: z.array(z.string().max(100)).max(12),
  requiredEvidence: z.array(z.string().max(120)).max(8),
  preferredSourceTypes: z.array(z.string().max(80)).max(8),
  priority: z.enum(["high", "medium", "low"]),
});

export const ResearchPlanSchema = z.array(ResearchQuestionSchema).max(8);
export type ResearchQuestion = z.infer<typeof ResearchQuestionSchema>;

function joinOrFallback(values: string[], fallback: string) {
  return values.filter((value) => !/not decided|no specific|no functions/i.test(value)).join(", ") || fallback;
}

export function buildResearchPlan(profile: Requirements) {
  const plan: ResearchQuestion[] = [];
  const cities = joinOrFallback(profile.preferredCities, "Indian GCC location options");
  const functions = joinOrFallback(profile.functions, "the company's stated GCC functions");
  const industry = profile.industry;
  const targetSize = profile.expectedInitialHeadcount;
  const timeframe = profile.timeframe;
  const add = (question: ResearchQuestion) => {
    if (plan.length < 8) plan.push(question);
  };

  if (profile.reportModules.includes("location") || profile.preferredCities.length) {
    add({
      id: "location-shortlist",
      topic: "location",
      rationale: `Compare the user's selected or open location choices for ${functions}.`,
      query: `India GCC city evidence for ${cities}; ${industry}; ${functions}; location priorities ${profile.locationPriorities.join(", ")}; target headcount ${targetSize}`,
      geography: profile.preferredCities.length ? profile.preferredCities : ["India"],
      requiredEvidence: ["city-level capability or ecosystem evidence", "dated source context"],
      preferredSourceTypes: ["official statistics", "reputable market research"],
      priority: "high",
    });
  }
  if (profile.reportModules.includes("talent") || profile.talentPriorities.length) {
    add({
      id: "talent-planning",
      topic: "talent",
      rationale: `Assess evidence relevant to hiring ${functions} in the user's preferred locations.`,
      query: `India talent availability and hiring considerations for ${profile.skills || functions}, ${profile.seniority.join(", ")}, cities ${cities}; hiring scale ${profile.hiringScale}; retention priorities ${profile.attritionPriorities.join(", ")}`,
      geography: profile.preferredCities.length ? profile.preferredCities : ["India"],
      requiredEvidence: ["dated skills or labor-market evidence"],
      preferredSourceTypes: ["official labor statistics", "reputable talent research"],
      priority: "high",
    });
  }
  if (profile.reportModules.includes("real-estate") || profile.realEstateNeeds.length) {
    add({
      id: "real-estate",
      topic: "real-estate",
      rationale: "Surface documented workspace options and cost drivers; do not infer prices without a dated source.",
      query: `India GCC office and workplace evidence for ${cities}; footprint ${profile.officeSize}; workspace preference ${profile.workspacePreference}; needs ${profile.realEstateNeeds.join(", ")}`,
      geography: profile.preferredCities.length ? profile.preferredCities : ["India"],
      requiredEvidence: ["dated commercial real-estate source if available"],
      preferredSourceTypes: ["reputable commercial property research", "official planning sources"],
      priority: "medium",
    });
  }
  if (profile.reportModules.includes("policy") || profile.policyTopics.length) {
    add({
      id: "policy-review",
      topic: "policy",
      rationale: "Identify policy material matching the user's stated topics and verify jurisdiction and effective dates.",
      query: `Official Indian central and state policy evidence about ${profile.policyTopics.join(", ")} relevant to ${industry} GCC setup in ${cities}.`,
      geography: profile.preferredCities.length ? profile.preferredCities : ["India"],
      requiredEvidence: ["primary policy text", "jurisdiction", "publication or effective date"],
      preferredSourceTypes: ["official government", "regulator"],
      priority: "high",
    });
  }
  if (profile.reportModules.includes("providers") || profile.providerCategories.length) {
    add({
      id: "provider-options",
      topic: "providers",
      rationale: "Clarify service categories and user evaluation criteria without inventing vendor capabilities.",
      query: `Provider information relevant to India GCC setup: ${profile.providerCategories.join(", ")}; criteria ${profile.providerCriteria.join(", ")}; engagement ${profile.providerEngagement}`,
      geography: ["India"],
      requiredEvidence: ["provider-authored service information"],
      preferredSourceTypes: ["provider official information"],
      priority: "low",
    });
  }
  if (profile.reportModules.includes("strategy") || profile.reportModules.includes("next-steps")) {
    add({
      id: "setup-and-ecosystem",
      topic: "setup",
      rationale: "Find source-backed setup and ecosystem context for the user's stated operating model and timeline.",
      query: `India GCC setup considerations for ${industry}, ${functions}; operating presence ${profile.indiaPresence}; launch timeframe ${timeframe}; constraints ${profile.constraints}`,
      geography: ["India"],
      requiredEvidence: ["official or primary setup guidance", "publication date"],
      preferredSourceTypes: ["official government", "regulator", "company filing"],
      priority: "medium",
    });
  }
  if (profile.risks || profile.openQuestions) {
    add({
      id: "risks-and-open-questions",
      topic: "risk",
      rationale: "Check whether available sources address risks and questions supplied by the user.",
      query: `Evidence relevant to GCC planning risks: ${profile.risks}; open questions: ${profile.openQuestions}; company constraints: ${profile.constraints}`,
      geography: profile.preferredCities.length ? profile.preferredCities : ["India"],
      requiredEvidence: ["directly relevant source material"],
      preferredSourceTypes: ["official", "primary", "reputable secondary"],
      priority: "medium",
    });
  }
  return ResearchPlanSchema.parse(plan);
}
