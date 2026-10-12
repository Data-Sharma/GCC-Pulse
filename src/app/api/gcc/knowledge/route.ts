import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedGccUser } from "@/lib/gcc/auth";
import { claimAiRequestSlot, createRequestId } from "@/lib/gcc/api";
import { IngestionError, ingestPastedText } from "@/lib/gcc/ingestion";

export const runtime = "nodejs";
export const maxDuration = 60;

const SourceInputSchema = z.object({
  title: z.string().trim().min(1).max(300),
  url: z.union([z.literal(""), z.url().max(2000).refine((value) => {
    try {
      const url = new URL(value);
      return (url.protocol === "https:" || url.protocol === "http:") && !url.username && !url.password;
    } catch {
      return false;
    }
  }, "Source URLs must use HTTP or HTTPS and cannot contain credentials.")]).default(""),
  publisher: z.string().trim().max(200).default(""),
  publishedAt: z.union([z.literal(""), z.iso.date()]).default(""),
  excerpt: z.string().trim().max(5000).default(""),
  contentText: z.string().max(50_000).default(""),
  category: z.enum(["company", "landscape", "city", "talent", "real-estate", "policy", "provider", "risk", "other"]),
});

function canonicalizeUrl(value: string) {
  if (!value) return null;
  const url = new URL(value);
  url.hash = "";
  if (url.pathname.length > 1) url.pathname = url.pathname.replace(/\/+$/, "");
  return url.toString();
}

export async function GET() {
  const { supabase, user } = await getAuthenticatedGccUser();
  if (!supabase) return NextResponse.json({ error: "GCC workspace authentication is not configured on the server." }, { status: 503 });
  if (!user) return NextResponse.json({ error: "Sign in to access your knowledge base." }, { status: 401 });
  const { data: profile, error: profileError } = await supabase.from("gcc_profiles")
    .select("id").eq("user_id", user.id).maybeSingle();
  if (profileError) {
    console.error("Knowledge base profile lookup failed.", profileError.message);
    return NextResponse.json({ error: "Could not load the profile context." }, { status: 500 });
  }
  const query = supabase.from("gcc_knowledge_sources")
    .select("id,scope,title,url,publisher,published_at,retrieved_at,excerpt,category,verification_status,source_type,trust_tier,source_status,ingestion_status,ingestion_stage,ingestion_error,content_hash,created_at")
    .order("created_at", { ascending: false }).limit(100);
  const { data, error } = profile
    ? await query.or(`scope.eq.global,and(scope.eq.company,user_id.eq.${user.id},profile_id.eq.${profile.id})`)
    : await query.eq("scope", "global");
  if (error) {
    console.error("Knowledge base read failed.", error.message);
    return NextResponse.json({ error: "Could not load knowledge sources. Check that the knowledge-base migration has been applied." }, { status: 500 });
  }
  const sources = data ?? [];
  const sourceIds = sources.map((source) => source.id);
  if (!sourceIds.length) return NextResponse.json({ sources: [] });
  const [{ data: documents, error: documentError }, { data: stages, error: stageError }] = await Promise.all([
    supabase.from("gcc_knowledge_documents")
      .select("id,source_id,ingestion_status,ingestion_stage,ingestion_error,chunk_count,embedding_model,updated_at")
      .in("source_id", sourceIds).order("created_at", { ascending: false }),
    supabase.from("gcc_ingestion_stage_runs")
      .select("id,source_id,stage,status,error_code,duration_ms,started_at,completed_at")
      .in("source_id", sourceIds).order("started_at", { ascending: false }).limit(200),
  ]);
  if (documentError || stageError) {
    console.error("Knowledge ingestion metadata query failed.", { documentError: documentError?.code, stageError: stageError?.code });
    return NextResponse.json({ error: "Could not load knowledge ingestion status. Apply the RAG migration and try again." }, { status: 500 });
  }
  return NextResponse.json({
    sources: sources.map((source) => ({
      ...source,
      latestDocument: documents?.find((document) => document.source_id === source.id) ?? null,
      recentStages: stages?.filter((stage) => stage.source_id === source.id).slice(0, 10) ?? [],
    })),
  });
}

export async function POST(request: Request) {
  const { supabase, user } = await getAuthenticatedGccUser();
  if (!supabase) return NextResponse.json({ error: "GCC workspace authentication is not configured on the server." }, { status: 503 });
  if (!user) return NextResponse.json({ error: "Sign in to add sources to your knowledge base." }, { status: 401 });
  const requestId = createRequestId();
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 60_000) return NextResponse.json({ error: "Source submission is too large.", code: "REQUEST_TOO_LARGE", requestId }, { status: 413 });
  const body = await request.json().catch(() => null);
  const parsed = SourceInputSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Source details are invalid.", details: parsed.error.flatten(), requestId }, { status: 400 });
  const rawIdempotencyKey = request.headers.get("idempotency-key");
  if (rawIdempotencyKey && !z.string().uuid().safeParse(rawIdempotencyKey).success) {
    return NextResponse.json({ error: "Idempotency-Key must be a UUID.", code: "INVALID_IDEMPOTENCY_KEY", requestId }, { status: 400 });
  }
  const idempotencyKey = rawIdempotencyKey;

  const { data: profile, error: profileError } = await supabase.from("gcc_profiles")
    .select("id").eq("user_id", user.id).maybeSingle();
  if (profileError) {
    console.error("Knowledge source profile lookup failed.", profileError.message);
    return NextResponse.json({ error: "Could not verify the saved company profile." }, { status: 500 });
  }
  if (!profile) return NextResponse.json({ error: "Save a company profile before adding company-specific knowledge." }, { status: 409 });

  if (parsed.data.contentText) {
    const slot = await claimAiRequestSlot(supabase, "source_ingestion");
    if (!slot.allowed) return slot.response;
  }
  const canonicalUrl = canonicalizeUrl(parsed.data.url);
  const sourceValues = {
    user_id: user.id,
    profile_id: profile.id,
    scope: "company",
    title: parsed.data.title,
    url: canonicalUrl,
    publisher: parsed.data.publisher || null,
    published_at: parsed.data.publishedAt || null,
    excerpt: parsed.data.excerpt || null,
    category: parsed.data.category,
    source_type: parsed.data.contentText ? "user_pasted_text" : "user_supplied",
    trust_tier: "user_supplied",
    verification_status: "unverified",
    ingestion_status: parsed.data.contentText ? "processing" : "not_ingested",
    ingestion_stage: parsed.data.contentText ? "DISCOVER" : null,
    ingestion_error: null,
    idempotency_key: idempotencyKey,
  };
  const { data: existingSource, error: existingError } = idempotencyKey
    ? await supabase.from("gcc_knowledge_sources").select("id")
      .eq("user_id", user.id).eq("idempotency_key", idempotencyKey).maybeSingle()
    : { data: null, error: null };
  if (existingError) {
    console.error("Knowledge source idempotency lookup failed.", { requestId, code: existingError.code });
    return NextResponse.json({ error: "Could not check for an existing source submission.", requestId }, { status: 500 });
  }
  const { data, error } = existingSource
    ? await supabase.from("gcc_knowledge_sources").update(sourceValues).eq("id", existingSource.id).eq("user_id", user.id)
      .select("id,scope,title,url,publisher,published_at,retrieved_at,excerpt,category,verification_status,source_type,trust_tier,source_status,ingestion_status,ingestion_stage,ingestion_error,created_at").single()
    : await supabase.from("gcc_knowledge_sources").insert(sourceValues)
      .select("id,scope,title,url,publisher,published_at,retrieved_at,excerpt,category,verification_status,source_type,trust_tier,source_status,ingestion_status,ingestion_stage,ingestion_error,created_at").single();

  if (error || !data) {
    console.error("Knowledge source save failed.", { requestId, code: error?.code });
    return NextResponse.json({ error: "Could not save the source. Apply the knowledge migration and try again.", requestId }, { status: 500 });
  }
  if (parsed.data.contentText) {
    try {
      const ingestion = await ingestPastedText(supabase, data.id, user.id, parsed.data.contentText);
      return NextResponse.json({
        source: { ...data, ingestion_status: "completed", ingestion_stage: "COMPLETE", latestDocument: ingestion },
        requestId,
      }, { status: 201 });
    } catch (cause) {
      const stage = cause instanceof IngestionError ? cause.stage : "UNKNOWN";
      console.error("Knowledge source ingestion failed.", {
        requestId,
        sourceId: data.id,
        stage,
        errorCategory: cause instanceof IngestionError ? `stage_${stage.toLowerCase()}_failed` : "ingestion_failed",
      });
      return NextResponse.json({
        source: { ...data, ingestion_status: "failed", ingestion_stage: stage },
        error: "Source metadata was saved, but text ingestion failed. Retry ingestion after checking server configuration.",
        code: "INGESTION_FAILED",
        requestId,
      }, { status: 502 });
    }
  }
  return NextResponse.json({
    source: data,
    notice: canonicalUrl ? "The URL is stored as a reference only. It was not fetched; paste permitted source text to make it searchable." : "This metadata-only record is not included in report retrieval.",
    requestId,
  }, { status: 201 });
}
