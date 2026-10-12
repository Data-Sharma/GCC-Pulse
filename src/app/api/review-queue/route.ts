import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { isReviewer } from "@/lib/security";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isReviewer(request)) return NextResponse.json({ error: "Reviewer authorization required." }, { status: 401 });
  const db = getSupabaseAdmin();
  const { data, error } = await db.from("evidence_claims")
    .select("id,claim_text,claim_type,evidence_quote,uncertainty,review_status,created_at,companies(name),sources(title,url,publisher,published_at)")
    .eq("review_status", "pending").order("created_at", { ascending: false }).limit(100);
  if (error) {
    console.error("Review queue query failed", error.message);
    return NextResponse.json({ error: "Could not load the review queue." }, { status: 500 });
  }
  return NextResponse.json({ claims: data ?? [] });
}
