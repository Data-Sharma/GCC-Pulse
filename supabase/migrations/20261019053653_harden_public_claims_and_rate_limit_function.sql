drop policy if exists "Public can read claims" on public.evidence_claims;
drop policy if exists "Public can read approved claims" on public.evidence_claims;
create policy "Public can read approved claims"
  on public.evidence_claims for select to anon, authenticated
  using (review_status = 'approved');

create or replace function public.gcc_claim_ai_request_slot(operation_name text)
returns boolean language plpgsql security definer
set search_path = pg_catalog, public, auth
as $$
declare
  requesting_user uuid := auth.uid();
  allowed_requests integer;
  current_count integer;
begin
  if requesting_user is null then raise exception 'authentication required'; end if;
  allowed_requests := case operation_name
    when 'report_generation' then 3
    when 'report_chat' then 10
    when 'source_ingestion' then 3
    else null
  end;
  if allowed_requests is null then raise exception 'unsupported operation'; end if;
  perform pg_advisory_xact_lock(hashtextextended(requesting_user::text || ':' || operation_name, 0));
  delete from public.gcc_ai_request_events
    where user_id = requesting_user and operation = operation_name
      and requested_at < now() - interval '1 day';
  select count(*)::integer into current_count from public.gcc_ai_request_events
    where user_id = requesting_user and operation = operation_name
      and requested_at >= now() - interval '1 minute';
  if current_count >= allowed_requests then return false; end if;
  insert into public.gcc_ai_request_events(user_id, operation) values (requesting_user, operation_name);
  return true;
end;
$$;
revoke all on function public.gcc_claim_ai_request_slot(text) from public, anon;
grant execute on function public.gcc_claim_ai_request_slot(text) to authenticated;
