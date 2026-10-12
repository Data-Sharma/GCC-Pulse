import "server-only";
import { NextResponse } from "next/server";
import { z } from "zod";
import { apiFailure, claimAiRequestSlot, createRequestId } from "@/lib/gcc/api";
import { getAuthenticatedGccUser } from "@/lib/gcc/auth";
import { generateValidatedReport } from "@/lib/gcc/report-generation";
import { retrieveHybridEvidence } from "@/lib/gcc/retrieval";
import { buildResearchPlan } from "@/lib/gcc/research-plan";
import { RequirementsSchema } from "@/lib/reporting/requirements";

export const runtime = "nodejs";
export const maxDuration = 60;

const ReportRequestSchema = z.object({ consent: z.literal(true) }).strict();
const IdempotencyKeySchema = z.string().uuid();

function withoutContactDetails(
  requirements: z.infer<typeof RequirementsSchema>,
) {
  return Object.fromEntries(
    Object.entries(requirements).filter(([key]) => !["contactName", "contactRole", "contactEmail"].includes(key)),
  );
}

function evidenceManifest(evidence: Awaited<ReturnType<typeof retrieveHybridEvidence>>["evidence"]) {
  return evidence.map((item) => ({
    chunk_id: item.chunk_id,
    source_id: item.source_id,
    document_id: item.document_id,
    source_title: item.source_title,
    publisher: item.publisher,
    canonical_url: item.canonical_url,
    publication_date: item.publication_date,
    retrieved_at: item.retrieved_at,
    source_type: item.source_type,
    category: item.category,
    verification_status: item.verification_status,
    section_heading: item.section_heading,
    chunk_index: item.chunk_index,
    research_question_ids: item.researchQuestionIds,
    retrieval_rank: item.retrievalRank,
    vector_similarity: item.vector_similarity,
    lexical_score: item.lexical_score,
  }));
}

export async function GET() {
  const { supabase, user } = await getAuthenticatedGccUser();
  if (!supabase) return NextResponse.json({ error: "GCC workspace authentication is not configured on the server." }, { status: 503 });
  if (!user) return NextResponse.json({ error: "Sign in to view saved reports." }, { status: 401 });
  const { data, error } = await supabase.from("gcc_reports")
    .select("id,profile_id,status,title,created_at,updated_at,error_message,validation_status,provider,model")
    .eq("user_id", user.id).order("created_at", { ascending: false }).limit(100);
  if (error) {
    console.error("GCC report library query failed.", { code: error.code });
    return NextResponse.json({ error: "Could not load reports. Apply the report migration and try again." }, { status: 500 });
  }
  return NextResponse.json({ reports: data ?? [] });
}

export async function POST(request: Request) {
  const requestId = createRequestId();
  const { supabase, user } = await getAuthenticatedGccUser();
  if (!supabase) return apiFailure(requestId, "GCC workspace authentication is not configured on the server.", "AUTH_NOT_CONFIGURED", 503);
  if (!user) return apiFailure(requestId, "Sign in to generate a personalized report.", "AUTH_REQUIRED", 401);

  const requestBody = await request.json().catch(() => null);
  if (!ReportRequestSchema.safeParse(requestBody).success) {
    return apiFailure(requestId, "Invalid report request.", "INVALID_REQUEST", 400);
  }
  const keyResult = IdempotencyKeySchema.safeParse(request.headers.get("idempotency-key"));
  if (!keyResult.success) return apiFailure(requestId, "A valid Idempotency-Key header is required.", "INVALID_IDEMPOTENCY_KEY", 400);
  const generationKey = keyResult.data;

  const { data: existingReport, error: existingError } = await supabase.from("gcc_reports")
    .select("id,status,title,report,evidence_source_ids,created_at,error_message,validation_status")
    .eq("user_id", user.id).eq("generation_key", generationKey).maybeSingle();
  if (existingError) {
    console.error("GCC report idempotency lookup failed.", { requestId, code: existingError.code });
    return apiFailure(requestId, "Could not check the report request state.", "REPORT_LOOKUP_FAILED", 500);
  }
  if (existingReport) {
    if (existingReport.status === "completed") return NextResponse.json({ report: existingReport, requestId }, { status: 200 });
    if (existingReport.status === "generating") return NextResponse.json({
      reportId: existingReport.id,
      status: existingReport.status,
      requestId,
    }, { status: 202 });
    return NextResponse.json({
      reportId: existingReport.id,
      status: existingReport.status,
      error: existingReport.error_message || "This idempotent report request previously failed. Start a new report request to retry.",
      requestId,
    }, { status: 409 });
  }
  const slot = await claimAiRequestSlot(supabase, "report_generation");
  if (!slot.allowed) return slot.response;

  const { data: profile, error: profileError } = await supabase.from("gcc_profiles")
    .select("id,company_name,requirements").eq("user_id", user.id).maybeSingle();
  if (profileError) {
    console.error("GCC report profile lookup failed.", { requestId, code: profileError.code });
    return apiFailure(requestId, "Could not load the saved company profile.", "PROFILE_LOOKUP_FAILED", 500);
  }
  if (!profile) return apiFailure(requestId, "Save a company profile before generating a report.", "PROFILE_REQUIRED", 409);
  const parsedRequirements = RequirementsSchema.safeParse(profile.requirements);
  if (!parsedRequirements.success) return apiFailure(requestId, "The saved profile is incomplete or invalid. Edit and save it before generating a report.", "PROFILE_INVALID", 409);

  const startedAt = Date.now();
  const { data: reportRecord, error: createError } = await supabase.from("gcc_reports").insert({
    user_id: user.id,
    profile_id: profile.id,
    generation_key: generationKey,
    request_id: requestId,
    profile_snapshot: withoutContactDetails(parsedRequirements.data),
    report_schema_version: "1",
    provider: "gemini",
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    title: `${profile.company_name} — India GCC planning report`,
    status: "generating",
    validation_status: "pending",
  }).select("id").single();
  if (createError || !reportRecord) {
    console.error("GCC report record creation failed.", { requestId, code: createError?.code });
    return apiFailure(requestId, "Could not create the report record. Apply the report migration and try again.", "REPORT_CREATE_FAILED", 500);
  }

  try {
    const researchPlan = buildResearchPlan(parsedRequirements.data);
    const initialPlanSave = await supabase.from("gcc_reports").update({
      research_plan: researchPlan,
    }).eq("id", reportRecord.id).eq("user_id", user.id);
    if (initialPlanSave.error) throw new Error("research_plan_persistence_failed");

    const retrieval = await retrieveHybridEvidence(supabase, profile.id, researchPlan);
    const manifest = evidenceManifest(retrieval.evidence);
    const evidenceSave = await supabase.from("gcc_reports").update({
      evidence_manifest: manifest,
    }).eq("id", reportRecord.id).eq("user_id", user.id);
    if (evidenceSave.error) throw new Error("evidence_manifest_persistence_failed");

    const generated = await generateValidatedReport(parsedRequirements.data, researchPlan, retrieval.evidence);
    const usedSources = [...new Set(generated.report.sections.flatMap((section) =>
      section.findings.flatMap((finding) => finding.sourceIds),
    ))];
    const rows = retrieval.evidence.map((item) => ({
      report_id: reportRecord.id,
      user_id: user.id,
      source_id: item.source_id,
      document_id: item.document_id,
      chunk_id: item.chunk_id,
      research_question_id: item.researchQuestionIds.join(",").slice(0, 200),
      retrieval_rank: Math.max(1, item.retrievalRank),
      vector_similarity: item.vector_similarity,
    }));
    if (rows.length) {
      const { error: evidenceInsertError } = await supabase.from("gcc_report_evidence").insert(rows);
      if (evidenceInsertError) throw new Error("report_evidence_persistence_failed");
    }

    const { data: completed, error: saveError } = await supabase.from("gcc_reports").update({
      status: "completed",
      title: generated.report.title,
      report: generated.report,
      evidence_source_ids: usedSources,
      evidence_manifest: manifest,
      research_plan: researchPlan,
      provider: generated.provider,
      model: generated.model,
      validation_status: generated.validationStatus,
      generation_duration_ms: Date.now() - startedAt,
      error_message: null,
      updated_at: new Date().toISOString(),
    }).eq("id", reportRecord.id).eq("user_id", user.id)
      .select("id,status,title,report,evidence_source_ids,created_at,validation_status,provider,model,evidence_manifest").single();
    if (saveError || !completed) throw new Error("completed_report_persistence_failed");

    console.info("GCC report generation completed.", {
      requestId,
      reportId: reportRecord.id,
      provider: generated.provider,
      model: generated.model,
      researchQuestionCount: researchPlan.length,
      evidenceCount: retrieval.evidence.length,
      citedSourceCount: usedSources.length,
      validationStatus: generated.validationStatus,
      durationMs: Date.now() - startedAt,
      usage: generated.usage,
    });
    return NextResponse.json({ report: completed, requestId }, { status: 201 });
  } catch (cause) {
    const errorCategory = cause instanceof Error ? cause.message : "unknown_report_failure";
    console.error("GCC report generation failed.", {
      requestId,
      reportId: reportRecord.id,
      errorCategory,
      durationMs: Date.now() - startedAt,
    });
    const safeMessage = "Report generation failed during retrieval, validation, or persistence. No completed report was saved.";
    const { error: updateError } = await supabase.from("gcc_reports").update({
      status: "failed",
      validation_status: "invalid",
      error_message: safeMessage,
      generation_duration_ms: Date.now() - startedAt,
      request_id: requestId,
      updated_at: new Date().toISOString(),
    }).eq("id", reportRecord.id).eq("user_id", user.id);
    if (updateError) console.error("Unable to record report-generation failure.", { requestId, code: updateError.code });
    return NextResponse.json({
      error: safeMessage,
      code: "REPORT_GENERATION_FAILED",
      reportId: reportRecord.id,
      status: "failed",
      requestId,
    }, { status: 502 });
  }
}
