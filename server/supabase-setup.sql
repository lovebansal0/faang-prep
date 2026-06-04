-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- Creates the sync table and locks each row to its owner (per-user security).
-- Re-run it any time to update the policy.

create table if not exists user_data (
  user_id    text primary key,            -- = the logged-in user's auth UID
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table user_data enable row level security;

-- Remove the old permissive policy (if you ran the earlier version).
drop policy if exists "anon full access" on user_data;

-- Each authenticated user may read/write ONLY their own row.
-- auth.uid() comes from the logged-in session token the app sends.
drop policy if exists "own rows" on user_data;
create policy "own rows" on user_data
  for all
  to authenticated
  using (user_id = auth.uid()::text)
  with check (user_id = auth.uid()::text);
