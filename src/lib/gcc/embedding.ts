import "server-only";
import { GoogleGenAI } from "@google/genai";

export const EMBEDDING_DIMENSIONS = 3072;
const DEFAULT_EMBEDDING_MODEL = "gemini-embedding-2";

export function getEmbeddingModel() {
  const configuredDimensions = process.env.GEMINI_EMBEDDING_DIMENSIONS;
  if (configuredDimensions && Number(configuredDimensions) !== EMBEDDING_DIMENSIONS) {
    throw new Error(`The deployed vector column is ${EMBEDDING_DIMENSIONS} dimensions; configured embedding output must match.`);
  }
  return process.env.GEMINI_EMBEDDING_MODEL || DEFAULT_EMBEDDING_MODEL;
}

function prepareText(text: string, task: "document" | "query") {
  return task === "document"
    ? `title: GCC Pulse knowledge source | text: ${text}`
    : `task: search result | query: ${text}`;
}

export async function generateEmbeddings(
  texts: string[],
  task: "document" | "query",
) {
  if (texts.length === 0 || texts.length > 16) {
    throw new Error("Embedding batches must contain between 1 and 16 texts.");
  }
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");

  const model = getEmbeddingModel();
  const client = new GoogleGenAI({ apiKey });
  const response = await client.models.embedContent({
    model,
    contents: texts.map((text) => prepareText(text, task)),
    config: { outputDimensionality: EMBEDDING_DIMENSIONS },
  });
  const vectors = response.embeddings?.map((embedding) => embedding.values ?? []);
  if (!vectors || vectors.length !== texts.length) {
    throw new Error("The embedding provider returned an unexpected number of vectors.");
  }
  for (const vector of vectors) {
    if (vector.length !== EMBEDDING_DIMENSIONS || vector.some((value) => !Number.isFinite(value))) {
      throw new Error("The embedding provider returned a vector with an invalid dimension or value.");
    }
  }
  return { model, vectors };
}
