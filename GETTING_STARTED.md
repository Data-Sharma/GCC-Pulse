# GCC Pulse — Getting Started

Welcome to GCC Pulse, a source-backed intelligence platform for India's Global Capability Centre ecosystem.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment
Copy `.env.local` and verify these variables:
```
NEXT_PUBLIC_SUPABASE_URL=https://nmosltkvwzojtxsexwys.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_jJohtKeaHZHN3yiuiG872g_hiBJFAvu
NEXT_PUBLIC_APP_URL=http://localhost:3000
GEMINI_API_KEY=<your_api_key>
SUPABASE_SERVICE_ROLE_KEY=<your_service_role_key>
```

### 3. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## User Flows

### First-Time Visitor

1. **Landing Page** (`/`): See product overview, features, and CTAs
2. **Sign In** (`/sign-in`): Choose account type and authenticate
3. **Dashboard** (`/`): Access full GCC Pulse workspace

### Returning User

1. **Landing Page** (`/`): Authenticated users skip to dashboard automatically
2. **Dashboard** (`/`): Navigate, explore, review data
3. **Sign Out**: Click "Sign out" in sidebar footer to return to landing page

---

## Authentication

### Email/Password
- Create an account or sign in with email
- Passwords are encrypted and validated server-side
- Session stored securely in cookies

### Google OAuth (Optional)
- Requires configuration (see `LANDING_PAGE_IMPLEMENTATION.md`)
- When enabled, "Continue with Google" redirects to Supabase OAuth flow
- Callback handled at `/auth/callback`

---

## Key Routes

| Route | Purpose | Auth Required |
|-------|---------|---------------|
| `/` | Landing page / Dashboard | No / Yes |
| `/sign-in` | Account type selector & auth | No |
| `/auth/callback` | OAuth callback handler | No |
| `/companies` | GCC Registry | Yes |
| `/cities` | City Intelligence | Yes |
| `/signals` | Expansion Radar | Yes |
| `/providers` | Service Provider Explorer | Yes |
| `/extract` | AI Extraction Tool | Yes |
| `/review` | Claim Review Workspace | Yes |

---

## Features Overview

### GCC Registry
Search and explore 200+ documented Global Capability Centres with:
- Parent organizations
- Indian locations and functions
- Expansion timelines
- Source attribution

### City Intelligence
Compare cities by key metrics:
- Operational costs
- Talent availability
- IT infrastructure
- Government support
- Cost of living
- GCC concentration

### Expansion Radar
Track public announcements and indicators of:
- New GCC entries
- Expansion announcements
- Organizational changes
- Strategic signals

### Service Providers
Explore ecosystem partners:
- IT infrastructure providers
- Consulting firms
- Real estate developers
- Government support agencies

### AI Extraction
Convert source text into structured claims:
- Paste press releases or articles
- AI extracts candidate claims
- Human review for accuracy
- Publish to registry

### Claim Review
Verify and approve claims before adding to registry:
- Review extracted evidence
- Assess confidence levels
- Track source attribution
- Approve or reject claims

---

## Data Integrity

Every claim in GCC Pulse is:
- **Sourced**: Linked to original press releases, articles, announcements
- **Attributed**: Including publication date, publisher, URL
- **Reviewed**: Approved by human reviewers before publication
- **Traceable**: Original source material available for inspection

No paywalls. No proprietary rankings. No unverified claims.

---

## Support

### Documentation
- `LANDING_PAGE_IMPLEMENTATION.md` — Landing page & auth setup details
- `IMPLEMENTATION_SUMMARY.md` — Complete implementation overview
- `AUTHENTICATION_SETUP.md` — Supabase configuration guide
- `ORGANIZATION_SCHEMA_REFERENCE.md` — Database schema reference

### External Resources
- **Supabase**: https://supabase.com/docs
- **Next.js**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs

### Issues
For bugs or questions, check:
1. Supabase dashboard (auth, database, RLS policies)
2. Browser console for client errors
3. Terminal for server errors
4. Documentation files in this repository

---

## Development Tips

### Hot Reload
Changes to files automatically reload in the browser during development.

### TypeScript
Run `npx tsc --noEmit` to check types without building.

### Build Verification
```bash
npm run build    # Production build
npm run start    # Start production server
```

### Database Queries
- Read-only queries work with `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- Write operations require `SUPABASE_SERVICE_ROLE_KEY` (server-only)
- All tables have Row-Level Security (RLS) enabled

---

## Customization

### Colors
Edit CSS variables in `src/app/globals.css`:
```css
:root {
  --page: #f7f8fb;        /* Background */
  --ink: #152033;         /* Text */
  --accent: #2457d6;      /* Primary color */
  --border: #e4e7ec;      /* Borders */
  --surface: #ffffff;     /* Card backgrounds */
}
```

### Logo & Branding
- Logo placeholder: Edit `src/app/(landing)/page.tsx` and `src/components/app-shell.tsx`
- Favicon: Replace `src/app/favicon.ico`
- Site title: Edit metadata in `src/app/layout.tsx`

### Routes & Navigation
- Edit navigation links in `src/components/app-shell.tsx`
- Add new pages in `src/app/` following Next.js App Router conventions

---

## Next Steps

1. **Explore the data**: Sign in and navigate to companies, cities, or signals
2. **Configure OAuth** (optional): Follow `LANDING_PAGE_IMPLEMENTATION.md`
3. **Set up organization features** (future): Add team management and invitations
4. **Deploy**: Build passes; ready for staging or production

---

Enjoy exploring GCC Pulse! For questions, refer to the documentation or Supabase/Next.js guides.
