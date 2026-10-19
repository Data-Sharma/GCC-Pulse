create extension if not exists pgcrypto;

create table if not exists public.gcc_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  company_name text not null,
  profile jsonb not null,
  requirements jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create table if not exists public.gcc_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid not null,
  status text not null default 'queued'
    check (status in ('queued', 'generating', 'completed', 'failed')),
  title text not null,
  report jsonb,
  evidence_source_ids uuid[] not null default '{}',
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  foreign key (profile_id, user_id)
    references public.gcc_profiles(id, user_id) on delete cascade
);

create table if not exists public.gcc_knowledge_sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  profile_id uuid,
  scope text not null default 'company' check (scope in ('global', 'company')),
  title text not null,
  url text,
  publisher text,
  published_at date,
  retrieved_at timestamptz not null default now(),
  excerpt text,
  category text not null default 'general',
  verification_status text not null default 'unverified'
    check (verification_status in ('unverified', 'needs_review', 'verified', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (scope = 'global' and user_id is null and profile_id is null)
    or (scope = 'company' and user_id is not null and profile_id is not null)
  ),
  foreign key (profile_id, user_id)
    references public.gcc_profiles(id, user_id) on delete cascade
);

create table if not exists public.gcc_chat_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid not null,
  report_id uuid,
  title text not null default 'Report Q&A',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (profile_id, user_id)
    references public.gcc_profiles(id, user_id) on delete cascade,
  foreign key (report_id, user_id)
    references public.gcc_reports(id, user_id) on delete cascade
);

create table if not exists public.gcc_chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid not null references public.gcc_chat_conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null check (length(content) <= 12000),
  citations uuid[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists gcc_reports_user_created_idx
  on public.gcc_reports(user_id, created_at desc);
create index if not exists gcc_knowledge_sources_user_profile_idx
  on public.gcc_knowledge_sources(user_id, profile_id, category, created_at desc);
create index if not exists gcc_chat_conversations_user_updated_idx
  on public.gcc_chat_conversations(user_id, updated_at desc);
create index if not exists gcc_chat_messages_conversation_idx
  on public.gcc_chat_messages(conversation_id, created_at);

alter table public.gcc_profiles enable row level security;
alter table public.gcc_reports enable row level security;
alter table public.gcc_knowledge_sources enable row level security;
alter table public.gcc_chat_conversations enable row level security;
alter table public.gcc_chat_messages enable row level security;

drop policy if exists "Users manage their GCC profile" on public.gcc_profiles;
create policy "Users manage their GCC profile"
  on public.gcc_profiles for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Users manage their GCC reports" on public.gcc_reports;
create policy "Users manage their GCC reports"
  on public.gcc_reports for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.gcc_profiles p
      where p.id = profile_id and p.user_id = (select auth.uid())
    )
  );

drop policy if exists "Read global and owned GCC knowledge" on public.gcc_knowledge_sources;
create policy "Read global and owned GCC knowledge"
  on public.gcc_knowledge_sources for select to authenticated
  using (scope = 'global' or user_id = (select auth.uid()));

drop policy if exists "Users manage their company GCC knowledge" on public.gcc_knowledge_sources;
create policy "Users manage their company GCC knowledge"
  on public.gcc_knowledge_sources for all to authenticated
  using (scope = 'company' and user_id = (select auth.uid()))
  with check (
    scope = 'company'
    and user_id = (select auth.uid())
    and exists (
      select 1 from public.gcc_profiles p
      where p.id = profile_id and p.user_id = (select auth.uid())
    )
    and verification_status in ('unverified', 'needs_review')
  );

drop policy if exists "Users manage their GCC conversations" on public.gcc_chat_conversations;
create policy "Users manage their GCC conversations"
  on public.gcc_chat_conversations for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.gcc_profiles p
      where p.id = profile_id and p.user_id = (select auth.uid())
    )
    and (
      report_id is null
      or exists (
        select 1 from public.gcc_reports r
        where r.id = report_id and r.user_id = (select auth.uid())
      )
    )
  );

drop policy if exists "Users manage their GCC chat messages" on public.gcc_chat_messages;
create policy "Users manage their GCC chat messages"
  on public.gcc_chat_messages for all to authenticated
  using (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.gcc_chat_conversations c
      where c.id = conversation_id and c.user_id = (select auth.uid())
    )
  )
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.gcc_chat_conversations c
      where c.id = conversation_id and c.user_id = (select auth.uid())
    )
  );

grant select, insert, update, delete on public.gcc_profiles to authenticated;
grant select, insert, update, delete on public.gcc_reports to authenticated;
grant select, insert, update, delete on public.gcc_knowledge_sources to authenticated;
grant select, insert, update, delete on public.gcc_chat_conversations to authenticated;
grant select, insert, update, delete on public.gcc_chat_messages to authenticated;
