import "server-only";
import { z } from "zod";
import type { getSupabaseServer } from "@/lib/supabase/server";
import { EMBEDDING_DIMENSIONS, generateEmbeddings, getEmbeddingModel } from "@/lib/gcc/embedding";
import { type ResearchQuestion } from "@/lib/gcc/research-plan";

type SupabaseServer = Awaited<ReturnType<typeof getSupabaseServer>>;

const RetrievedChunkSchema = z.object({
  chunk_id: z.string().uuid(),
  source_id: z.string().uuid(),
  document_id: z.string().uuid(),
  chunk_text: z.string(),
  section_heading: z.string().nullable(),
  chunk_index: z.number().int().nonnegative(),
  source_title: z.string(),
  publisher: z.string().nullable(),
  canonical_url: z.string().nullable(),
  publication_date: z.string().nullable(),
  retrieved_at: z.string(),
  source_type: z.string(),
  category: z.string(),
  verification_status: z.string(),
  vector_similarity: z.number().nullable(),
  lexical_score: z.number().nullable(),
  fused_score: z.number(),
});

export type RetrievedEvidence = z.infer<typeof RetrievedChunkSchema> & {
  researchQuestionIds: string[];
  retrievalRank: number;
};

export async function retrieveHybridEvidence(
  supabase: SupabaseServer,
  profileId: string,
  questions: ResearchQuestion[],
  resultLimitPerQuestion = 4,
) {
  if (!questions.length) return { evidence: [] as RetrievedEvidence[], embeddingModel: getEmbeddingModel(), durationMs: 0 };
  const startedAt = Date.now();
  const embeddingModel = getEmbeddingModel();
  const { vectors } = await generateEmbeddings(questions.map((question) => question.query), "query");
  const results = await Promise.all(questions.map(async (question, index) => {
    const { data, error } = await supabase.rpc("gcc_hybrid_search", {
      query_embedding: vectors[index],
      query_text: question.query,
      profile_uuid: profileId,
      embedding_model_id: embeddingModel,
      result_limit: resultLimitPerQuestion,
    });
    if (error) throw new Error(`Hybrid retrieval failed for ${question.id}.`);
    const parsed = z.array(RetrievedChunkSchema).safeParse(data);
    if (!parsed.success) throw new Error(`Hybrid retrieval returned invalid chunk metadata for ${question.id}.`);
    return { question, rows: parsed.data };
  }));

  const byChunk = new Map<string, RetrievedEvidence>();
  for (const { question, rows } of results) {
    rows.forEach((row, index) => {
      const existing = byChunk.get(row.chunk_id);
      if (existing) {
        if (!existing.researchQuestionIds.includes(question.id)) existing.researchQuestionIds.push(question.id);
        if (row.fused_score > existing.fused_score) {
          existing.fused_score = row.fused_score;
          existing.vector_similarity = row.vector_similarity;
          existing.lexical_score = row.lexical_score;
          existing.retrievalRank = index + 1;
        }
      } else {
        byChunk.set(row.chunk_id, {
          ...row,
          researchQuestionIds: [question.id],
          retrievalRank: index + 1,
        });
      }
    });
  }
  const evidence = [...byChunk.values()]
    .sort((left, right) => right.fused_score - left.fused_score)
    .slice(0, 24);

  console.info("GCC hybrid retrieval completed.", {
    questionCount: questions.length,
    evidenceCount: evidence.length,
    embeddingDimensions: EMBEDDING_DIMENSIONS,
    embeddingModel,
    durationMs: Date.now() - startedAt,
  });
  return { evidence, embeddingModel, durationMs: Date.now() - startedAt };
}

export async function retrieveForChat(supabase: SupabaseServer, profileId: string, query: string) {
  const question: ResearchQuestion = {
    id: "chat-follow-up",
    topic: "risk",
    rationale: "Retrieve source material relevant to the report-specific follow-up question.",
    query,
    geography: ["India"],
    requiredEvidence: ["directly relevant source material"],
    preferredSourceTypes: ["official", "primary", "reputable secondary"],
    priority: "medium",
  };
  return retrieveHybridEvidence(supabase, profileId, [question], 6);
}
