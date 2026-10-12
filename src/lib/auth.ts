import "server-only";
import { getSupabaseServer } from "./supabase/server";

export async function getSession() {
  const supabase = await getSupabaseServer();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw new Error(`Unable to read authentication session: ${error.message}`);
  }

  return session;
}

export async function getUser() {
  const session = await getSession();
  if (!session?.user) {
    return null;
  }
  return session.user;
}
