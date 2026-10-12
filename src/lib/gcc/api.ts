import "server-only";
import { NextResponse } from "next/server";
import type { getSupabaseServer } from "@/lib/supabase/server";

type SupabaseServer = Awaited<ReturnType<typeof getSupabaseServer>>;
export type AiOperation = "report_generation" | "report_chat" | "source_ingestion";

export function createRequestId() {
  return crypto.randomUUID();
}

export async function claimAiRequestSlot(
  supabase: SupabaseServer,
  operation: AiOperation,
): Promise<{ allowed: true; response: null } | { allowed: false; response: NextResponse }> {
  const { data, error } = await supabase.rpc("gcc_claim_ai_request_slot", { operation_name: operation });
  if (error) {
    console.error("GCC AI rate-limit check failed.", { operation, code: error.code });
    return {
      allowed: false,
      response: NextResponse.json(
        { error: "AI service rate limiting is unavailable. Try again shortly.", code: "RATE_LIMIT_UNAVAILABLE" },
        { status: 503 },
      ),
    };
  }
  if (!data) {
    return {
      allowed: false,
      response: NextResponse.json(
        { error: "Request limit reached. Wait a minute before retrying.", code: "RATE_LIMITED" },
        { status: 429, headers: { "Retry-After": "60" } },
      ),
    };
  }
  return { allowed: true, response: null };
}

export function apiFailure(requestId: string, message: string, code: string, status: number) {
  return NextResponse.json({ error: message, code, requestId }, { status });
}
