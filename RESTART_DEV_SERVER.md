# How to Safely Restart the Development Server

## Safe Restart Procedure

### Step 1: Stop Any Running Dev Servers
```powershell
# If the dev server is running in a terminal, press:
Ctrl+C

# Or kill any remaining Node processes:
Get-Process node | Stop-Process -Force
```

### Step 2: Clear Build Cache
```powershell
cd "C:\Users\91620\Gcc-pulse\gcc-pulse"
Remove-Item -Recurse -Force ".next"
```

### Step 3: Start Fresh Dev Server
```powershell
npm run dev
```

You should see output like:
```
▲ Next.js 16.4.0 (Turbopack)
- ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

### Step 4: Visit Homepage
- Open `http://localhost:3000` in your browser
- You should see the landing page (if not signed in) or dashboard (if signed in)
- **Important**: In the server terminal, you should see **one GET request**, not continuous repeated requests

### Expected Behavior After Fix

```
GET / 200 in 85ms
(no more GET / requests unless you refresh the page)
```

### Verification Checklist

- [ ] Dev server started without errors
- [ ] Visiting `http://localhost:3000` loads the page
- [ ] Only **one** GET request appears in the log (not continuous)
- [ ] Page content displays correctly
- [ ] Sign-in link works and navigates to `/sign-in`
- [ ] After signing in, dashboard loads without repeated requests
- [ ] Navigation to other pages works

## If You Still See Repeated Requests

1. **Check browser cache**: Hard refresh with `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)
2. **Check browser DevTools**: Network tab should show only one initial load
3. **Verify Node isn't duplicated**: Run `Get-Process node` — should show only one process
4. **Clear .next folder again**: `Remove-Item -Recurse -Force ".next"`
5. **Restart dev server**: `npm run dev`

## Commands Quick Reference

```powershell
# Navigate to project
cd "C:\Users\91620\Gcc-pulse\gcc-pulse"

# Stop dev server (if running)
Ctrl+C

# Kill lingering Node processes
Get-Process node | Stop-Process -Force

# Clear cache
Remove-Item -Recurse -Force ".next"

# Start dev server
npm run dev

# Type-check without building
npx tsc --noEmit

# Build for production
npm run build

# Start production server
npm run start
```

## What Changed

- **Deleted**: `src/app/page.tsx` (dashboard duplicate)
- **Updated**: `src/app/(landing)/layout.tsx` (removed auth redirect)
- **Updated**: `src/app/(landing)/page.tsx` (made auth-aware)

These changes eliminate the redirect loop that was causing continuous requests to `/`.

## Support

See `HOMEPAGE_REFRESH_FIX.md` for detailed explanation of the fix.
