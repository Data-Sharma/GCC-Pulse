"use server";

import { redirect } from "next/navigation";
import { getSupabaseServer } from "./supabase/server";

// Safe diagnostic logging (no secrets)
function logAuthEvent(event: string, details?: Record<string, string | number | boolean>) {
  const timestamp = new Date().toISOString();
  console.log(`[AUTH] ${timestamp} ${event}`, details || "");
}

// Helper to provide user-friendly error messages
function formatAuthError(error: { message: string; code?: string | null }): string {
  const message = error.message.toLowerCase();
  
  if (
    error.code === "over_email_send_rate_limit" ||
    message.includes("email rate limit exceeded")
  ) {
    return "Supabase has temporarily limited confirmation email delivery for this project. Please try again later. If this persists, ask the project owner to check Supabase Auth email limits and configure custom SMTP.";
  }

  // Rate limit errors
  if (message.includes("rate limit") || message.includes("too many")) {
    return "Too many attempts. Please wait a few minutes before trying again.";
  }
  
  // Email confirmation errors
  if (message.includes("email not confirmed")) {
    return "Please confirm your email before signing in.";
  }
  
  // Invalid credentials
  if (message.includes("invalid login credentials")) {
    return "Invalid email or password.";
  }
  
  // User already exists
  if (message.includes("user already registered")) {
    return "This email is already registered. Try signing in instead.";
  }
  
  // User not found
  if (message.includes("user not found")) {
    return "No account found with this email. Try creating a new account.";
  }
  
  // Return original message if not recognized
  return error.message;
}

export async function signInWithEmail(email: string, password: string) {
  logAuthEvent("signInWithEmail_start");
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    logAuthEvent("signInWithEmail_error", { errorCode: error.code || "unknown" });
    return { error: formatAuthError(error) };
  }

  logAuthEvent("signInWithEmail_success");
  redirect("/");
}

export async function signUpWithEmail(
  email: string,
  password: string,
  accountType: "personal" | "organization"
) {
  logAuthEvent("signUpWithEmail_start", { accountType });
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        account_type: accountType,
      },
    },
  });

  if (error) {
    logAuthEvent("signUpWithEmail_error", { 
      errorCode: error.code || "unknown",
      errorMsg: error.message.substring(0, 50) // First 50 chars only
    });
    return { error: formatAuthError(error) };
  }

  logAuthEvent("signUpWithEmail_response", { 
    userCreated: !!data.user,
    needsConfirmation: !data.user?.confirmed_at 
  });

  // If email confirmation is required, direct user to check email
  // Otherwise redirect to app
  if (data.user && !data.user.confirmed_at) {
    logAuthEvent("signUpWithEmail_confirmation_required");
    return { 
      success: true, 
      message: "Check your email to confirm your account. The link will expire in 24 hours." 
    };
  }

  logAuthEvent("signUpWithEmail_redirect");
  redirect("/");
}

export async function signOut() {
  logAuthEvent("signOut_start");
  const supabase = await getSupabaseServer();
  const { error } = await supabase.auth.signOut();

  if (error) {
    logAuthEvent("signOut_error", { errorCode: error.code || "unknown" });
    console.error("Supabase sign-out request failed; local session was cleared:", error.message);
  }

  logAuthEvent("signOut_redirect");
  redirect("/");
}

export async function getGoogleAuthUrl(accountType: "personal" | "organization") {
  logAuthEvent("getGoogleAuthUrl_start");
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    logAuthEvent("getGoogleAuthUrl_error");
    return { error: formatAuthError(error) };
  }

  logAuthEvent("getGoogleAuthUrl_success");
  return { url: data?.url };
}
