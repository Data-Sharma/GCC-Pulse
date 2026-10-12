import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = await getSupabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL("/", requestUrl.origin));
    }
  }

  // Return an error or redirect to sign-in if there's an issue
  return NextResponse.redirect(
    new URL("/sign-in?error=auth_failed", requestUrl.origin)
  );
}
