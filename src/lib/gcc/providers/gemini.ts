import "server-only";
import { GoogleGenAI } from "@google/genai";

export const DEFAULT_GEMINI_GENERATION_MODEL = "gemini-2.5-flash";

export async function generateStructuredReport(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");
  const model = process.env.GEMINI_MODEL || DEFAULT_GEMINI_GENERATION_MODEL;
  const client = new GoogleGenAI({ apiKey });
  const response = await client.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      maxOutputTokens: 8192,
      temperature: 0.2,
    },
  });
  if (!response.text) throw new Error("Gemini returned an empty structured response.");
  return {
    content: response.text,
    model,
    provider: "gemini",
    usage: response.usageMetadata
      ? {
          promptTokenCount: response.usageMetadata.promptTokenCount ?? null,
          candidatesTokenCount: response.usageMetadata.candidatesTokenCount ?? null,
          totalTokenCount: response.usageMetadata.totalTokenCount ?? null,
        }
      : null,
  };
}
