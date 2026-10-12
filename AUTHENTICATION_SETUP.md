# Authentication Setup Guide

This document explains how to complete the authentication setup for GCC Pulse.

## Current Status

The GCC Pulse application now includes:

- ✅ Landing page with hero, capabilities showcase, and CTAs
- ✅ Sign-in page with account type selection (Personal / Organization)
- ✅ Authentication method selection (Google OAuth / Email)
- ✅ Server-side session validation
- ✅ Protected routes that require authentication
- ✅ Reference schema for organization management

## What Still Requires Setup

The following steps must be completed manually in your Supabase dashboard:

### 1. Enable Email Authentication

1. Log in to [Supabase Dashboard](https://supabase.io)
2. Select your GCC Pulse project
3. Navigate to **Authentication** → **Providers**
4. Enable the **Email** provider
5. Configure email templates (optional but recommended):
   - Go to **Authentication** → **Email Templates**
   - Customize confirmation, password reset, and magic link emails

### 2. Enable Google OAuth (Optional)

To allow "Continue with Google" functionality:

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Find **Google** and enable it
3. You'll need Google OAuth credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing
   - Enable the **Google+ API**
   - Create OAuth 2.0 credentials (Authorized Redirect URIs)
   - Set redirect URI to: `https://[YOUR-PROJECT].supabase.co/auth/v1/callback`
4. Copy the **Client ID** and **Client Secret**
5. Paste these into the Supabase Google provider settings
6. Save and enable

### 3. Configure Redirect URLs

In Supabase Dashboard:

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL**: `http://localhost:3000` (for development)
3. Add **Redirect URLs**:
   - `http://localhost:3000/callback`
   - `http://localhost:3000/`
   - `http://localhost:3000/companies` (or other app routes)
4. For production, update these with your production domain

### 4. Implement OAuth Callback Handling (Optional)

If you enable OAuth, you may want to create a callback page to handle redirects:

```typescript
// src/app/callback/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase/browser";

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = getBrowserSupabase();
      
      // Exchange code for session
      const { error } = await supabase.auth.exchangeCodeForSession(
        new URL(window.location.href).searchParams.get("code") || ""
      );

      if (error) {
        console.error("Auth error:", error);
        router.push("/sign-in");
      } else {
        // Redirect to dashboard
        router.push("/");
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-slate-600">Completing sign-in...</p>
    </div>
  );
}
```

### 5. Add Organization Schema (Optional)

To support organization/workspace features:

1. Go to Supabase Dashboard → **SQL Editor**
2. Copy the SQL from `ORGANIZATION_SCHEMA_REFERENCE.md`
3. Run the schema creation query
4. Verify all tables and policies are created

## Testing Authentication

After setup, test the following scenarios:

### Email Authentication
```bash
1. Go to http://localhost:3000
2. Click "Explore GCC Intelligence"
3. Select "Personal Account"
4. Click "Continue with Email"
5. (After setup) Enter your email and proceed
```

### Google OAuth
```bash
1. Go to http://localhost:3000
2. Click "Explore GCC Intelligence"
3. Select "Personal Account"
4. Click "Continue with Google"
5. (After setup) Sign in with Google
```

### Protected Routes
```bash
1. Try accessing http://localhost:3000/companies without authentication
2. Should redirect to http://localhost:3000/sign-in
3. After signing in, should access dashboard
```

## Environment Variables

Ensure these are set in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

These should already be set from your Supabase project creation.

## Backend Implementation

When you're ready to implement full authentication, you'll need to:

1. **Auth State Management**: Use Supabase's `auth.onAuthStateChange()` to persist session
2. **Sign-In Form**: Replace placeholder UI with actual auth forms
3. **Sign-Out**: Add sign-out button to app shell
4. **Session Validation**: Validate sessions server-side before accessing protected data
5. **Organization Access**: Implement organization membership checks

Reference files for future implementation:

- `src/lib/auth.ts` - Server-side session management
- `src/app/(landing)/layout.tsx` - Landing page layout
- `src/app/layout.tsx` - Protected app layout with auth check

## Security Considerations

1. **Never expose service role key** in client-side code
2. **Always validate redirects** to prevent open redirects
3. **Use RLS policies** to prevent unauthorized data access
4. **Validate membership** server-side before granting organization access
5. **Regenerate sessions** after privilege changes
6. **Use HTTPS** in production

## Troubleshooting

**Issue**: "Supabase configuration is missing"
- Check `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

**Issue**: Google OAuth redirect fails
- Verify redirect URI in Supabase matches your app domain
- Check Google OAuth credentials are valid

**Issue**: Users can access protected routes without auth
- Implement RLS policies in Supabase
- Verify auth session validation in layouts

**Issue**: Sessions not persisting
- Ensure cookies are enabled in browser
- Check browser console for auth errors
- Verify session storage configuration

## Next Steps

1. Complete the Supabase setup steps above
2. Test authentication flows locally
3. Implement organization membership checks
4. Add sign-out functionality
5. Deploy to production with updated redirect URLs
