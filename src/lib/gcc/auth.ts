import "server-only";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function getAuthenticatedGccUser() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    console.error("GCC workspace authentication is unavailable because Supabase URL or publishable key is not configured.");
    return { supabase: null, user: null };
  }
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error("Unable to verify the GCC workspace user.", error.message);
    return { supabase, user: null };
  }
  return { supabase, user: data.user };
}
