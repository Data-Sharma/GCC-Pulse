import { NextResponse } from "next/server";
import { ExtractRequestSchema } from "@/lib/validation";
import { extractClaims } from "@/lib/ai/extract";
import { isReviewer } from "@/lib/security";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  if (!isReviewer(request)) {
    return NextResponse.json({ error: "Reviewer authorization required.", requestId }, { status: 401 });
  }
  try {
    const json = await request.json();
    const parsed = ExtractRequestSchema.safeParse(json);
    if (!parsed.success) return NextResponse.json({ error: "Invalid request.", details: parsed.error.flatten(), requestId }, { status: 400 });
    const extraction = await extractClaims(parsed.data.text);
    return NextResponse.json({ extraction, review_status: "pending", requestId });
  } catch (error) {
    console.error("Gemini extraction failed", { requestId, message: error instanceof Error ? error.message : "Unknown" });
    return NextResponse.json({ error: "Extraction failed. Check server logs, model access, and API quota.", requestId }, { status: 502 });
  }
}