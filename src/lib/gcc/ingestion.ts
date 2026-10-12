import "server-only";
import { createHash } from "node:crypto";
import type { getSupabaseServer } from "@/lib/supabase/server";
import { generateEmbeddings, getEmbeddingModel } from "@/lib/gcc/embedding";

type SupabaseServer = Awaited<ReturnType<typeof getSupabaseServer>>;
type PipelineStage =
  | "DISCOVER" | "FETCH" | "EXTRACT" | "NORMALIZE" | "DEDUPLICATE"
  | "CHUNK" | "EMBED" | "INDEX" | "VALIDATE" | "COMPLETE";
type TextChunk = {
  chunk_index: number;
  content: string;
  content_hash: string;
  section_heading: string | null;
  char_start: number;
  char_end: number;
  metadata: { parserVersion: string };
};

const PARSER_VERSION = "plain-text-v1";
const CHUNK_SIZE = 1600;
const CHUNK_OVERLAP = 200;
const MAX_CHUNKS = 40;

export class IngestionError extends Error {
  constructor(readonly stage: PipelineStage, message: string) {
    super(message);
    this.name = "IngestionError";
  }
}

function normalizeText(input: string) {
  return input
    .replace(/\u0000/g, "")
    .normalize("NFKC")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[^\S\n]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function headingAt(text: string, offset: number) {
  const precedingLines = text.slice(0, offset).split("\n");
  for (let index = precedingLines.length - 1; index >= 0; index -= 1) {
    const match = precedingLines[index].match(/^#{1,6}\s+(.+)$/);
    if (match) return match[1].trim().slice(0, 300);
  }
  return null;
}

export function chunkPlainText(text: string): TextChunk[] {
  const chunks: TextChunk[] = [];
  let start = 0;
  while (start < text.length && chunks.length < MAX_CHUNKS) {
    let end = Math.min(start + CHUNK_SIZE, text.length);
    if (end < text.length) {
      const boundary = Math.max(
        text.lastIndexOf("\n\n", end),
        text.lastIndexOf(". ", end),
        text.lastIndexOf("; ", end),
        text.lastIndexOf(" ", end),
      );
      if (boundary > start + Math.floor(CHUNK_SIZE * 0.6)) end = boundary + 1;
    }
    const content = text.slice(start, end).trim();
    if (content.length >= 40) {
      chunks.push({
        chunk_index: chunks.length,
        content,
        content_hash: sha256(content),
        section_heading: headingAt(text, start),
        char_start: start,
        char_end: end,
        metadata: { parserVersion: PARSER_VERSION },
      });
    }
    if (end >= text.length) break;
    start = Math.max(start + 1, end - CHUNK_OVERLAP);
    const nextBoundary = text.indexOf("\n", start);
    if (nextBoundary > start && nextBoundary <= start + 100) start = nextBoundary + 1;
  }
  if (text.length > 0 && chunks.length === 0) {
    chunks.push({
      chunk_index: 0,
      content: text,
      content_hash: sha256(text),
      section_heading: headingAt(text, 0),
      char_start: 0,
      char_end: text.length,
      metadata: { parserVersion: PARSER_VERSION },
    });
  }
  return chunks;
}

function assertDb<T>(result: { error: { message: string } | null; data?: T | null }, operation: string) {
  if (result.error) throw new Error(`${operation} failed: ${result.error.message}`);
  return result.data;
}

async function setSourceState(
  supabase: SupabaseServer,
  sourceId: string,
  userId: string,
  values: Record<string, unknown>,
) {
  const result = await supabase.from("gcc_knowledge_sources").update(values)
    .eq("id", sourceId).eq("user_id", userId);
  assertDb(result, "Source ingestion status update");
}

async function setDocumentState(
  supabase: SupabaseServer,
  documentId: string,
  values: Record<string, unknown>,
) {
  const result = await supabase.from("gcc_knowledge_documents").update({
    ...values,
    updated_at: new Date().toISOString(),
  }).eq("id", documentId);
  assertDb(result, "Document ingestion status update");
}

export async function ingestPastedText(
  supabase: SupabaseServer,
  sourceId: string,
  userId: string,
  originalText: string,
) {
  if (originalText.length > 50_000) throw new IngestionError("EXTRACT", "Pasted text must be 50,000 characters or fewer.");
  const normalized = normalizeText(originalText);
  if (normalized.length < 40) throw new IngestionError("EXTRACT", "Provide at least 40 characters of source text to index.");
  const contentHash = sha256(normalized);
  const model = getEmbeddingModel();
  const { data: priorDocument, error: priorError } = await supabase.from("gcc_knowledge_documents")
    .select("id,ingestion_status,embedding_model,chunk_count")
    .eq("source_id", sourceId).eq("content_hash", contentHash).eq("parser_version", PARSER_VERSION)
    .maybeSingle();
  if (priorError) throw new IngestionError("DEDUPLICATE", "Could not check whether this source version was already indexed.");
  if (priorDocument?.ingestion_status === "completed" && priorDocument.embedding_model === model) {
    await setSourceState(supabase, sourceId, userId, {
      content_hash: contentHash,
      ingestion_status: "completed",
      ingestion_stage: "COMPLETE",
      ingestion_error: null,
    });
    return { documentId: priorDocument.id as string, chunkCount: priorDocument.chunk_count as number, alreadyIndexed: true };
  }

  const documentResult = await supabase.from("gcc_knowledge_documents").upsert({
    source_id: sourceId,
    content_hash: contentHash,
    parser_version: PARSER_VERSION,
    original_text: originalText,
    normalized_text: normalized,
    ingestion_status: "processing",
    ingestion_stage: "DISCOVER",
    ingestion_error: null,
    embedding_model: model,
    embedding_dimensions: 3072,
    updated_at: new Date().toISOString(),
  }, { onConflict: "source_id,content_hash,parser_version" })
    .select("id").single();
  const document = assertDb(documentResult, "Document version creation");
  if (!document) throw new IngestionError("DISCOVER", "Could not create a source document version.");
  const documentId = document.id as string;
  const stageRows: { stage: PipelineStage; status: "completed" | "skipped" }[] = [];

  await setSourceState(supabase, sourceId, userId, {
    content_hash: contentHash,
    ingestion_status: "processing",
    ingestion_stage: "DISCOVER",
    ingestion_error: null,
  });

  async function runStage<T>(stage: PipelineStage, action: () => Promise<T> | T) {
    await setDocumentState(supabase, documentId, { ingestion_stage: stage, ingestion_status: "processing", ingestion_error: null });
    await setSourceState(supabase, sourceId, userId, { ingestion_stage: stage, ingestion_status: "processing", ingestion_error: null });
    const startedAt = Date.now();
    const stageInsert = await supabase.from("gcc_ingestion_stage_runs").insert({
      source_id: sourceId,
      document_id: documentId,
      user_id: userId,
      stage,
      status: "running",
    }).select("id").single();
    const stageRun = assertDb(stageInsert, "Ingestion stage record creation");
    if (!stageRun) throw new IngestionError(stage, "Could not record ingestion stage.");
    try {
      const value = await action();
      const completed = await supabase.from("gcc_ingestion_stage_runs").update({
        status: "completed",
        duration_ms: Date.now() - startedAt,
        completed_at: new Date().toISOString(),
      }).eq("id", stageRun.id);
      assertDb(completed, "Ingestion stage completion");
      stageRows.push({ stage, status: "completed" });
      return value;
    } catch (cause) {
      const failed = await supabase.from("gcc_ingestion_stage_runs").update({
        status: "failed",
        error_code: `stage_${stage.toLowerCase()}_failed`,
        duration_ms: Date.now() - startedAt,
        completed_at: new Date().toISOString(),
      }).eq("id", stageRun.id);
      assertDb(failed, "Ingestion stage failure record");
      await setDocumentState(supabase, documentId, {
        ingestion_status: "failed",
        ingestion_error: `stage_${stage.toLowerCase()}_failed`,
      });
      await setSourceState(supabase, sourceId, userId, {
        ingestion_status: "failed",
        ingestion_error: `stage_${stage.toLowerCase()}_failed`,
      });
      throw new IngestionError(stage, cause instanceof Error ? cause.message : "Stage processing failed.");
    }
  }

  await runStage("DISCOVER", () => undefined);
  await runStage("FETCH", () => undefined);
  await runStage("EXTRACT", () => normalized);
  await runStage("NORMALIZE", () => normalized);
  await runStage("DEDUPLICATE", async () => {
    const result = await supabase.from("gcc_knowledge_chunks").delete().eq("document_id", documentId);
    assertDb(result, "Previous chunk cleanup");
    return contentHash;
  });
  const chunks = await runStage("CHUNK", () => chunkPlainText(normalized));
  if (chunks.length === 0) throw new IngestionError("CHUNK", "No indexable text chunks were produced.");
  const vectors = await runStage("EMBED", async () => {
    const embedded: number[][] = [];
    for (let index = 0; index < chunks.length; index += 16) {
      const batch = chunks.slice(index, index + 16);
      const result = await generateEmbeddings(batch.map((chunk) => chunk.content), "document");
      if (result.model !== model) throw new Error("Embedding model changed during this ingestion run.");
      embedded.push(...result.vectors);
    }
    return embedded;
  });
  await runStage("INDEX", async () => {
    const deletion = await supabase.from("gcc_knowledge_chunks").delete().eq("document_id", documentId);
    assertDb(deletion, "Previous chunk cleanup");
    const rows = chunks.map((chunk, index) => ({
      ...chunk,
      source_id: sourceId,
      document_id: documentId,
      embedding: vectors[index],
      embedding_model: model,
    }));
    if (rows.some((row) => !row.embedding)) throw new Error("An embedding was missing for an indexed chunk.");
    const insertion = await supabase.from("gcc_knowledge_chunks").insert(rows);
    assertDb(insertion, "Chunk indexing");
  });
  await runStage("VALIDATE", async () => {
    const result = await supabase.from("gcc_knowledge_chunks")
      .select("id", { count: "exact", head: true }).eq("document_id", documentId);
    assertDb(result, "Indexed chunk validation");
    if (result.count !== chunks.length) throw new Error("The indexed chunk count does not match the prepared document.");
    return result.count;
  });
  await runStage("COMPLETE", async () => {
    await setDocumentState(supabase, documentId, {
      ingestion_status: "completed",
      ingestion_stage: "COMPLETE",
      ingestion_error: null,
      chunk_count: chunks.length,
      embedding_model: model,
      embedding_dimensions: 3072,
    });
    await setSourceState(supabase, sourceId, userId, {
      content_hash: contentHash,
      ingestion_status: "completed",
      ingestion_stage: "COMPLETE",
      ingestion_error: null,
    });
  });

  console.info("GCC source ingestion completed.", {
    sourceId,
    documentId,
    stages: stageRows.length,
    chunkCount: chunks.length,
    embeddingModel: model,
  });
  return { documentId, chunkCount: chunks.length, alreadyIndexed: false };
}
