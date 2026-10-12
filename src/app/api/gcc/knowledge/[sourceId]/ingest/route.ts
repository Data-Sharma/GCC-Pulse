import { NextResponse } from "next/server";
import { z } from "zod";
import { claimAiRequestSlot, createRequestId } from "@/lib/gcc/api";
import { getAuthenticatedGccUser } from "@/lib/gcc/auth";
import { IngestionError, ingestPastedText } from "@/lib/gcc/ingestion";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(_request: Request, { params }: { params: Promise<{ sourceId: string }> }) {
  const requestId = createRequestId();
  const { supabase, user } = await getAuthenticatedGccUser();
  if (!supabase) return NextResponse.json({ error: "GCC workspace authentication is not configured on the server.", requestId }, { status: 503 });
  if (!user) return NextResponse.json({ error: "Sign in to retry source ingestion.", requestId }, { status: 401 });
  const { sourceId } = await params;
  if (!z.string().uuid().safeParse(sourceId).success) return NextResponse.json({ error: "Source not found.", requestId }, { status: 404 });

  const slot = await claimAiRequestSlot(supabase, "source_ingestion");
  if (!slot.allowed) return slot.response;
  const { data: source, error: sourceError } = await supabase.from("gcc_knowledge_sources")
    .select("id,profile_id").eq("id", sourceId).eq("user_id", user.id).eq("scope", "company").maybeSingle();
  if (sourceError) {
    console.error("Source retry ownership lookup failed.", { requestId, code: sourceError.code });
    return NextResponse.json({ error: "Could not load this source.", requestId }, { status: 500 });
  }
  if (!source) return NextResponse.json({ error: "Source not found.", requestId }, { status: 404 });
  const { data: document, error: documentError } = await supabase.from("gcc_knowledge_documents")
    .select("original_text").eq("source_id", sourceId).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (documentError) {
    console.error("Source retry document lookup failed.", { requestId, code: documentError.code });
    return NextResponse.json({ error: "Could not load the source text for retry.", requestId }, { status: 500 });
  }
  if (!document?.original_text) return NextResponse.json({
    error: "No pasted text is stored for this source. Add source text before retrying ingestion.",
    requestId,
  }, { status: 409 });

  try {
    const result = await ingestPastedText(supabase, sourceId, user.id, document.original_text);
    return NextResponse.json({ sourceId, ...result, requestId });
  } catch (cause) {
    const stage = cause instanceof IngestionError ? cause.stage : "UNKNOWN";
    console.error("Knowledge source retry failed.", {
      requestId,
      sourceId,
      stage,
      errorCategory: cause instanceof IngestionError ? `stage_${stage.toLowerCase()}_failed` : "ingestion_failed",
    });
    return NextResponse.json({
      error: "Source ingestion failed again. Check the failed stage and server configuration.",
      code: "INGESTION_FAILED",
      stage,
      requestId,
    }, { status: 502 });
  }
}
