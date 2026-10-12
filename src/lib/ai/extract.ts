import "server-only";
import { GoogleGenAI, Type } from "@google/genai";
import { ExtractionSchema, type Extraction } from "@/lib/validation";
import { GCC_EXTRACTION_INSTRUCTIONS } from "@/lib/ai/prompts";

export async function extractClaims(text: string): Promise<Extraction> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is missing.");
  const ai = new GoogleGenAI({ apiKey: key });
  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    contents: `${GCC_EXTRACTION_INSTRUCTIONS}\nSOURCE TEXT:\n${text}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          company_name: { type: Type.STRING },
          parent_company: { type: Type.STRING },
          industry: { type: Type.STRING },
          city: { type: Type.STRING },
          announcement_date: { type: Type.STRING },
          signal_type: { type: Type.STRING, enum: [...(["new_gcc", "expansion", "office", "hiring", "other"])] },
          summary: { type: Type.STRING },
          evidence_quote: { type: Type.STRING },
          uncertainty: { type: Type.STRING },
        },
        required: ["company_name", "parent_company", "industry", "city", "announcement_date", "signal_type", "summary", "evidence_quote", "uncertainty"],
      },
    },
  });
  if (!response.text) throw new Error("Gemini returned an empty response.");
  let candidate: unknown;
  try { candidate = JSON.parse(response.text); } catch { throw new Error("Gemini returned invalid JSON."); }
  const parsed = ExtractionSchema.safeParse(candidate);
  if (!parsed.success) throw new Error("Gemini response failed schema validation.");
  return parsed.data;
}
