"use client";

import { useState, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { signInWithEmail, signUpWithEmail } from "@/lib/auth-actions";

type AccountType = "personal" | "organization";
type AuthMode = "account-type" | "personal" | "organization";

function subscribeToCreateAccountHash(callback: () => void) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}

function isCreateAccountHash() {
  return window.location.hash === "#create-account";
}

// Helper to check if error is a rate limit error
function isRateLimitError(errorMessage: string): boolean {
  const normalizedMessage = errorMessage.toLowerCase();
  return (
    normalizedMessage.includes("rate limit") ||
    normalizedMessage.includes("too many") ||
    normalizedMessage.includes("try again later") ||
    normalizedMessage.includes("otp")
  );
}

function isEmailDeliveryLimitError(errorMessage: string): boolean {
  return errorMessage.toLowerCase().includes("confirmation email delivery");
}

export default function SignInPage() {
  const [mode, setMode] = useState<AuthMode>("account-type");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const createAccountLinkActive = useSyncExternalStore(
    subscribeToCreateAccountHash,
    isCreateAccountHash,
    () => false
  );
  const shouldShowSignUp = isSignUp || createAccountLinkActive;
  
  // Track pending requests to prevent duplicate submissions
  const pendingRequestRef = useRef(false);
  // Track abort controller for potential future cancellation
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleAccountTypeSelect = (type: AccountType) => {
    setMode(type);
    setEmail("");
    setPassword("");
    setError("");
    setMessage("");
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent duplicate submissions
    if (pendingRequestRef.current || loading) {
      return;
    }

    pendingRequestRef.current = true;
    setLoading(true);
    setError("");

    try {
      const result = await signInWithEmail(email, password);
      if (result?.error) {
        const errorMsg = result.error;
        if (isRateLimitError(errorMsg)) {
          setError(
            "Too many sign-in attempts. Please wait a few minutes before trying again."
          );
        } else {
          setError(errorMsg);
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Sign in failed";
      if (isRateLimitError(errorMsg)) {
        setError(
          "Too many sign-in attempts. Please wait a few minutes before trying again."
        );
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
      pendingRequestRef.current = false;
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent duplicate submissions
    if (pendingRequestRef.current || loading) {
      console.log("[SIGN_UP] Blocked duplicate submission attempt");
      return;
    }

    console.log("[SIGN_UP] Starting sign-up request");
    pendingRequestRef.current = true;
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const accountType = mode === "personal" ? "personal" : "organization";
      console.log("[SIGN_UP] Calling signUpWithEmail server action");
      const result = await signUpWithEmail(email, password, accountType);
      console.log("[SIGN_UP] Server response received", { hasError: !!result?.error, hasMessage: !!result?.message });
      
      if (result?.error) {
        const errorMsg = result.error;
        if (isEmailDeliveryLimitError(errorMsg)) {
          setError(errorMsg);
        } else if (isRateLimitError(errorMsg)) {
          setError(
            "Too many sign-up attempts. Please wait a few minutes before trying again."
          );
        } else {
          setError(errorMsg);
        }
      } else if (result?.message) {
        setMessage(result.message);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Sign up failed";
      console.log("[SIGN_UP] Exception caught", { errorMsg: errorMsg.substring(0, 50) });
      if (isRateLimitError(errorMsg)) {
        setError(
          "Too many sign-up attempts. Please wait a few minutes before trying again."
        );
      } else {
        setError(errorMsg);
      }
    } finally {
      console.log("[SIGN_UP] Sign-up request completed");
      setLoading(false);
      pendingRequestRef.current = false;
    }
  };

  const handleGoogleSignIn = async () => {
    // Prevent duplicate submissions
    if (pendingRequestRef.current || loading) {
      return;
    }

    pendingRequestRef.current = true;
    setLoading(true);
    setError("");
    // Note: In production, this would require backend OAuth configuration
    // For now, show a configuration message
    setError(
      "Google OAuth is not yet configured. Please check AUTHENTICATION_SETUP.md for setup instructions."
    );
    setLoading(false);
    pendingRequestRef.current = false;
  };

  const currentMode = mode as AuthMode;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-6 py-4 md:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800">
          <ArrowLeft size={16} />
          Back to home
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center px-6 py-12 md:min-h-[calc(100vh-64px)] md:px-8">
        <div className="w-full max-w-md">
          {/* Account Type Selection */}
          {currentMode === "account-type" && (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight">
                  {shouldShowSignUp ? "Create your GCC Pulse account" : "Sign in to GCC Pulse"}
                </h1>
                <p className="muted mt-2">
                  {shouldShowSignUp ? "Choose a personal or organization account" : "Choose your account type to get started"}
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleAccountTypeSelect("personal")}
                  disabled={loading}
                  className="surface w-full border-2 border-slate-200 p-6 text-left transition hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <p className="font-bold">Personal Account</p>
                  <p className="muted mt-1 text-sm">
                    For individual researchers and professionals
                  </p>
                </button>

                <button
                  onClick={() => handleAccountTypeSelect("organization")}
                  disabled={loading}
                  className="surface w-full border-2 border-slate-200 p-6 text-left transition hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <p className="font-bold">Organization Account</p>
                  <p className="muted mt-1 text-sm">
                    For teams managing GCC strategy
                  </p>
                </button>
              </div>

              <div className="muted mt-8 text-center text-xs">
                <p>
                  GCC Pulse is best used by companies planning or expanding GCC
                  operations in India.
                </p>
              </div>
            </>
          )}

          {/* Personal Account Auth */}
          {(currentMode === "personal" || currentMode === "organization") && (
            <>
              <div className="mb-8">
                <button
                  onClick={() => setMode("account-type")}
                  disabled={loading}
                  className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft size={16} />
                  Change account type
                </button>
                <h1 className="text-2xl font-bold tracking-tight">
                  {currentMode === "personal" ? "Personal" : "Organization"} Account
                </h1>
                <p className="muted mt-2">
                  {shouldShowSignUp ? "Create a new account" : "Sign in to your account"}
                </p>
              </div>

              {/* OAuth Options */}
              <div className="space-y-3">
                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="btn btn-secondary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue with Google
                </button>
              </div>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-slate-500">Or continue with email</span>
                </div>
              </div>

              {/* Email Form */}
              <form
                onSubmit={shouldShowSignUp ? handleEmailSignUp : handleEmailSignIn}
                className="space-y-4"
              >
                <div>
                  <label className="small-label">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    disabled={loading}
                    required
                    className="field disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="small-label">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={loading}
                    required
                    className="field disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <p className="font-semibold">Error</p>
                    <p className="mt-1">{error}</p>
                  </div>
                )}

                {message && (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                    <p className="font-semibold">Success</p>
                    <p className="mt-1">{message}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !email || !password}
                  className="btn btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-busy={loading}
                >
                  {loading ? (
                    <>
                      <span className="inline-block animate-spin mr-2">⏳</span>
                      {shouldShowSignUp ? "Creating account..." : "Signing in..."}
                    </>
                  ) : shouldShowSignUp ? (
                    "Create account"
                  ) : (
                    "Sign in"
                  )}
                </button>
              </form>

              {/* Sign up / Sign in toggle */}
              <div className="muted mt-6 text-center text-sm">
                {shouldShowSignUp ? (
                  <>
                    Already have an account?{" "}
                    <button
                      onClick={() => {
                        if (loading) return;
                        setIsSignUp(false);
                        if (window.location.hash === "#create-account") {
                          window.history.replaceState(null, "", window.location.pathname + window.location.search);
                        }
                        setError("");
                        setMessage("");
                      }}
                      disabled={loading}
                      className="font-semibold text-blue-700 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sign in
                    </button>
                  </>
                ) : (
                  <>
                    Don&apos;t have an account?{" "}
                    <button
                      onClick={() => {
                        if (loading) return;
                        setIsSignUp(true);
                        setError("");
                        setMessage("");
                      }}
                      disabled={loading}
                      className="font-semibold text-blue-700 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Create one
                    </button>
                  </>
                )}
              </div>

              <div className="muted mt-8 text-center text-xs leading-5">
                <p>
                  By signing in, you agree to GCC Pulse&apos;s Terms of Service and
                  Privacy Policy.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
