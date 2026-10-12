import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { isReviewer } from "@/lib/security";
import { ReviewSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isReviewer(request)) return NextResponse.json({ error: "Reviewer authorization required." }, { status: 401 });
  const { id } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json({ error: "Invalid claim ID." }, { status: 400 });
  }
  const parsed = ReviewSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid review action." }, { status: 400 });
  const patch: Record<string, unknown> = { reviewed_at: new Date().toISOString() };
  if (parsed.data.action === "approve") patch.review_status = "approved";
  if (parsed.data.action === "reject") patch.review_status = "rejected";
  if (parsed.data.action === "edit") {
    if (!parsed.data.claimText) return NextResponse.json({ error: "claimText is required for edit." }, { status: 400 });
    patch.claim_text = parsed.data.claimText;
    patch.review_status = "pending";
  }
  const db = getSupabaseAdmin();
  const { data, error } = await db.from("evidence_claims").update(patch).eq("id", id).select("id,claim_text,review_status,reviewed_at").maybeSingle();
  if (error) {
    console.error("Claim review update failed", error.message);
    return NextResponse.json({ error: "Could not update claim." }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: "Claim not found." }, { status: 404 });
  return NextResponse.json({ claim: data });
}
