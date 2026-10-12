import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { isReviewer } from "@/lib/security";
import { SaveClaimSchema } from "@/lib/validation";

export const runtime = "nodejs";

async function sha256(input: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest)).map(v => v.toString(16).padStart(2, "0")).join("");
}

export async function POST(request: Request) {
  if (!isReviewer(request)) return NextResponse.json({ error: "Reviewer authorization required." }, { status: 401 });
  const parsed = SaveClaimSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid source or claim.", details: parsed.error.flatten() }, { status: 400 });
  const { source, extraction } = parsed.data;
  const db = getSupabaseAdmin();

  const { data: sourceRow, error: sourceError } = await db.from("sources").insert({
    title: source.title,
    url: source.url || null,
    publisher: source.publisher || null,
    published_at: source.publishedAt || null,
    source_type: "user_supplied_public_text",
    content_hash: await sha256(source.sourceText),
  }).select("id").single();
  if (sourceError || !sourceRow) {
    console.error("Source insert failed", sourceError?.message);
    return NextResponse.json({ error: "Could not save source record." }, { status: 500 });
  }

  let companyId: string | null = null;
  if (extraction.company_name.trim()) {
    const { data: existing } = await db.from("companies").select("id").ilike("name", extraction.company_name.trim()).limit(1).maybeSingle();
    if (existing) companyId = existing.id;
    else {
      const { data: created, error } = await db.from("companies").insert({
        name: extraction.company_name.trim(),
        parent_company: extraction.parent_company || null,
        industry: extraction.industry || null,
      }).select("id").single();
      if (!error && created) companyId = created.id;
    }
  }

  const { data: claim, error: claimError } = await db.from("evidence_claims").insert({
    company_id: companyId,
    source_id: sourceRow.id,
    claim_type: extraction.signal_type,
    claim_text: extraction.summary || `${extraction.company_name}: ${extraction.signal_type}`,
    evidence_quote: extraction.evidence_quote || null,
    confidence: "unreviewed",
    review_status: "pending",
    extracted_by: "ai",
    uncertainty: extraction.uncertainty || null,
    extracted_payload: extraction,
  }).select("id").single();

  if (claimError || !claim) {
    console.error("Claim insert failed", claimError?.message);
    return NextResponse.json({ error: "Source was saved but claim saving failed. Review server logs before retrying." }, { status: 500 });
  }

  if (extraction.city.trim() && companyId) {
    const { error: locationError } = await db.from("gcc_locations").insert({ company_id: companyId, city: extraction.city.trim(), status: "unverified" });
    if (locationError) console.error("Unverified location insert failed", locationError.message);
  }
  return NextResponse.json({ sourceId: sourceRow.id, claimId: claim.id, review_status: "pending" }, { status: 201 });
}
