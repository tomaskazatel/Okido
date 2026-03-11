-- Phase 0: Waitlist table for landing page email collection
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz default now()
);

alter table waitlist enable row level security;

-- Anyone can insert (anonymous waitlist signups)
create policy "Anyone can insert waitlist"
  on waitlist for insert
  with check (true);

-- No public reads (only service role can read)
create policy "No public reads"
  on waitlist for select
  using (false);
