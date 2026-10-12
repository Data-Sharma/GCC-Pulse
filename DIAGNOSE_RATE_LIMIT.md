# Diagnosing Email Rate Limit Issues

## Problem Statement

Users see "Email rate limit exceeded" error even on the very first sign-up attempt, before any intentional retries.

This suggests one of three possible causes:
1. **Multiple Auth calls** — Sign-up called more than once per submission (now logged)
2. **Supabase Free Plan Limits** — Free tier has very restrictive email quotas
3. **Email Provider Configuration** — Custom SMTP not configured or quota exhausted

## How to Diagnose

### Step 1: Monitor Network Requests

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Filter to "Fetch/XHR" 
4. Go to `http://localhost:3000/sign-in`
5. Fill form with **NEW email address** (never tried before)
6. Click "Create account"
7. **Count the requests to `/` or `_next/rsc/`** (server action calls)

**Expected**: Exactly 1 request  
**Problem**: 2+ requests = duplicate sign-up calls (now prevented by code)

### Step 2: Check Server Logs

1. Look at terminal where dev server is running
2. Search for logs starting with `[AUTH]`
3. Should see:
   ```
   [AUTH] 2024-10-12T... signUpWithEmail_start { accountType: "personal" }
   [AUTH] 2024-10-12T... signUpWithEmail_response { userCreated: true, needsConfirmation: true }
   ```

**Expected Flow**:
- `signUpWithEmail_start` (once)
- `signUpWithEmail_response` (once)
- `signUpWithEmail_confirmation_required` (once)

**Problem**: Multiple start events = multiple calls

### Step 3: Check Browser Console

1. Open DevTools Console tab
2. Filter to show all `[SIGN_UP]` messages
3. Should see:
   ```
   [SIGN_UP] Starting sign-up request
   [SIGN_UP] Calling signUpWithEmail server action
   [SIGN_UP] Server response received {hasError: false, hasMessage: true}
   [SIGN_UP] Sign-up request completed
   ```

**Expected**: One block per submission  
**Problem**: Multiple blocks = multiple submissions

---

## Understanding the Error

### "Email rate limit exceeded"

This error comes from Supabase, NOT from your frontend code. It means:

**Either:**
1. Supabase free tier email quota exhausted for the day/hour
2. Same email tried 3+ times in short period
3. Custom email provider (SMTP) quota exhausted
4. Email provider not configured at all

### How Supabase Email Works

```
Sign-Up Request
  ↓
Supabase creates user
  ↓
Supabase sends confirmation email (via provider)
  ↓
Email provider's quota consumed
  ↓
If quota exceeded: "Email rate limit exceeded" error
```

---

## Supabase Configuration to Check

### 1. Email Provider (Critical)

**Where**: Supabase Dashboard → Authentication → Email Templates

**Check:**
- [ ] Email provider is configured (not "disabled")
- [ ] If using free tier: default Supabase sender
- [ ] If using custom: SMTP credentials configured correctly

**Free Tier Limits:**
- ~100-200 emails per day
- Rate limited per IP

**Custom SMTP:**
- Configure your own provider (Gmail, SendGrid, Mailgun, etc.)
- Separate quota from free tier
- More reliable for production

### 2. Rate Limits

**Where**: Supabase Dashboard → Authentication → Rate Limits

**Check:**
- [ ] Sign-up rate limit (default: ~3 per IP per hour)
- [ ] Email confirmation resend limit (default: ~3 per email per hour)
- [ ] Consider adjusting if needed

**Default Settings:**
```
Sign Up: 3 attempts per IP per hour
Email Confirmation Resend: 3 per email per hour
Sign In: 5 attempts per IP per hour
```

### 3. Email Confirmation

**Where**: Supabase Dashboard → Authentication → Email Templates → Confirmation Email

**Check:**
- [ ] Email template enabled
- [ ] Email template has valid content
- [ ] Redirect URL correct (`${SITE_URL}/auth/callback`)

---

## Common Scenarios

### Scenario 1: Free Plan Exhausted

**Symptoms**:
- First sign-up works
- Second+ attempts fail with "rate limit"
- Even from different IPs

**Cause**: Free tier ~200 emails/day exhausted

**Solution**:
- Wait 24 hours (limit resets)
- **OR** configure custom SMTP provider (recommended)

### Scenario 2: Same Email Retried

**Symptoms**:
- First attempt: works
- Retry with same email: "rate limit"

**Cause**: Supabase limits confirmation emails per email

**Solution**:
- Use different test email
- User should check spam folder before retrying
- Don't retry same email <1 hour

### Scenario 3: Rate Limited Per IP

**Symptoms**:
- First attempt fails
- Even with new email

**Cause**: IP rate limited (too many sign-ups from this IP)

**Solution**:
- Wait 1 hour
- Try from different network
- Adjust rate limits if self-hosted

### Scenario 4: Custom SMTP Quota

**Symptoms**:
- All attempts fail
- Even first one

**Cause**: SMTP provider quota exhausted (e.g., SendGrid free: 100/day)

**Solution**:
- Check provider (Gmail, SendGrid, etc.)
- Upgrade provider plan
- Or switch to different provider

---

## Testing Email Sign-Up

### Safe Testing Steps

1. **Use unique test emails**: 
   - First attempt: `test1@example.com`
   - Second attempt: `test2@example.com`
   - Never retry same email immediately

2. **Monitor logs**:
   - Terminal: Look for `[AUTH]` logs
   - Browser: Check `[SIGN_UP]` messages
   - Network tab: Count requests

3. **Check confirmation email**:
   - Email should arrive within 1-2 minutes
   - Check spam folder
   - Click confirmation link
   - Login with confirmed account

4. **Verify no duplicate calls**:
   - Should see exactly 1 network request
   - Should see exactly 1 server action log
   - No multiple `signUpWithEmail_start` entries

---

## Production Configuration

### Recommended Setup

1. **Use Custom SMTP Provider**
   ```
   Gmail: Free, 500/day limit
   SendGrid: $20/month, 100K/month
   Mailgun: Free tier, good for testing
   AWS SES: Pay per email, very cheap
   ```

2. **Configure in Supabase**
   ```
   Dashboard → Authentication → Email Templates
   → Click "Email" provider
   → Enable custom SMTP
   → Enter credentials
   ```

3. **Set Rate Limits**
   ```
   Sign Up: 5-10 per IP per hour
   Email Resend: 3 per email per 24 hours
   Sign In: 10 per IP per hour
   ```

4. **Enable Email Confirmation**
   ```
   Dashboard → Authentication → Email Templates
   → Enable Confirmation Email
   → Verify template content
   ```

---

## Troubleshooting Flowchart

```
Sign-up fails with "rate limit"
    ↓
Check browser network tab
    ↓
    ├─ Multiple requests (2+)
    │  └─ This is now prevented by duplicate detection
    │  └─ Check [SIGN_UP] logs
    │
    └─ Single request (1)
       └─ Error from Supabase (not app)
       ├─ Check Supabase email provider configured?
       │  ├─ No → Configure custom SMTP
       │  └─ Yes → Check quota
       ├─ Free tier quota exhausted?
       │  ├─ Yes → Wait 24 hours or upgrade
       │  └─ No → Continue
       └─ Custom SMTP quota exhausted?
          ├─ Yes → Check provider account
          └─ No → Check rate limit settings
```

---

## Verifying the Fix

### Before Fix (Without Diagnostics)
- No way to know if multiple calls happening
- No server logs visible
- Confusing error messages
- Hard to debug

### After Fix (With Diagnostics)
- Console logs show each call: `[AUTH] signUpWithEmail_start`
- Browser logs show form submission: `[SIGN_UP]`
- Network tab shows request count
- Can distinguish:
  - Multiple calls (app bug)
  - Rate limit (Supabase config)
  - Other errors (account exists, etc.)

---

## Next Steps

### If Single Request But Still Rate Limited

This means **Supabase is rejecting the request**, not your code.

**Actions**:
1. Check Supabase email provider in dashboard
2. Verify custom SMTP configured (if using)
3. Check rate limit settings
4. Check email quota
5. Consider upgrading plan or switching provider

### If Multiple Requests

This means **duplicate calls were happening**:

**Status**: Now prevented by:
- `pendingRequestRef` tracking
- Button disabled during request
- Console logging for debugging

---

## Debugging Commands

### View Server Logs (Terminal)
```bash
grep "\[AUTH\]" output.log  # See all auth events
grep "signUpWithEmail" output.log  # Just sign-ups
```

### View Browser Logs (Console)
```javascript
// In DevTools console:
console.log("Checking for duplicate calls...");
// Should see [SIGN_UP] and [AUTH] messages
```

### Monitor Network (DevTools)
```
F12 → Network → Filter: "Fetch/XHR"
Click sign-up button
Count POST requests to "/" or "_next/rsc"
Should be exactly 1
```

---

## Cannot Fix Through Frontend Code

The following issues **cannot be fixed in frontend**:

❌ Supabase free tier email quota exhausted  
❌ Email provider (SMTP) quota exhausted  
❌ Rate limit is Supabase default  
❌ Custom SMTP not configured  
❌ Email provider not working  

These require:
- Configuring custom SMTP provider
- Upgrading Supabase plan
- Adjusting rate limits (if self-hosted)
- Checking provider credentials

---

**Diagnostic Tools Ready**: Logging enabled in v1.1  
**Version**: October 12, 2026  
