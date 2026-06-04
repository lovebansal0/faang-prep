-- Run this ONCE in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- It creates the sync table and lets the anon key read/write it.

create table if not exists user_data (
  user_id    text primary key,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table user_data enable row level security;

-- Personal-use policy: the anon key may read/write any row.
-- Your security is the PRIVATE SYNC KEY (user_id) you choose in the tracker.
-- Keep that key private and don't share your anon key publicly.
drop policy if exists "anon full access" on user_data;
create policy "anon full access" on user_data
  for all to anon
  using (true) with check (true);
