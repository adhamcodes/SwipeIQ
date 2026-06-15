-- =============================================================================
-- Migration: Create the `user_state` cloud-backup table
-- =============================================================================
-- WHY THIS EXISTS:
--   The app keeps each user's decks, XP, streak and settings on their device for
--   speed. This table is a per-user cloud backup of that data so it survives a
--   reinstall and follows the user to a new phone. One small row per user.
--
--   Secured with RLS so each signed-in user can only touch their own row.
-- =============================================================================

create table if not exists public.user_state (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  state      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_state enable row level security;

drop policy if exists "Users can manage their own state" on public.user_state;

create policy "Users can manage their own state"
  on public.user_state
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
