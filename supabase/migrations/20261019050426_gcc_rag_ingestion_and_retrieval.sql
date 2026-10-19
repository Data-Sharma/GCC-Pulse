create extension if not exists vector;
set search_path = public, extensions;

alter table public.gcc_knowledge_sources
  add column if not exists source_type text not null default 'user_supplied',
  add column if not exists trust_tier text not null default 'unassessed',
  add column if not exists source_status text not null default 'active',
  add column if not exists ingestion_status text not null default 'pending',
  add column if not exists ingestion_stage text,
  add column if not exists ingestion_error text,
  add column if not exists content_hash text,
  add column if not exists idempotency_key uuid,
  add column if not exists language text,
  add column if not exists geography text[] not null default '{}',
  add column if not exists topics text[] not null default '{}';

alter table public.gcc_knowledge_sources
  add constraint gcc_knowledge_sources_trust_tier_check
    check (trust_tier in ('unassessed', 'official', 'primary', 'reputable_secondary', 'user_supplied')),
  add constraint gcc_knowledge_sources_ingestion_status_check
    check (ingestion_status in ('pending', 'processing', 'completed', 'failed', 'not_ingested')),
  add constraint gcc_knowledge_sources_source_status_check
    check (source_status in ('active', 'stale', 'withdrawn', 'rejected'));

create table if not exists public.gcc_knowledge_documents (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.gcc_knowledge_sources(id) on delete cascade,
  content_hash text not null,
  parser_version text not null,
  original_text text not null,
  normalized_text text not null,
  language text,
  ingestion_status text not null default 'processing'
    check (ingestion_status in ('processing', 'completed', 'failed')),
  ingestion_stage text not null default 'normalize',
  ingestion_error text,
  chunk_count integer not null default 0 check (chunk_count >= 0),
  embedding_model text,
  embedding_dimensions integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_id, content_hash, parser_version),
  unique (id, source_id)
);

create table if not exists public.gcc_knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null,
  source_id uuid not null references public.gcc_knowledge_sources(id) on delete cascade,
  chunk_index integer not null check (chunk_index >= 0),
  content text not null,
  content_hash text not null,
  section_heading text,
  char_start integer not null check (char_start >= 0),
  char_end integer not null check (char_end >= char_start),
  metadata jsonb not null default '{}',
  embedding vector(3072),
  embedding_model text,
  search_vector tsvector generated always as (to_tsvector('simple', coalesce(section_heading, '') || ' ' || content)) stored,
  created_at timestamptz not null default now(),
  foreign key (document_id, source_id)
    references public.gcc_knowledge_documents(id, source_id) on delete cascade,
  unique (document_id, chunk_index),
  unique (id, source_id, document_id)
);

create table if not exists public.gcc_ingestion_stage_runs (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.gcc_knowledge_sources(id) on delete cascade,
  document_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  stage text not null check (stage in ('DISCOVER', 'FETCH', 'EXTRACT', 'NORMALIZE', 'DEDUPLICATE', 'CHUNK', 'EMBED', 'INDEX', 'VALIDATE', 'COMPLETE')),
  status text not null check (status in ('running', 'completed', 'skipped', 'failed')),
  error_code text,
  duration_ms integer,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  foreign key (document_id, source_id)
    references public.gcc_knowledge_documents(id, source_id) on delete cascade,
  unique (document_id, stage, started_at)
);

create unique index if not exists gcc_knowledge_sources_content_identity_idx
  on public.gcc_knowledge_sources (
    (coalesce(profile_id, '00000000-0000-0000-0000-000000000000'::uuid)),
    (coalesce(url, '')),
    title,
    content_hash
  )
  where content_hash is not null;
create unique index if not exists gcc_knowledge_sources_idempotency_idx
  on public.gcc_knowledge_sources(user_id, idempotency_key)
  where idempotency_key is not null;

create index if not exists gcc_knowledge_documents_source_idx
  on public.gcc_knowledge_documents(source_id, created_at desc);
create index if not exists gcc_knowledge_chunks_source_idx
  on public.gcc_knowledge_chunks(source_id, document_id, chunk_index);
create index if not exists gcc_knowledge_chunks_search_idx
  on public.gcc_knowledge_chunks using gin(search_vector);
create index if not exists gcc_knowledge_chunks_embedding_model_idx
  on public.gcc_knowledge_chunks(embedding_model) where embedding is not null;

alter table public.gcc_reports
  add column if not exists profile_snapshot jsonb,
  add column if not exists report_schema_version text not null default '1',
  add column if not exists provider text,
  add column if not exists model text,
  add column if not exists research_plan jsonb not null default '[]',
  add column if not exists evidence_manifest jsonb not null default '[]',
  add column if not exists validation_status text not null default 'pending',
  add column if not exists request_id uuid,
  add column if not exists generation_key uuid,
  add column if not exists generation_duration_ms integer;
create unique index if not exists gcc_reports_generation_key_idx
  on public.gcc_reports(user_id, generation_key)
  where generation_key is not null;

alter table public.gcc_reports
  add constraint gcc_reports_validation_status_check
    check (validation_status in ('pending', 'valid', 'partial', 'invalid'));

alter table public.gcc_chat_messages
  add column if not exists chunk_ids uuid[] not null default '{}',
  add column if not exists provider text,
  add column if not exists model text,
  add column if not exists request_id uuid;

create table if not exists public.gcc_ai_request_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  operation text not null check (operation in ('report_generation', 'report_chat', 'source_ingestion')),
  requested_at timestamptz not null default now()
);
create index if not exists gcc_ai_request_events_window_idx
  on public.gcc_ai_request_events(user_id, operation, requested_at desc);
alter table public.gcc_ai_request_events enable row level security;
revoke all on public.gcc_ai_request_events from anon, authenticated;

create table if not exists public.gcc_report_evidence (
  report_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  source_id uuid not null references public.gcc_knowledge_sources(id) on delete cascade,
  document_id uuid not null,
  chunk_id uuid not null,
  research_question_id text,
  retrieval_rank integer not null check (retrieval_rank > 0),
  vector_similarity real,
  lexical_rank integer,
  created_at timestamptz not null default now(),
  primary key (report_id, chunk_id),
  foreign key (report_id, user_id)
    references public.gcc_reports(id, user_id) on delete cascade,
  foreign key (chunk_id, source_id, document_id)
    references public.gcc_knowledge_chunks(id, source_id, document_id) on delete cascade
);

create index if not exists gcc_report_evidence_user_report_idx
  on public.gcc_report_evidence(user_id, report_id);

drop policy if exists "Read global and owned GCC knowledge" on public.gcc_knowledge_sources;
create policy "Read global and owned GCC knowledge"
  on public.gcc_knowledge_sources for select to authenticated
  using ((scope = 'global' and verification_status = 'verified') or user_id = (select auth.uid()));

alter table public.gcc_knowledge_documents enable row level security;
alter table public.gcc_knowledge_chunks enable row level security;
alter table public.gcc_ingestion_stage_runs enable row level security;
alter table public.gcc_report_evidence enable row level security;

drop policy if exists "Read accessible GCC documents" on public.gcc_knowledge_documents;
create policy "Read accessible GCC documents"
  on public.gcc_knowledge_documents for select to authenticated
  using (exists (
    select 1 from public.gcc_knowledge_sources s
    where s.id = source_id
      and ((s.scope = 'global' and s.verification_status = 'verified')
        or (s.scope = 'company' and s.user_id = (select auth.uid())))
  ));

drop policy if exists "Users manage their company GCC documents" on public.gcc_knowledge_documents;
create policy "Users manage their company GCC documents"
  on public.gcc_knowledge_documents for all to authenticated
  using (exists (
    select 1 from public.gcc_knowledge_sources s
    where s.id = source_id and s.scope = 'company' and s.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.gcc_knowledge_sources s
    where s.id = source_id and s.scope = 'company' and s.user_id = (select auth.uid())
  ));

drop policy if exists "Read accessible GCC chunks" on public.gcc_knowledge_chunks;
create policy "Read accessible GCC chunks"
  on public.gcc_knowledge_chunks for select to authenticated
  using (exists (
    select 1 from public.gcc_knowledge_sources s
    where s.id = source_id
      and ((s.scope = 'global' and s.verification_status = 'verified')
        or (s.scope = 'company' and s.user_id = (select auth.uid())))
  ));

drop policy if exists "Users manage their company GCC chunks" on public.gcc_knowledge_chunks;
create policy "Users manage their company GCC chunks"
  on public.gcc_knowledge_chunks for all to authenticated
  using (exists (
    select 1 from public.gcc_knowledge_sources s
    where s.id = source_id and s.scope = 'company' and s.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.gcc_knowledge_sources s
    where s.id = source_id and s.scope = 'company' and s.user_id = (select auth.uid())
  ));

drop policy if exists "Users read their ingestion stage history" on public.gcc_ingestion_stage_runs;
create policy "Users read their ingestion stage history"
  on public.gcc_ingestion_stage_runs for select to authenticated
  using (user_id = (select auth.uid()));
drop policy if exists "Users manage their ingestion stages" on public.gcc_ingestion_stage_runs;
create policy "Users manage their ingestion stages"
  on public.gcc_ingestion_stage_runs for all to authenticated
  using (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.gcc_knowledge_sources s
      where s.id = source_id and s.user_id = (select auth.uid()) and s.scope = 'company'
    )
  )
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.gcc_knowledge_sources s
      where s.id = source_id and s.user_id = (select auth.uid()) and s.scope = 'company'
    )
  );

drop policy if exists "Users read their report evidence" on public.gcc_report_evidence;
create policy "Users read their report evidence"
  on public.gcc_report_evidence for select to authenticated
  using (user_id = (select auth.uid()));
drop policy if exists "Users add evidence to their reports" on public.gcc_report_evidence;
create policy "Users add evidence to their reports"
  on public.gcc_report_evidence for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.gcc_reports r
      where r.id = report_id and r.user_id = (select auth.uid())
    )
    and exists (
      select 1 from public.gcc_knowledge_sources s
      where s.id = source_id
        and ((s.scope = 'global' and s.verification_status = 'verified')
          or (s.scope = 'company' and s.user_id = (select auth.uid())))
    )
  );

grant select, insert, update, delete on public.gcc_knowledge_documents to authenticated;
grant select, insert, update, delete on public.gcc_knowledge_chunks to authenticated;
grant select, insert, update, delete on public.gcc_ingestion_stage_runs to authenticated;
grant select, insert on public.gcc_report_evidence to authenticated;

create or replace function public.gcc_claim_ai_request_slot(operation_name text)
returns boolean
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  requesting_user uuid := auth.uid();
  allowed_requests integer;
  current_count integer;
begin
  if requesting_user is null then
    raise exception 'authentication required';
  end if;

  allowed_requests := case operation_name
    when 'report_generation' then 3
    when 'report_chat' then 10
    when 'source_ingestion' then 3
    else null
  end;
  if allowed_requests is null then
    raise exception 'unsupported operation';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(requesting_user::text || ':' || operation_name, 0));
  delete from public.gcc_ai_request_events
  where user_id = requesting_user and operation = operation_name
    and requested_at < now() - interval '1 day';
  select count(*)::integer into current_count
  from public.gcc_ai_request_events
  where user_id = requesting_user and operation = operation_name
    and requested_at >= now() - interval '1 minute';
  if current_count >= allowed_requests then
    return false;
  end if;

  insert into public.gcc_ai_request_events(user_id, operation)
  values (requesting_user, operation_name);
  return true;
end;
$$;
revoke all on function public.gcc_claim_ai_request_slot(text) from public, anon;
grant execute on function public.gcc_claim_ai_request_slot(text) to authenticated;

create or replace function public.gcc_hybrid_search(
  query_embedding vector(3072),
  query_text text,
  profile_uuid uuid,
  embedding_model_id text,
  result_limit integer default 12
)
returns table (
  chunk_id uuid,
  source_id uuid,
  document_id uuid,
  chunk_text text,
  section_heading text,
  chunk_index integer,
  source_title text,
  publisher text,
  canonical_url text,
  publication_date date,
  retrieved_at timestamptz,
  source_type text,
  category text,
  verification_status text,
  vector_similarity real,
  lexical_score real,
  fused_score real
)
language plpgsql
stable
security invoker
set search_path = public, extensions
as $$
begin
  if result_limit < 1 or result_limit > 40 then
    raise exception 'result_limit must be between 1 and 40';
  end if;
  if profile_uuid is null or profile_uuid not in (
    select p.id from public.gcc_profiles p where p.user_id = (select auth.uid())
  ) then
    raise exception 'profile is not accessible';
  end if;

  return query
  with accessible as materialized (
    select c.id, c.source_id, c.document_id, c.content, c.section_heading,
      c.chunk_index, c.embedding, c.embedding_model, c.search_vector,
      s.title, s.publisher, s.url, s.published_at, s.retrieved_at,
      s.source_type, s.category, s.verification_status
    from public.gcc_knowledge_chunks c
    join public.gcc_knowledge_documents d on d.id = c.document_id
    join public.gcc_knowledge_sources s on s.id = c.source_id
    where d.ingestion_status = 'completed'
      and s.source_status = 'active'
      and s.ingestion_status = 'completed'
      and (
        (s.scope = 'company' and s.user_id = (select auth.uid()) and s.profile_id = profile_uuid)
        or (s.scope = 'global' and s.verification_status = 'verified')
      )
  ),
  vector_hits as (
    select a.id, 1 - (a.embedding <=> query_embedding) as similarity,
      row_number() over (order by a.embedding <=> query_embedding)::integer as position
    from accessible a
    where a.embedding is not null and a.embedding_model = embedding_model_id
    order by a.embedding <=> query_embedding
    limit 40
  ),
  lexical_hits as (
    select a.id, ts_rank_cd(a.search_vector, websearch_to_tsquery('simple', query_text)) as score,
      row_number() over (order by ts_rank_cd(a.search_vector, websearch_to_tsquery('simple', query_text)) desc)::integer as position
    from accessible a
    where nullif(trim(query_text), '') is not null
      and a.search_vector @@ websearch_to_tsquery('simple', query_text)
    order by score desc
    limit 40
  ),
  combined as (
    select coalesce(v.id, l.id) as id,
      v.similarity::real as similarity,
      l.score::real as lexical,
      (case when v.position is null then 0 else 1.0 / (60 + v.position) end
        + case when l.position is null then 0 else 1.0 / (60 + l.position) end)::real as fused
    from vector_hits v
    full outer join lexical_hits l on l.id = v.id
  )
  select c.id, a.source_id, a.document_id, a.content, a.section_heading,
    a.chunk_index, a.title, a.publisher, a.url, a.published_at,
    a.retrieved_at, a.source_type, a.category, a.verification_status,
    c.similarity, c.lexical, c.fused
  from combined c
  join accessible a on a.id = c.id
  order by c.fused desc
  limit result_limit;
end;
$$;

revoke all on function public.gcc_hybrid_search(vector, text, uuid, text, integer) from public;
grant execute on function public.gcc_hybrid_search(vector, text, uuid, text, integer) to authenticated;
