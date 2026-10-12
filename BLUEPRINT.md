# GCC-Pulse Repository Blueprint

## 📋 Document Overview
This blueprint provides a complete visual and structural reference for the GCC-Pulse codebase. It includes directory trees, file relationships, data flows, and implementation patterns.

---

## 🏗️ Repository Structure

```
gcc-pulse/
├── 📁 src/                          # Source code root
│   ├── 📁 app/                      # Next.js App Router (routes + pages)
│   │   ├── 📁 (landing)/            # Public landing page (grouped route)
│   │   │   ├── layout.tsx           # Landing layout (no app shell)
│   │   │   └── 📁 sign-in/
│   │   │       └── page.tsx         # Sign up/sign in page
│   │   │
│   │   ├── 📁 api/                  # REST API endpoints
│   │   │   ├── 📁 extract/
│   │   │   │   └── route.ts         # POST /api/extract (AI extraction)
│   │   │   ├── 📁 claims/
│   │   │   │   ├── route.ts         # POST /api/claims (save source + claim)
│   │   │   │   └── 📁 [id]/
│   │   │   │       └── route.ts     # PATCH /api/claims/[id] (review action)
│   │   │   └── 📁 review-queue/
│   │   │       └── route.ts         # GET /api/review-queue (pending claims)
│   │   │
│   │   ├── 📁 auth/                 # OAuth handlers
│   │   │   └── 📁 callback/
│   │   │       └── route.ts         # GET /auth/callback (OAuth redirect)
│   │   │
│   │   ├── 📁 cities/               # Feature: City Intelligence
│   │   │   └── page.tsx             # City metrics & comparison
│   │   │
│   │   ├── 📁 companies/            # Feature: GCC Registry
│   │   │   ├── page.tsx             # Company list & search
│   │   │   └── 📁 [id]/
│   │   │       └── page.tsx         # Company detail view
│   │   │
│   │   ├── 📁 extract/              # Feature: AI Extraction
│   │   │   └── page.tsx             # User-facing extraction form
│   │   │
│   │   ├── 📁 review/               # Feature: Claim Review
│   │   │   └── page.tsx             # Review queue interface
│   │   │
│   │   ├── 📁 signals/              # Feature: Expansion Radar
│   │   │   └── page.tsx             # Expansion signals & announcements
│   │   │
│   │   ├── 📁 providers/            # Feature: Provider Directory
│   │   │   └── page.tsx             # Ecosystem service providers
│   │   │
│   │   ├── 📁 supabase/             # Database schema
│   │   │   ├── schema.sql           # Table definitions & RLS policies
│   │   │   └── seed.example.sql     # Example seed data
│   │   │
│   │   ├── 📁 project-docs/         # Internal documentation
│   │   │   ├── BACKEND_BLUEPRINT.md
│   │   │   ├── BACKEND_IMPLEMENTATION_AGENT_PROMPT.md
│   │   │   ├── FRONTEND_BLUEPRINT.md
│   │   │   ├── FRONTEND_IDE_AGENT_PROMPT.md
│   │   │   ├── GCC_Pulse_Backend_Codebase_Extracted.md
│   │   │   └── GCC_Pulse_Frontend_Full_Codebase.md
│   │   │
│   │   ├── layout.tsx               # Root layout (auth guard + app shell)
│   │   ├── page.tsx                 # Home page (landing or dashboard)
│   │   ├── error.tsx                # Error boundary
│   │   ├── loading.tsx              # Loading skeleton
│   │   ├── not-found.tsx            # 404 page
│   │   └── globals.css              # Global styles (Tailwind)
│   │
│   ├── 📁 components/               # Reusable React components
│   │   ├── app-shell.tsx            # Main layout wrapper + sidebar navigation
│   │   ├── dashboard-overview.tsx   # Home dashboard view
│   │   ├── public-landing.tsx       # Landing page for unauthenticated users
│   │   ├── landing-header.tsx       # Landing page header
│   │   ├── page-heading.tsx         # Page title + description helper
│   │   ├── status-badge.tsx         # Status indicator component
│   │   ├── notice.tsx               # Alert/notice component
│   │   ├── empty-state.tsx          # Empty results placeholder
│   │   └── 📁 landing/
│   │       ├── sections.tsx         # Landing page sections (hero, features)
│   │       ├── reveal.tsx           # Animation/reveal components
│   │       └── demo.tsx             # Demo section
│   │
│   ├── 📁 lib/                      # Business logic & utilities
│   │   ├── auth.ts                  # Session & user helpers (server-only)
│   │   ├── auth-actions.ts          # Server actions: signIn, signUp, signOut, OAuth
│   │   ├── security.ts              # Reviewer token validation & auth checks
│   │   ├── data.ts                  # Server-side data fetching (companies, cities, metrics, etc.)
│   │   ├── validation.ts            # Zod schemas for all API requests/responses
│   │   │
│   │   ├── 📁 ai/
│   │   │   ├── extract.ts           # Gemini API integration for claim extraction
│   │   │   └── prompts.ts           # AI system prompts & instructions
│   │   │
│   │   └── 📁 supabase/
│   │       ├── server.ts            # Supabase server-side clients (session + admin)
│   │       └── browser.ts           # Supabase browser-side client (if needed)
│   │
│   └── middleware.ts                # Next.js middleware (optional routing logic)
│
├── 📁 public/                       # Static assets
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
├── 📄 Configuration Files
│   ├── package.json                 # Dependencies & npm scripts
│   ├── package-lock.json
│   ├── next.config.ts               # Next.js configuration (Turbopack, CSS)
│   ├── tsconfig.json                # TypeScript compiler options
│   ├── tailwind.config.ts           # Tailwind CSS configuration
│   ├── eslint.config.mjs            # ESLint rules
│   └── .env.local                   # Environment variables (secrets)
│
├── 📄 Documentation Files
│   ├── README.md                    # Basic setup instructions
│   ├── BLUEPRINT.md                 # This file
│   ├── AGENTS.md                    # Agent rules & context
│   ├── GETTING_STARTED.md           # Detailed getting started guide
│   ├── AUTHENTICATION_SETUP.md      # OAuth & Supabase setup
│   ├── ORGANIZATION_SCHEMA_REFERENCE.md  # Database schema reference
│   └── Other incident/fix docs      # Historical fixes and investigations
│
├── .gitignore
├── .next/                           # Build output (ignored)
└── node_modules/                    # Dependencies (ignored)
```

---

## 🔗 Component Relationship Map

### Authentication & Session Flow
```
┌─────────────────────────────────────────────────────┐
│ User Browser                                        │
└─────────────────────────────────────────────────────┘
         ↓↑ HTTP
┌─────────────────────────────────────────────────────┐
│ Next.js App Router                                  │
├─────────────────────────────────────────────────────┤
│ (landing)/sign-in/page.tsx ←→ auth-actions.ts       │
│   - signUpWithEmail()                               │
│   - signInWithEmail()                               │
│   - getGoogleAuthUrl()                              │
└─────────────────────────────────────────────────────┘
         ↓↑ HTTPS
┌─────────────────────────────────────────────────────┐
│ Supabase Auth                                       │
├─────────────────────────────────────────────────────┤
│ Email/Password: signUp, signIn, signOut             │
│ OAuth: Google provider, redirect callback           │
│ Session: HTTP-only cookies                          │
└─────────────────────────────────────────────────────┘
         ↓↑
┌─────────────────────────────────────────────────────┐
│ Supabase PostgreSQL                                 │
├─────────────────────────────────────────────────────┤
│ auth.users table (managed by Supabase)              │
└─────────────────────────────────────────────────────┘
```

### Data Flow: AI Extraction & Claim Review
```
┌──────────────────────┐
│ User: Extract Page   │
│ (/extract)           │
└──────────────────────┘
         ↓
┌──────────────────────────────────┐
│ Form Input: Text + Source Info   │
│ (Text validated by ExtractSchema)│
└──────────────────────────────────┘
         ↓ POST /api/extract
┌──────────────────────────────────┐
│ API Route: extract/route.ts      │
│ ├─ Validate with Zod             │
│ └─ Call AI service               │
└──────────────────────────────────┘
         ↓
┌──────────────────────────────────┐
│ AI Service: extractClaims()      │
│ ├─ Gemini API call               │
│ ├─ JSON response parsing         │
│ └─ Zod schema validation         │
└──────────────────────────────────┘
         ↓
┌──────────────────────────────────┐
│ Return: Extraction Object        │
│ - company_name                   │
│ - city                           │
│ - signal_type                    │
│ - evidence_quote                 │
│ - uncertainty                    │
└──────────────────────────────────┘
         ↓
┌──────────────────────────────────┐
│ User Review & Edit               │
│ (shows candidate extraction)     │
└──────────────────────────────────┘
         ↓ POST /api/claims (with token)
┌──────────────────────────────────┐
│ API Route: claims/route.ts       │
│ ├─ Check reviewer token          │
│ ├─ Validate extraction           │
│ ├─ Create company (if needed)    │
│ ├─ Insert source record          │
│ └─ Insert evidence_claim record  │
└──────────────────────────────────┘
         ↓
┌──────────────────────────────────┐
│ Database Tables Updated          │
│ ├─ sources (new row)             │
│ ├─ companies (new or linked)     │
│ ├─ evidence_claims (pending)     │
│ └─ gcc_locations (if city match) │
└──────────────────────────────────┘
         ↓
┌──────────────────────────────────┐
│ Reviewer: Review Queue           │
│ GET /api/review-queue            │
│ (shows pending claims)           │
└──────────────────────────────────┘
         ↓ PATCH /api/claims/[id] (with token)
┌──────────────────────────────────┐
│ Reviewer Action:                 │
│ ├─ Approve → "approved"          │
│ ├─ Reject → "rejected"           │
│ └─ Edit → update claim_text      │
└──────────────────────────────────┘
         ↓
┌──────────────────────────────────┐
│ Database Updated                 │
│ evidence_claims.review_status    │
│ evidence_claims.reviewed_at      │
└──────────────────────────────────┘
```

### Navigation & Protected Routes
```
┌────────────────────────────────────────┐
│ Root Layout: layout.tsx                │
│ - Check getUser()                      │
│ - Route unauthenticated to landing     │
└────────────────────────────────────────┘
              ↓
       ┌──────┴──────┐
       ↓             ↓
┌─────────────┐  ┌──────────────┐
│ Authenticated│  │Unauthenticated│
└─────────────┘  └──────────────┘
       ↓             ↓
   AppShell      Landing
   (with nav)    (no nav)
       ↓             ↓
   Protected     Public
   Routes        Routes
   ├─ /          ├─ /
   ├─ /companies ├─ /sign-in
   ├─ /cities    └─ /auth/callback
   ├─ /signals
   ├─ /extract
   ├─ /review
   └─ /providers
```

---

## 📊 Database Schema Overview

### Table Relationships
```
┌──────────────────┐
│   companies      │ (Root entity: GCC companies)
│  (id, name, ...) │
└────────┬─────────┘
         │
    ┌────┴────┬───────────┐
    ↓         ↓           ↓
┌─────────────────┐  ┌─────────────────┐
│ gcc_locations   │  │ expansion_      │
│ (city, status)  │  │ signals         │
└─────────────────┘  └─────────────────┘
    ↓
┌─────────────────┐
│ evidence_       │ (Claims with source link)
│ claims          │
│ (claim_text,    │
│  review_status) │
└────────┬────────┘
         ↑
    ┌────┴────┐
    ↓         ↓
┌──────────┐ ┌─────────────┐
│ sources  │ │ city_       │
│          │ │ metrics     │
└──────────┘ └─────────────┘
```

### Key Tables

#### `companies`
```sql
id (UUID, PK)
name (text, NOT NULL)
parent_company (text)
industry (text)
website (text)
description (text)
created_at (timestamptz)
```
- Root entity for all GCC data
- Full-text search index on name
- Referenced by: gcc_locations, evidence_claims, expansion_signals

#### `gcc_locations`
```sql
id (UUID, PK)
company_id (UUID, FK → companies)
city (text, NOT NULL)
state (text)
address (text)
function_areas (text[], default: {})
status (text, enum: active|announced|unverified)
created_at (timestamptz)
```
- Maps companies to Indian cities
- Tracks operational status
- Referenced by: evidence_claims

#### `sources`
```sql
id (UUID, PK)
title (text, NOT NULL)
url (text)
publisher (text)
published_at (date)
retrieved_at (timestamptz)
source_type (text, default: other)
content_hash (text) -- SHA-256 of source text
created_at (timestamptz)
```
- Every claim traces back to a source
- Content hash prevents duplicates
- Referenced by: evidence_claims, expansion_signals, city_metrics

#### `evidence_claims`
```sql
id (UUID, PK)
company_id (UUID, FK → companies)
location_id (UUID, FK → gcc_locations)
source_id (UUID, FK → sources, NOT NULL)
claim_type (text, NOT NULL)
claim_text (text, NOT NULL)
evidence_quote (text)
confidence (text, enum: unreviewed|low|medium|high)
review_status (text, enum: pending|approved|rejected)
extracted_by (text, enum: manual|ai)
uncertainty (text)
extracted_payload (jsonb) -- Full AI extraction
reviewed_at (timestamptz)
created_at (timestamptz)
```
- Core table: stores verified/unverified facts
- Workflow: created as "pending" → reviewed → "approved" or "rejected"
- Indexes: review_status, source_id (common queries)

#### `expansion_signals`
```sql
id (UUID, PK)
company_id (UUID, FK → companies)
source_id (UUID, FK → sources, NOT NULL)
city (text)
signal_type (text, enum: new_gcc|expansion|office|hiring|other)
summary (text, NOT NULL)
signal_status (text, enum: unreviewed|potential|confirmed|rejected)
event_date (date)
created_at (timestamptz)
```
- Public announcements and expansion events
- Separate from evidence_claims (event-based vs. fact-based)
- Index on signal_status for radar view

#### `city_metrics`
```sql
id (UUID, PK)
city (text, NOT NULL)
metric_name (text, NOT NULL)
metric_value (numeric)
unit (text)
definition (text, NOT NULL)
source_id (UUID, FK → sources)
period_label (text)
created_at (timestamptz)
```
- Comparative data across Indian cities
- Definitions ensure comparability
- All linked to sources

#### `providers`
```sql
id (UUID, PK)
name (text, NOT NULL)
category (text, NOT NULL)
website (text)
description (text)
evidence_note (text)
created_at (timestamptz)
```
- Curated GCC ecosystem service providers
- Reference-only (no direct links to claims)

### Row-Level Security (RLS) Policies
```
All tables have RLS enabled with:

SELECT Policy:  ALLOW ALL (public read)
INSERT Policy:  NONE      (only admin)
UPDATE Policy:  NONE      (only admin)
DELETE Policy:  NONE      (only admin)

Access Control:
├─ Anonymous users  → Read all public data
├─ Auth users       → Read all public data
└─ Service role     → Full admin access (on server only)
```

---

## 🔐 Security Architecture

### Authentication Layers
```
Client Request
    ↓
Next.js Middleware (optional auth checks)
    ↓
API Route / Server Component
    ├─ getUser() → returns user or null
    ├─ getSession() → returns session or null
    └─ isReviewer() → timing-safe token check
    ↓
Supabase Auth Check (if user operations)
    ↓
Supabase RLS Policy Check (database level)
```

### Reviewer Authorization Pattern
```typescript
// Pattern used in /api/claims and /api/review-queue

import { isReviewer } from "@/lib/security";

export async function POST(request: Request) {
  // ❌ Reject if not reviewer (timing-safe comparison)
  if (!isReviewer(request)) {
    return NextResponse.json(
      { error: "Reviewer authorization required." },
      { status: 401 }
    );
  }
  
  // ✅ Proceed with write operation
  // ...
}
```

### Environment Variables
```bash
# Public (NEXT_PUBLIC_ prefix = exposed to client)
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_...
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Secret (server-only)
SUPABASE_SERVICE_ROLE_KEY=...     # Admin database access
GCC_PULSE_REVIEW_TOKEN=...        # Reviewer authorization token
GEMINI_API_KEY=...                # AI extraction API key
GEMINI_MODEL=gemini-2.5-flash     # Model selection
```

---

## 📱 Page Routes & Navigation

### Public Routes (No Authentication Required)
```
/ (root)
├─ Landing page (if unauthenticated)
├─ Displays features, CTA, demo
└─ Navigation: Sign In, Sign Up

/sign-in
├─ Sign up / Sign in form
├─ Email/password or Google OAuth
└─ Post-auth: redirect to /

/auth/callback
├─ OAuth callback handler (Google)
├─ Exchanges code for session
└─ Sets secure cookie, redirects to /
```

### Protected Routes (Authentication Required)
```
/ (root)
├─ Dashboard (if authenticated)
├─ Overview of recent claims and signals
└─ Quick access to all features

/companies
├─ GCC Registry (list + search)
├─ Full-text search on company names
└─ Results: table with name, parent, industry

/companies/[id]
├─ Company detail view
├─ Locations in India
├─ Evidence claims
└─ Expansion signals

/cities
├─ City Intelligence
├─ Metrics table: city, metric, value, unit, source
├─ Comparison across Indian cities
└─ Definitions and period labels

/signals
├─ Expansion Radar
├─ Event-based view: announcements and signals
├─ Filter by signal type (new_gcc, expansion, hiring, etc.)
└─ Sort by date and status

/providers
├─ Ecosystem Service Providers
├─ Curated directory
├─ Search by category or name
└─ Reference-only (no data entry)

/extract
├─ AI Extraction Tool
├─ Paste source text → AI extracts claims
├─ Review & edit candidate extraction
├─ Save to database (requires reviewer token on backend)
└─ Shows pending status

/review
├─ Claim Review Workspace
├─ Load pending claims from review queue
├─ Verify evidence against source text
├─ Approve → "approved" status
├─ Reject → "rejected" status
└─ Requires reviewer token
```

### Navigation Structure (AppShell)
```
Sidebar (Left)
├─ Logo & tagline
├─ Navigation Menu
│  ├─ Overview (Activity icon)
│  ├─ GCC Registry (Building icon)
│  ├─ City Intelligence (MapPin icon)
│  ├─ Expansion Radar (Radar icon)
│  ├─ Providers (Users icon)
│  ├─ AI Extraction (FileSearch icon)
│  └─ Claim Review (ShieldCheck icon)
├─ Evidence principle reminder
└─ Log Out (if authenticated)

Header (Top)
├─ Left: "Ecosystem intelligence workspace" (description)
└─ Right: "Prototype" (badge)

Content (Main)
└─ Page-specific content
```

---

## 🎯 Feature Implementation Patterns

### Pattern 1: Server Component with Data Fetching
```typescript
// src/app/companies/page.tsx

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  // ✅ Server-side data fetch
  const companies = await loadCompanies(searchParams.q);
  
  // ✅ Render as HTML (no client JS needed)
  return (
    <div>
      <h1>GCC Registry</h1>
      <form method="get">
        <input name="q" placeholder="Search..." />
        <button>Search</button>
      </form>
      <table>
        {/* render companies */}
      </table>
    </div>
  );
}
```
**Benefits**: No client-side state, instant page load, SEO-friendly

### Pattern 2: Client Component with Form Submission
```typescript
// src/app/extract/page.tsx
'use client';

export default function ExtractPage() {
  const [extraction, setExtraction] = useState(null);
  const [loading, setLoading] = useState(false);
  
  async function handleSubmit(formData) {
    setLoading(true);
    const response = await fetch('/api/extract', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
    const { extraction } = await response.json();
    setExtraction(extraction);
    setLoading(false);
  }
  
  // ✅ Interactive form with live feedback
  return (
    <form onSubmit={handleSubmit}>
      {/* form inputs */}
    </form>
  );
}
```
**Benefits**: Interactive UX, instant feedback, form validation

### Pattern 3: API Route with Validation & Error Handling
```typescript
// src/app/api/extract/route.ts

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  
  try {
    // ✅ Parse and validate request
    const json = await request.json();
    const parsed = ExtractRequestSchema.safeParse(json);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    
    // ✅ Call AI service
    const extraction = await extractClaims(parsed.data.text);
    
    // ✅ Return structured response
    return NextResponse.json({ extraction, requestId });
  } catch (error) {
    // ✅ Safe error logging
    console.error("Extraction failed", { requestId, message: error.message });
    return NextResponse.json(
      { error: "Extraction failed.", requestId },
      { status: 502 }
    );
  }
}
```
**Benefits**: Type-safe, validated, auditable error handling

### Pattern 4: Server Action for Authentication
```typescript
// src/lib/auth-actions.ts
'use server';

export async function signInWithEmail(email: string, password: string) {
  const supabase = await getSupabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  
  if (error) {
    return { error: formatAuthError(error) };
  }
  
  redirect("/");
}
```
**Benefits**: No API route needed, automatic CSRF protection, full server access

---

## 🚀 Deployment & Performance

### Build Output
```bash
npm run build
# Outputs optimized Next.js production bundle
# Ready for Vercel or self-hosted Node.js
```

### Static Generation vs. Server Components
```
Static (Build Time):
├─ Landing page
└─ Sign-in page

Server-Rendered (Request Time):
├─ /companies (varies by search query)
├─ /cities (dynamic data)
├─ /signals (dynamic data)
└─ /review (protected, user-specific)

Client Components:
├─ /extract (interactive form)
└─ /review (interactive approval UI)
```

### Performance Optimizations
```
✅ Server Components by default (minimal client JS)
✅ Tailwind CSS with Turbopack (fast CSS compilation)
✅ Database indexes on common queries
   ├─ companies.name (full-text search)
   ├─ evidence_claims.review_status (filtering)
   ├─ sources.content_hash (deduplication)
   └─ expansion_signals.signal_status (filtering)
✅ API pagination (max 100 results per request)
✅ Vercel deployment (edge network, automatic scaling)
```

---

## 🔄 Data Flow Diagram: Complete User Journey

```
┌─────────────────────────────────────────────────────────────┐
│ 1. UNAUTHENTICATED USER                                     │
├─────────────────────────────────────────────────────────────┤
│ Lands on / → Landing page displayed                         │
│ Explores features, CTA buttons                              │
│ Clicks "Sign Up" or "Sign In" → /sign-in                    │
└─────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. AUTHENTICATION (Sign Up)                                 │
├─────────────────────────────────────────────────────────────┤
│ Enters email, password, account type                        │
│ → signUpWithEmail() server action                           │
│ → Supabase creates user + sends confirmation email          │
│ User confirms email (if required)                           │
│ → Automatic sign-in or redirect to sign-in                  │
└─────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. AUTHENTICATED USER: EXPLORER                             │
├─────────────────────────────────────────────────────────────┤
│ Session cookie set, redirect to /                           │
│ → Dashboard displayed with app-shell + navigation           │
│ Can browse:                                                 │
│ ├─ /companies (search registry)                             │
│ ├─ /companies/[id] (view company details)                   │
│ ├─ /cities (compare metrics)                                │
│ ├─ /signals (track announcements)                           │
│ └─ /providers (directory)                                   │
└─────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. AUTHENTICATED USER: EXTRACTOR                            │
├─────────────────────────────────────────────────────────────┤
│ Navigates to /extract                                       │
│ Pastes source text + metadata                               │
│ → POST /api/extract                                         │
│ → Gemini API generates structured JSON                      │
│ Reviews & edits extraction candidate                        │
│ Clicks "Save" → POST /api/claims (with reviewer token)      │
│ → Source + Claim saved with status "pending"                │
│ Receives confirmation: claim #123 pending review            │
└─────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. REVIEWER: VERIFICATION & APPROVAL                        │
├─────────────────────────────────────────────────────────────┤
│ Has reviewer token (GCC_PULSE_REVIEW_TOKEN)                 │
│ Navigates to /review                                        │
│ → GET /api/review-queue (with token)                        │
│ → Displays pending claims in queue                          │
│ Clicks claim #123                                           │
│ Reads evidence quote + full source text                     │
│ Decision:                                                   │
│ ├─ Approve → PATCH /api/claims/123 (action: approve)        │
│ │  → Status = "approved", reviewed_at = NOW                 │
│ │                                                           │
│ ├─ Reject → PATCH /api/claims/123 (action: reject)          │
│ │  → Status = "rejected", reviewed_at = NOW                 │
│ │                                                           │
│ └─ Edit → PATCH /api/claims/123 (action: edit, new text)    │
│    → Update claim_text, remains pending                     │
└─────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. DATA PUBLISHED                                           │
├─────────────────────────────────────────────────────────────┤
│ Approved claims (status = "approved"):                       │
│ ├─ Appear in /companies/[id] detail view                    │
│ ├─ Contribute to company profile                            │
│ ├─ Included in city metrics aggregations                    │
│ └─ Publicly accessible (RLS read policy)                    │
│                                                             │
│ Rejected claims (status = "rejected"):                       │
│ ├─ Hidden from public view                                  │
│ ├─ Kept for audit trail                                     │
│ └─ Available to admin for analysis                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Validation Schemas (Zod)

All user input validated with strict Zod schemas:

```typescript
// Extraction output from AI
ExtractionSchema = z.object({
  company_name: z.string().max(300),
  parent_company: z.string().max(300),
  industry: z.string().max(200),
  city: z.string().max(200),
  announcement_date: z.string().max(80),
  signal_type: z.enum(["new_gcc", "expansion", "office", "hiring", "other"]),
  summary: z.string().max(2000),
  evidence_quote: z.string().max(1500),
  uncertainty: z.string().max(1500),
})

// User extraction request
ExtractRequestSchema = z.object({
  text: z.string().trim().min(50).max(20000),
  sourceTitle: z.string().max(500).optional(),
  sourceUrl: z.union([z.string().url(), z.literal("")]).optional(),
  publisher: z.string().max(300).optional(),
  publishedAt: z.string().max(40).optional(),
})

// Save claim with full context
SaveClaimSchema = z.object({
  source: z.object({
    title: z.string().trim().min(1).max(500),
    url: z.union([z.string().url(), z.literal("")]).optional(),
    publisher: z.string().max(300).optional(),
    publishedAt: z.string().max(40).optional(),
    sourceText: z.string().trim().min(50).max(20000),
  }),
  extraction: ExtractionSchema,
})

// Review action (approve/reject/edit)
ReviewSchema = z.object({
  action: z.enum(["approve", "reject", "edit"]),
  claimText: z.string().trim().min(1).max(3000).optional(),
})
```

---

## 🧩 Key Integration Points

### Supabase Integration
```
Browser → Next.js Server
  ↓
@supabase/ssr (session management)
  ↓
getSupabaseServer() (server-side client)
  ↓
HTTP(S) to Supabase
  ↓
PostgreSQL Database
  ├─ RLS policies enforced
  ├─ Row filtering per user/role
  └─ Read-only for public tables
```

### Gemini AI Integration
```
User Input (source text)
  ↓
POST /api/extract
  ↓
extractClaims(text)
  ↓
GoogleGenAI API call
  ├─ Model: gemini-2.5-flash
  ├─ Response format: JSON (with schema)
  └─ Max duration: 30 seconds
  ↓
JSON Response Parsing
  ↓
Zod Schema Validation
  ↓
Return to client (or error)
```

### OAuth Flow (Google)
```
User: Click "Continue with Google"
  ↓
getGoogleAuthUrl() → Supabase generates OAuth URL
  ↓
User redirected to Google consent screen
  ↓
User approves → Google redirects to /auth/callback
  ↓
Callback route exchanges code for session
  ↓
Session cookie set → Redirect to /
```

---

## 🛠️ Development Workflows

### Adding a New Page
1. Create folder under `/src/app/[route-name]/`
2. Add `page.tsx` (Server Component by default)
3. Import components, fetch data if needed
4. If interactive, add `'use client'` directive
5. Add navigation link in `app-shell.tsx`

### Adding a New API Route
1. Create folder under `/src/app/api/[endpoint]/`
2. Add `route.ts` with `GET`, `POST`, `PATCH`, etc.
3. Validate input with Zod schema
4. Check authorization (if needed)
5. Query database or call external service
6. Return JSON response

### Adding a New Database Table
1. Edit `/src/app/supabase/schema.sql`
2. Add `CREATE TABLE` statement
3. Add RLS policies
4. Update `/src/lib/data.ts` with query functions
5. Run migration: `supabase db push`
6. Update type definitions if needed

### Adding a New Validation Schema
1. Edit `/src/lib/validation.ts`
2. Add new Zod schema
3. Export type via `z.infer<typeof YourSchema>`
4. Use in API route validation

---

## 📊 Type Safety & TypeScript

### Path Aliases
```typescript
// tsconfig.json
{
  "paths": {
    "@/*": ["./src/*"]
  }
}

// Usage
import { getUser } from "@/lib/auth";        // ✅ Clear paths
import Button from "@/components/button";    // ✅ No relative imports
```

### Strict Mode Enabled
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    // Enforces:
    // - Null/undefined checking
    // - Explicit any bans
    // - Implicit any bans
    // - Function parameter types
    // - Return type annotations
  }
}
```

### Generated Types from Supabase
```typescript
// Auto-generated from schema
type Company = Database['public']['Tables']['companies']['Row'];
type CompanyInsert = Database['public']['Tables']['companies']['Insert'];
type CompanyUpdate = Database['public']['Tables']['companies']['Update'];
```

---

## 🧪 Testing & Debugging

### API Testing (Manual)
```bash
# Extract endpoint
curl -X POST http://localhost:3000/api/extract \
  -H "Content-Type: application/json" \
  -d '{"text": "long source text...", "sourceTitle": "Article"}'

# Claims endpoint (with token)
curl -X POST http://localhost:3000/api/claims \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_REVIEW_TOKEN" \
  -d '{"source": {...}, "extraction": {...}}'

# Review queue (with token)
curl http://localhost:3000/api/review-queue \
  -H "Authorization: Bearer YOUR_REVIEW_TOKEN"
```

### Logging Pattern
```typescript
// Safe diagnostic logging (no secrets)
function logAuthEvent(event: string, details?: Record<string, string>) {
  const timestamp = new Date().toISOString();
  console.log(`[AUTH] ${timestamp} ${event}`, details || "");
}
```

### Error Messages (User-Friendly)
```typescript
// Specific error codes mapped to user messages
const errorMessages = {
  "over_email_send_rate_limit": "Supabase has temporarily limited emails...",
  "rate_limit": "Too many attempts. Please wait...",
  "email_not_confirmed": "Please confirm your email...",
  "invalid_login_credentials": "Invalid email or password.",
};
```

---

## 🚨 Known Limitations & Future Work

### Current Limitations
- ❌ No file uploads (text-only extraction)
- ❌ Single reviewer token (not user-based roles)
- ❌ No batch operations
- ❌ Limited API documentation

### Future Enhancements
- ✅ User-based reviewer roles (RBAC)
- ✅ File upload support (PDF, images)
- ✅ Batch extraction
- ✅ OpenAPI documentation
- ✅ GraphQL API
- ✅ Advanced analytics dashboard
- ✅ Export to CSV/PDF reports
- ✅ Email notifications for approvals

---

## 📚 Quick Reference

### File Locations by Feature

| Feature | Files |
|---------|-------|
| Authentication | `/src/lib/auth*.ts`, `/src/app/(landing)/sign-in/page.tsx` |
| AI Extraction | `/src/lib/ai/extract.ts`, `/src/app/api/extract/route.ts`, `/src/app/extract/page.tsx` |
| Claim Review | `/src/app/api/claims/`, `/src/app/review/page.tsx`, `/src/app/api/review-queue/route.ts` |
| Database | `/src/app/supabase/schema.sql`, `/src/lib/data.ts`, `/src/lib/supabase/server.ts` |
| Validation | `/src/lib/validation.ts` |
| Components | `/src/components/` |
| Styling | `/src/app/globals.css`, `tailwind.config.ts` |

### Environment Variables by Purpose

| Variable | Purpose | Visibility |
|----------|---------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Database connection | Public |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase auth key | Public |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin database access | Secret |
| `GEMINI_API_KEY` | AI extraction | Secret |
| `GCC_PULSE_REVIEW_TOKEN` | Reviewer authorization | Secret |

### npm Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server (http://localhost:3000) |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## 📖 Reference Documents

Located in `/src/app/project-docs/`:
- `BACKEND_BLUEPRINT.md` — Backend architecture deep-dive
- `FRONTEND_BLUEPRINT.md` — Frontend component architecture
- `BACKEND_IMPLEMENTATION_AGENT_PROMPT.md` — Agent instructions
- `FRONTEND_IDE_AGENT_PROMPT.md` — IDE agent context

Located in root:
- `AUTHENTICATION_SETUP.md` — Supabase OAuth setup
- `ORGANIZATION_SCHEMA_REFERENCE.md` — Database reference
- `GETTING_STARTED.md` — Setup instructions
- `AGENTS.md` — This file (agent context rules)

---

## ✅ Checklist for New Contributors

- [ ] Read this BLUEPRINT.md
- [ ] Understand Next.js 16 App Router (not Pages Router)
- [ ] Familiarize with Supabase auth flow
- [ ] Review Zod validation patterns
- [ ] Check database schema before querying
- [ ] Use `@/` path aliases (no relative imports)
- [ ] Add `'use server'` or `'use client'` directives explicitly
- [ ] Validate all user input with Zod
- [ ] Log auth events safely (no secrets)
- [ ] Test API routes with curl or Postman
- [ ] Check RLS policies before inserting data

---

**Last Updated**: October 2026  
**Project**: GCC-Pulse (Evidence-backed GCC Ecosystem Intelligence)  
**Architecture**: Next.js 16 + React 19 + Supabase + Gemini AI
