-- Reproducible idempotent baseline based on src/app/supabase/schema.sql.
-- Public claims are restricted to approved records to match current database security.
create extension if not exists pgcrypto;

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  parent_company text,
  industry text,
  website text,
  description text,
  created_at timestamptz not null default now()
);
create table if not exists public.gcc_locations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  city text not null,
  state text,
  address text,
  function_areas text[] not null default '{}',
  status text not null default 'unverified' check (status in ('active','announced','unverified')),
  created_at timestamptz not null default now()
);
create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text,
  publisher text,
  published_at date,
  retrieved_at timestamptz not null default now(),
  source_type text not null default 'other',
  content_hash text,
  created_at timestamptz not null default now()
);
create table if not exists public.evidence_claims (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete set null,
  location_id uuid references public.gcc_locations(id) on delete set null,
  source_id uuid not null references public.sources(id) on delete cascade,
  claim_type text not null,
  claim_text text not null,
  evidence_quote text,
  confidence text not null default 'unreviewed' check (confidence in ('unreviewed','low','medium','high')),
  review_status text not null default 'pending' check (review_status in ('pending','approved','rejected')),
  extracted_by text not null default 'manual' check (extracted_by in ('manual','ai')),
  uncertainty text,
  extracted_payload jsonb,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create table if not exists public.providers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  website text,
  description text,
  evidence_note text,
  created_at timestamptz not null default now()
);
create table if not exists public.city_metrics (
  id uuid primary key default gen_random_uuid(),
  city text not null,
  metric_name text not null,
  metric_value numeric,
  unit text,
  definition text not null,
  source_id uuid references public.sources(id) on delete set null,
  period_label text,
  created_at timestamptz not null default now()
);
create table if not exists public.expansion_signals (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete set null,
  source_id uuid not null references public.sources(id) on delete cascade,
  city text,
  signal_type text not null,
  summary text not null,
  signal_status text not null default 'unreviewed' check (signal_status in ('unreviewed','potential','confirmed','rejected')),
  event_date date,
  created_at timestamptz not null default now()
);

create index if not exists companies_name_idx on public.companies using gin (to_tsvector('english', name));
create index if not exists gcc_locations_city_idx on public.gcc_locations(city);
create index if not exists claims_review_status_idx on public.evidence_claims(review_status);
create index if not exists claims_source_idx on public.evidence_claims(source_id);
create index if not exists expansion_status_idx on public.expansion_signals(signal_status);

alter table public.companies enable row level security;
alter table public.gcc_locations enable row level security;
alter table public.sources enable row level security;
alter table public.evidence_claims enable row level security;
alter table public.providers enable row level security;
alter table public.city_metrics enable row level security;
alter table public.expansion_signals enable row level security;

drop policy if exists "Public can read companies" on public.companies;
create policy "Public can read companies" on public.companies for select to anon, authenticated using (true);
drop policy if exists "Public can read locations" on public.gcc_locations;
create policy "Public can read locations" on public.gcc_locations for select to anon, authenticated using (true);
drop policy if exists "Public can read sources" on public.sources;
create policy "Public can read sources" on public.sources for select to anon, authenticated using (true);
drop policy if exists "Public can read claims" on public.evidence_claims;
drop policy if exists "Public can read approved claims" on public.evidence_claims;
create policy "Public can read approved claims" on public.evidence_claims for select to anon, authenticated using (review_status = 'approved');
drop policy if exists "Public can read providers" on public.providers;
create policy "Public can read providers" on public.providers for select to anon, authenticated using (true);
drop policy if exists "Public can read city metrics" on public.city_metrics;
create policy "Public can read city metrics" on public.city_metrics for select to anon, authenticated using (true);
drop policy if exists "Public can read signals" on public.expansion_signals;
create policy "Public can read signals" on public.expansion_signals for select to anon, authenticated using (true);
-- There are intentionally no public INSERT/UPDATE/DELETE policies.
-- Writes in this prototype use a server-only service-role key guarded by a temporary reviewer token.
