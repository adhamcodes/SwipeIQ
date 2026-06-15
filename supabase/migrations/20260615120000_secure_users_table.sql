-- =============================================================================
-- Migration: Secure the `users` table with Row Level Security (RLS)
-- =============================================================================
-- WHY THIS EXISTS:
--   A security audit found that public.users had RLS DISABLED and no policy.
--   That meant the table's rows (personamode, currentstreak) were not protected
--   per-user. This migration enables RLS and adds a policy so that each signed-in
--   person can only read or modify THEIR OWN row.
--
--   The `decks` and `user_sync` tables were already correctly protected with
--   `auth.uid() = user_id`, so they are intentionally left untouched here.
-- =============================================================================

-- 1. Turn the "bouncer" ON for the users table.
alter table public.users enable row level security;

-- 2. Remove any old/duplicate policy with this name so re-running is safe.
drop policy if exists "Users can manage their own profile" on public.users;

-- 3. Add the guest list: a signed-in user may SELECT/INSERT/UPDATE/DELETE
--    only the row whose id matches their own authenticated id.
create policy "Users can manage their own profile"
  on public.users
  for all
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);
