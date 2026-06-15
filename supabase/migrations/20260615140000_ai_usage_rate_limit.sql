-- =============================================================================
-- AI usage rate limiting
-- =============================================================================
-- Protects the project's Gemini quota / cost by capping how many decks a single
-- user can generate per day. A small per-user/per-day counter is bumped
-- atomically by a SECURITY DEFINER function the edge function calls.
-- =============================================================================

create table if not exists public.ai_usage (
  user_id    uuid    not null references auth.users (id) on delete cascade,
  usage_date date    not null default (now() at time zone 'utc')::date,
  count      integer not null default 0,
  primary key (user_id, usage_date)
);

alter table public.ai_usage enable row level security;

-- Users may read their own usage (e.g. to show "X generations left today").
drop policy if exists "ai_usage_select_own" on public.ai_usage;
create policy "ai_usage_select_own"
  on public.ai_usage
  for select
  using (auth.uid() = user_id);

-- Atomically increment today's counter for the calling user and report whether
-- the request is still within the daily limit. Runs as definer so it can write
-- the row regardless of the (read-only) RLS policy above.
create or replace function public.bump_ai_usage(p_limit integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_today date := (now() at time zone 'utc')::date;
  v_count integer;
begin
  if v_uid is null then
    return false; -- not signed in -> never allowed
  end if;

  insert into public.ai_usage (user_id, usage_date, count)
  values (v_uid, v_today, 1)
  on conflict (user_id, usage_date)
  do update set count = public.ai_usage.count + 1
  returning count into v_count;

  return v_count <= p_limit;
end;
$$;

revoke all on function public.bump_ai_usage(integer) from public;
grant execute on function public.bump_ai_usage(integer) to authenticated;
