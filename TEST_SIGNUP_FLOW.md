# Testing Sign-Up Flow with Diagnostic Logging

## Overview

This guide explains how to:
1. Reproduce a single sign-up attempt
2. Monitor for duplicate Auth calls
3. Verify the fix is working
4. Distinguish app bugs from Supabase configuration issues

---

## Prerequisites

- Development server running (`npm run dev`)
- Browser with DevTools (F12)
- A fresh email address (never tried before)
- Terminal visible to see server logs

---

## Test: Single Sign-Up Attempt

### Setup

1. **Start dev server**
   ```powershell
   cd "C:\Users\91620\Gcc-pulse\gcc-pulse"
   npm run dev
   ```

2. **Open browser DevTools**
   - Press F12
   - Go to **Console** tab
   - Go to **Network** tab

3. **Keep terminal visible**
   - Resize window so terminal is visible on side
   - Watch for `[AUTH]` log messages

### Execution

1. **Navigate to sign-in page**
   ```
   http://localhost:3000/sign-in
   ```

2. **Select account type**
   - Click "Personal Account"

3. **Fill form**
   - Email: `testuser-1@example.com` (use unique email)
   - Password: `TestPassword123!` (any 8+ char password)

4. **Open Network monitor**
   - DevTools → Network tab
   - Filter to "Fetch/XHR" only
   - Clear any previous requests (button: trash icon)

5. **Submit form**
   - Click "Create account" button
   - Watch all three monitoring points:
     - Network tab (request count)
     - Browser console (client logs)
     - Server terminal (server logs)

### Observation Points

#### Point 1: Network Tab

**What to look for**: Count network requests

```
Expected:
  POST http://localhost:3000 [or similar] - 1 request

Problem:
  Same request listed 2+ times
  Multiple POST requests
```

**How to count**:
- Network tab should show 1 new POST request
- Click the request to see details
- Response should contain auth response (success or error)

#### Point 2: Browser Console

**What to look for**: `[SIGN_UP]` messages

```
Expected logs:
[SIGN_UP] Starting sign-up request
[SIGN_UP] Calling signUpWithEmail server action
[SIGN_UP] Server response received {hasError: false, hasMessage: true}
[SIGN_UP] Sign-up request completed

Problem:
Multiple blocks of these messages = duplicate calls
```

#### Point 3: Server Terminal

**What to look for**: `[AUTH]` messages

```
Expected logs:
[AUTH] 2024-10-12T... signUpWithEmail_start { accountType: "personal" }
[AUTH] 2024-10-12T... signUpWithEmail_response { userCreated: true, needsConfirmation: true }
[AUTH] 2024-10-12T... signUpWithEmail_confirmation_required

Problem:
Multiple "signUpWithEmail_start" entries = multiple calls
```

---

## Expected Outcomes

### Successful Sign-Up

**Indicators:**
- ✅ Exactly 1 network request
- ✅ Browser console shows one complete flow
- ✅ Server logs show one `signUpWithEmail_start`
- ✅ Success message: "Check your email to confirm your account..."
- ✅ Green success box visible

**Server Logs**:
```
[AUTH] 2024-10-12T14:30:45.123Z signUpWithEmail_start { accountType: "personal" }
[AUTH] 2024-10-12T14:30:46.456Z signUpWithEmail_response { userCreated: true, needsConfirmation: true }
[AUTH] 2024-10-12T14:30:46.457Z signUpWithEmail_confirmation_required
```

### Rate Limit Error (First Attempt)

**Indicates**: Supabase quota issue (not app bug)

**Indicators:**
- ✅ Exactly 1 network request
- ✅ Browser console shows one complete flow
- ✅ Server logs show one `signUpWithEmail_error`
- ❌ Error message: "Too many sign-up attempts..."
- ✅ Red error box visible

**What this means**:
- App is working correctly (single request)
- Supabase rejected it (rate limited)
- Not a duplicate submission bug

**Server Logs**:
```
[AUTH] 2024-10-12T14:30:45.123Z signUpWithEmail_start { accountType: "personal" }
[AUTH] 2024-10-12T14:30:46.456Z signUpWithEmail_error { errorCode: "over_email_send_rate_limit", errorMsg: "Email rate limit exceeded" }
```

**Solutions**:
- Use different email address
- Wait before retrying
- Check Supabase configuration (see DIAGNOSE_RATE_LIMIT.md)

### Invalid Credentials Error

**Indicators:**
- ✅ Exactly 1 network request
- ✅ Browser shows one flow
- ❌ Error message: "Invalid email or password" (or similar)
- ✅ Red error box visible

**What this means**:
- Password too short, or email invalid
- Try with stronger password (8+ chars, uppercase + number)

### User Already Exists

**Indicators:**
- ✅ Exactly 1 network request
- ❌ Error message: "This email is already registered. Try signing in instead."
- ✅ Red error box visible

**What this means**:
- Email already has account
- Use different email or sign in instead

---

## Test: Verify Duplicate Prevention

### Setup (Same as above)

### Execution

1. **Navigate to sign-in, select Personal Account**

2. **Fill form with test email**
   - Email: `testuser-2@example.com`
   - Password: `TestPassword123!`

3. **Network tab ready** (cleared, filtered to Fetch/XHR)

4. **Rapid click prevention test**
   - Click "Create account" button once
   - **While loading**, try to click again
   - Expected: Button stays disabled, no additional requests

**What to verify**:
- ✅ Button is disabled (visually greyed out)
- ✅ Button shows "Creating account..." with spinner
- ✅ Only 1 network request made
- ✅ Cannot click multiple times during loading

---

## Test: Check for Duplicate Calls in Logs

### After sign-up attempt (success or error)

**Search server logs** for `signUpWithEmail_start`:
```bash
# In terminal, look for lines like:
[AUTH] ... signUpWithEmail_start
[AUTH] ... signUpWithEmail_start

# Count how many times it appears
# Expected: 1
# Problem: 2+ (indicates duplicate calls)
```

**Search browser console** for `[SIGN_UP]`:
```javascript
// Should see:
[SIGN_UP] Starting sign-up request
(appears exactly once per form submission)
```

---

## Comparison: Before vs After Fix

### Before (Unfixed Version)

**With duplicate submission bug**:
- Click button → Network tab shows 2+ requests
- Console shows `[SIGN_UP]` block multiple times
- Server shows multiple `signUpWithEmail_start` logs
- Confusing: user sees error, unclear if it's their fault

### After (Fixed Version with Diagnostics)

**With duplicate prevention**:
- Click button → Network tab shows exactly 1 request
- Console shows `[SIGN_UP]` block once
- Server shows exactly 1 `signUpWithEmail_start` log
- Clear: if error occurs, it's from Supabase (not app)

---

## Troubleshooting

### Issue: Can't See Logs

**Console logs not appearing?**
1. Press F12 again to refresh
2. Make sure Console tab is selected
3. Scroll up in console (logs may be above)
4. Check for red X (error icon) at top of console

**Server logs not appearing?**
1. Check terminal is visible
2. Dev server should show "ready" message
3. Make sure you're running `npm run dev` (not build)
4. Restart dev server if needed

### Issue: Multiple Requests in Network Tab

**If you see 2+ POST requests**:
1. This is now prevented by the code
2. But you might see other requests (CSS, JS, etc.)
3. Filter to "Fetch/XHR" only
4. Look for "POST" method specifically
5. Count POST requests, not all requests

### Issue: Don't Know If Email Worked

**Check email**:
1. Look in inbox (not spam)
2. Wait 2-3 minutes for delivery
3. If not arrived:
   - Check Supabase email configuration
   - Verify provider has quota
   - Try different email address

---

## Sign-Up Success Verification

### After receiving confirmation email:

1. **Open confirmation email**
2. **Click confirmation link**
   - Link should say "Confirm your email" or similar
   - Should redirect to app

3. **Sign in with confirmed email**
   - Go to `/sign-in`
   - Click "Already have an account?" / "Sign in"
   - Enter email and password
   - Should successfully sign in
   - Should be redirected to dashboard

---

## Logging Output Reference

### Successful Sign-Up Flow

**Browser Console**:
```
[SIGN_UP] Starting sign-up request
[SIGN_UP] Calling signUpWithEmail server action
[SIGN_UP] Server response received {hasError: false, hasMessage: true}
[SIGN_UP] Sign-up request completed
```

**Server Console**:
```
[AUTH] 2024-10-12T14:30:45.123Z signUpWithEmail_start { accountType: "personal" }
[AUTH] 2024-10-12T14:30:46.456Z signUpWithEmail_response { userCreated: true, needsConfirmation: true }
[AUTH] 2024-10-12T14:30:46.457Z signUpWithEmail_confirmation_required
```

### Rate Limited (Supabase Error)

**Browser Console**:
```
[SIGN_UP] Starting sign-up request
[SIGN_UP] Calling signUpWithEmail server action
[SIGN_UP] Server response received {hasError: true, hasMessage: false}
[SIGN_UP] Sign-up request completed
```

**Server Console**:
```
[AUTH] 2024-10-12T14:30:45.123Z signUpWithEmail_start { accountType: "personal" }
[AUTH] 2024-10-12T14:30:46.456Z signUpWithEmail_error { errorCode: "over_email_send_rate_limit", errorMsg: "Email rate limit exceeded" }
```

### Duplicate Call Blocked

**Browser Console**:
```
[SIGN_UP] Starting sign-up request
[SIGN_UP] Calling signUpWithEmail server action
[SIGN_UP] Server response received {hasError: false, hasMessage: true}
[SIGN_UP] Sign-up request completed
[SIGN_UP] Blocked duplicate submission attempt
[SIGN_UP] Blocked duplicate submission attempt
```

**Server Console**:
```
[AUTH] 2024-10-12T14:30:45.123Z signUpWithEmail_start { accountType: "personal" }
[AUTH] 2024-10-12T14:30:46.456Z signUpWithEmail_response { userCreated: true, needsConfirmation: true }
[AUTH] 2024-10-12T14:30:46.457Z signUpWithEmail_confirmation_required
(no duplicate entries)
```

---

## Quick Verification Checklist

After one sign-up attempt:

- [ ] Network tab: Exactly 1 POST request
- [ ] Browser console: One `[SIGN_UP]` flow (4 lines)
- [ ] Server logs: One `signUpWithEmail_start`
- [ ] Clear success or error message displayed
- [ ] Button returned to normal state
- [ ] Can submit form again

---

## Next Steps

### If All Diagnostics Look Good

✅ App is working correctly  
✅ No duplicate calls  
✅ Single request per submission  

**If you get rate limit error**:
1. See DIAGNOSE_RATE_LIMIT.md
2. Check Supabase configuration
3. Verify email provider has quota
4. Consider custom SMTP for production

### If You Find Problems

- Note exact logs shown
- Check if multiple `signUpWithEmail_start` entries
- File issue with logs attached
- Include Network tab screenshot

---

**Test Date**: [Your Date]  
**Status**: ✅ Diagnostic logging enabled  
**How to Use**: Follow steps above for any sign-up test  
