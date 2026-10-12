import "server-only";
import { NextResponse } from "next/server";
import { z } from "zod";
import { apiFailure, createRequestId } from "@/lib/gcc/api";
import { getAuthenticatedGccUser } from "@/lib/gcc/auth";

const ReportIdSchema = z.string().uuid();
const ManifestEntrySchema = z.object({
  chunk_id: z.string().uuid(),
  source_id: z.string().uuid(),
  source_title: z.string(),
  publisher: z.string().nullable(),
  canonical_url: z.string().nullable(),
  publication_date: z.string().nullable(),
  retrieved_at: z.string(),
  section_heading: z.string().nullable(),
  verification_status: z.string(),
  retrieval_rank: z.number().int().positive(),
}).passthrough();

export async function GET(_request: Request, { params }: { params: Promise<{ reportId: string }> }) {
  const requestId = createRequestId();
  const { supabase, user } = await getAuthenticatedGccUser();
  if (!supabase) return apiFailure(requestId, "GCC workspace authentication is not configured on the server.", "AUTH_NOT_CONFIGURED", 503);
  if (!user) return apiFailure(requestId, "Sign in to view this report.", "AUTH_REQUIRED", 401);
  const { reportId } = await params;
  if (!ReportIdSchema.safeParse(reportId).success) return apiFailure(requestId, "Report not found.", "REPORT_NOT_FOUND", 404);

  const { data, error } = await supabase.from("gcc_reports")
    .select("id,profile_id,status,title,report,evidence_source_ids,evidence_manifest,profile_snapshot,validation_status,provider,model,error_message,created_at,updated_at")
    .eq("id", reportId).eq("user_id", user.id).maybeSingle();
  if (error) {
    console.error("GCC report lookup failed.", { requestId, code: error.code });
    return apiFailure(requestId, "Could not load this report.", "REPORT_LOOKUP_FAILED", 500);
  }
  if (!data) return apiFailure(requestId, "Report not found.", "REPORT_NOT_FOUND", 404);
  const manifestResult = z.array(ManifestEntrySchema).safeParse(data.evidence_manifest);
  if (!manifestResult.success) {
    console.error("GCC report evidence manifest failed validation.", { requestId, reportId });
    return apiFailure(requestId, "This report's evidence manifest is invalid.", "EVIDENCE_MANIFEST_INVALID", 500);
  }
  const manifest = manifestResult.data;
  const sourceIds = [...new Set([...data.evidence_source_ids, ...manifest.map((item) => item.source_id)])];
  const { data: sourceRows, error: sourceError } = sourceIds.length
    ? await supabase.from("gcc_knowledge_sources")
      .select("id,title,url,publisher,verification_status")
      .in("id", sourceIds).limit(50)
    : { data: [], error: null };
  if (sourceError) {
    console.error("GCC report citation lookup failed.", { requestId, code: sourceError.code });
    return apiFailure(requestId, "Could not load this report's source citations.", "CITATION_LOOKUP_FAILED", 500);
  }
  const sourcesById = new Map((sourceRows ?? []).map((source) => [source.id, source]));
  const manifestSources = new Map(manifest.map((item) => [item.source_id, item]));
  const citedSources = sourceIds.flatMap((id) => {
    const stored = sourcesById.get(id);
    const snapshot = manifestSources.get(id);
    if (!stored && !snapshot) return [];
    return [{
      id,
      title: snapshot?.source_title ?? stored?.title ?? "Source",
      url: snapshot?.canonical_url ?? stored?.url ?? null,
      publisher: snapshot?.publisher ?? stored?.publisher ?? null,
      published_at: snapshot?.publication_date ?? null,
      retrieved_at: snapshot?.retrieved_at ?? "",
      verification_status: snapshot?.verification_status ?? stored?.verification_status ?? "unknown",
    }];
  });
  return NextResponse.json({ report: data, citedSources, requestId });
}
