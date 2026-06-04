-- APPROVAL-BASED REGISTRATION
-- New users can sign up, but stay PENDING until you approve them.
-- Run this in the Supabase SQL editor (after/with supabase-setup.sql).

-- 1) profiles table: one row per user with an approval flag
create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  approved   boolean not null default false,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

-- users may read ONLY their own profile (to check if they're approved)
drop policy if exists "read own profile" on profiles;
create policy "read own profile" on profiles
  for select to authenticated using (id = auth.uid());
-- (no insert/update policy for users → only you, via the dashboard/service role, can approve)

-- 2) auto-create a pending profile whenever someone signs up
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, approved)
  values (new.id, new.email, false)
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- 3) gate the synced data on approval too (defense in depth)
drop policy if exists "own rows" on user_data;
create policy "own rows" on user_data
  for all to authenticated
  using (user_id = auth.uid()::text
         and exists (select 1 from profiles p where p.id = auth.uid() and p.approved))
  with check (user_id = auth.uid()::text
         and exists (select 1 from profiles p where p.id = auth.uid() and p.approved));

-- ── HOW TO APPROVE A USER ────────────────────────────────────────────────
-- Supabase → Table Editor → profiles → set approved = true for that row, OR:
--   update profiles set approved = true where email = 'someone@example.com';
--
-- ⚠ APPROVE YOURSELF FIRST so you're not locked out:
--   update profiles set approved = true where email = 'YOUR_EMAIL_HERE';
-- (If your profile row doesn't exist yet, sign up once first, then run the update.)
