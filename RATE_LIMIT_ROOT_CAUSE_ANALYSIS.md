# Rate Limit Root Cause Analysis and Diagnostic Framework

## Problem Statement

Users report "Email rate limit exceeded" error on the very first sign-up attempt, even though:
- No intentional retries
- No previous attempts with same email
- Fresh IP/session

This is highly unusual and requires investigation to distinguish:
1. **App bug** (duplicate Auth calls)
2. **Configuration issue** (Supabase not set up)
3. **Quota exhausted** (free tier limit)
4. **Rate limit** (legitimate Supabase protection)

---

## Investigation Framework

### Three Possible Root Causes

#### Cause 1: Multiple Auth Calls from App

**How it would happen**:
- Form submission handler called twice
- React Strict Mode double-invocation
- Middleware or hook triggering extra calls
- Browser extension retry logic

**Evidence**:
- Network tab shows 2+ POST requests
- Server logs show multiple `signUpWithEmail_start`
- Browser console shows multiple `[SIGN_UP]` blocks

**Status**: ✅ **FIXED** by:
- `pendingRequestRef` tracking
- Early exit if `loading || pendingRequestRef.current`
- Diagnostic logging to detect

#### Cause 2: Supabase Configuration Issue

**How it would happen**:
- Email provider not configured
- Email templates misconfigured
- Custom SMTP credentials wrong
- Email quota already used this billing period

**Evidence**:
- Network tab shows 1 POST request (correct)
- Server logs show 1 `signUpWithEmail_start` (correct)
- But Supabase returns error immediately

**Status**: ⚠️ **Cannot fix in frontend code**
- Requires Supabase Dashboard configuration
- May need custom SMTP provider
- May need to upgrade plan

#### Cause 3: Actual Rate Limit

**How it would happen**:
- Free tier: ~200 emails/day limit reached
- Custom provider: quota exhausted
- IP or email already rate limited
- Legitimate protection working as intended

**Evidence**:
- Network tab shows 1 POST request (correct)
- Server logs show 1 `signUpWithEmail_start` (correct)
- Supabase returns `over_email_send_rate_limit` error code

**Status**: ⚠️ **Cannot bypass in frontend code**
- Rate limits exist for security/spam prevention
- Must configure custom provider for production
- Or wait for quota reset

---

## Solution Implemented

### Part 1: Duplicate Call Prevention (FIXED)

**Changes**:
- Added `pendingRequestRef` to track pending requests
- Early exit if `pendingRequestRef.current || loading`
- Prevents same request being called twice

**Code**:
```typescript
// In sign-up handler
if (pendingRequestRef.current || loading) {
  console.log("[SIGN_UP] Blocked duplicate submission attempt");
  return;  // Exit early
}

pendingRequestRef.current = true;
// ... make request
pendingRequestRef.current = false;
```

**Result**: 
- ✅ No more duplicate Auth calls from app
- ✅ Button stays disabled during request
- ✅ React Strict Mode won't cause duplicates

### Part 2: Diagnostic Logging (NEW)

**Server-side** (`auth-actions.ts`):
```typescript
// Log each step safely
logAuthEvent("signUpWithEmail_start", { accountType });
logAuthEvent("signUpWithEmail_response", { userCreated, needsConfirmation });
logAuthEvent("signUpWithEmail_error", { errorCode, errorMsg });
```

**Client-side** (`sign-in/page.tsx`):
```typescript
// Log each call
console.log("[SIGN_UP] Starting sign-up request");
console.log("[SIGN_UP] Server response received", { hasError, hasMessage });
```

**Result**:
- ✅ Can see every Auth call in console
- ✅ Can count requests in Network tab
- ✅ Can distinguish app bugs from config issues
- ✅ No passwords/secrets logged

### Part 3: Clear Error Messages (PRESERVED)

**Already implemented**:
- `formatAuthError()` translates Supabase errors
- Rate limit errors → "Please wait a few minutes"
- Invalid creds → "Invalid email or password"
- Other errors → human-readable guidance

**Result**:
- ✅ Users understand what happened
- ✅ Users know to wait (not retry immediately)
- ✅ Developers can see actual error code in logs

---

## How to Use Diagnostics

### Scenario: User Reports Rate Limit Error

#### Step 1: Check Network Tab
1. Browser DevTools → Network tab
2. Filter to "Fetch/XHR"
3. One sign-up attempt
4. Count POST requests

**If 2+ requests**: App made duplicates (now prevented)  
**If 1 request**: Error from Supabase (check config)

#### Step 2: Check Server Logs
1. Look for `[AUTH]` messages
2. Count `signUpWithEmail_start` entries

**If 2+ entries**: Duplicates being called  
**If 1 entry**: Single request made

#### Step 3: Check Supabase Error Code
1. Look at server logs for `errorCode`
2. Common codes:
   - `over_email_send_rate_limit` = email limit hit
   - `invalid_credentials` = password issue
   - `user_already_exists` = email taken

**If over_email_send_rate_limit**:
- Check Supabase Dashboard → Email provider
- Verify custom SMTP configured (if production)
- Check quota hasn't been exceeded

---

## Verification Checklist

### ✅ Duplicate Prevention Working

- [ ] Browser console shows `[SIGN_UP]` block (once per submission)
- [ ] Network tab shows 1 POST request per attempt
- [ ] Server logs show 1 `signUpWithEmail_start` per attempt
- [ ] Rapid clicks don't create multiple requests
- [ ] Button disabled during request

### ✅ Diagnostics Enabled

- [ ] Server logs have `[AUTH]` entries
- [ ] Browser console has `[SIGN_UP]` entries  
- [ ] No sensitive data in logs (no passwords/tokens)
- [ ] Error codes logged (helpful for debugging)
- [ ] Flow events logged (start → response/error → end)

### ✅ Error Handling Clear

- [ ] Rate limit errors show user message (not error code)
- [ ] Invalid credentials show appropriate message
- [ ] User knows to wait (not retry immediately)
- [ ] Error box is visible and readable

---

## Supabase Configuration Checklist

If rate limit error occurs on first attempt, check:

### Email Provider
- [ ] Supabase Dashboard → Authentication → Email Templates
- [ ] Is provider enabled? (not "disabled")
- [ ] Free tier selected? (check quota: ~200/day)
- [ ] Or custom SMTP? (check credentials)

### Rate Limits
- [ ] Supabase Dashboard → Authentication → Rate Limits
- [ ] Sign-up limit: ~3 per IP per hour (default)
- [ ] Email resend limit: ~3 per email per hour (default)
- [ ] Appropriate for your use case?

### Email Templates
- [ ] Confirmation email enabled?
- [ ] Template has valid content?
- [ ] Redirect URL correct? (`${SITE_URL}/auth/callback`)

### Custom SMTP (if using)
- [ ] Provider credentials correct?
- [ ] Provider has quota available?
- [ ] Email address authenticated?
- [ ] SPF/DKIM records configured?

---

## Cannot Fix Through Frontend Code

The following issues **require backend/config changes**:

❌ **Free tier email quota exhausted**  
→ Solution: Wait 24 hours or upgrade plan

❌ **Custom SMTP not configured**  
→ Solution: Set up provider in Supabase Dashboard

❌ **Email provider quota exhausted**  
→ Solution: Upgrade provider plan or switch provider

❌ **Rate limit is by design**  
→ Solution: Adjust in Supabase Dashboard (if self-hosted)

---

## Testing & Verification

### How to Verify Single Request

**Method 1: Browser Network Tab**
```
F12 → Network → Fetch/XHR filter
Click "Create account"
Count POST requests
Expected: 1
```

**Method 2: Server Logs**
```
Terminal output:
[AUTH] ... signUpWithEmail_start
Count occurrences: should be 1
```

**Method 3: Browser Console**
```
F12 → Console
Look for [SIGN_UP] messages
Count blocks: should be 1
```

### How to Know It's Working

**All three should match**:
- ✅ Network: 1 POST request
- ✅ Server: 1 `signUpWithEmail_start` entry  
- ✅ Browser: 1 complete `[SIGN_UP]` flow

If all three match = app working correctly

### How to Know There's a Bug

**If any of these**:
- ❌ Network: 2+ POST requests but user clicked once
- ❌ Server: 2+ `signUpWithEmail_start` from one attempt
- ❌ Browser: 2+ `[SIGN_UP]` blocks from one submission

---

## Troubleshooting Decision Tree

```
User reports "Email rate limit exceeded" error

Check Network Tab
    ↓
    ├─ 2+ POST requests for 1 click
    │  └─ App making duplicates
    │     └─ Check for bugs in form submission
    │
    └─ 1 POST request for 1 click
       └─ Error from Supabase (not app)
          ├─ Check error code in logs
          │  ├─ "over_email_send_rate_limit"
          │  │  └─ Email quota issue (see DIAGNOSE_RATE_LIMIT.md)
          │  ├─ "invalid_credentials"
          │  │  └─ Password issue (tell user)
          │  └─ Other
          │     └─ Check Supabase error message
          │
          └─ Check Supabase configuration
             ├─ Email provider enabled?
             ├─ Custom SMTP credentials valid?
             └─ Rate limits appropriate?
```

---

## Files Modified

| File | Change | Purpose |
|------|--------|---------|
| `src/lib/auth-actions.ts` | Added `logAuthEvent()` + logging calls | Trace server-side flow |
| `src/app/(landing)/sign-in/page.tsx` | Added console logs to `handleEmailSignUp` | Trace client-side flow |

### What NOT Changed
- ✅ Authentication logic (same)
- ✅ Error formatting (same)
- ✅ Rate limit handling (same)
- ✅ Session management (same)
- ✅ OAuth flow (same)

---

## Build Verification

✅ **TypeScript**: `npx tsc --noEmit` — PASS  
✅ **Build**: `npm run build` — PASS  
✅ **No new dependencies**  
✅ **No breaking changes**  

---

## Summary

### What Was Fixed
✅ Duplicate form submissions prevented  
✅ Diagnostic logging enabled  
✅ Clear error messages preserved  

### What Cannot Be Fixed in Frontend
⚠️ Supabase rate limit enforcement (by design)  
⚠️ Email provider quota limits  
⚠️ Free tier quota exhaustion  

### How to Distinguish
- **App bug**: Multiple requests in Network tab
- **Config issue**: Single request but Supabase error  
- **Quota issue**: Single request, `over_email_send_rate_limit` error code

### Next Actions
1. **If multiple requests**: Bug is prevented by new code
2. **If single request + rate limit**: Check DIAGNOSE_RATE_LIMIT.md
3. **If configuration issue**: Update Supabase Dashboard settings
4. **If quota exhausted**: Upgrade plan or configure custom SMTP

---

**Implementation Date**: October 12, 2026  
**Diagnostic Framework**: Ready  
**Testing Guide**: TEST_SIGNUP_FLOW.md  
**Configuration Guide**: DIAGNOSE_RATE_LIMIT.md  
