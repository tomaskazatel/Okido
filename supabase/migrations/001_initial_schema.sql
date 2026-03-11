-- ============================================================
-- Okido — Phase 1: Full schema, RLS, triggers, indexes
-- ============================================================

-- PROFILES (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);

-- FOLLOWS
create table public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references profiles(id) on delete cascade,
  following_id uuid not null references profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','active')),
  created_at timestamptz default now(),
  unique(follower_id, following_id)
);

-- INVITE LINKS
create table public.invite_links (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  token text unique not null default encode(gen_random_bytes(16), 'hex'),
  auto_approve boolean default false,
  expires_at timestamptz,
  used_at timestamptz,
  created_at timestamptz default now()
);

-- CHECK-INS
create table public.check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  mode text not null check (mode in ('ok','uncertain','crisis')),
  message text check (char_length(message) <= 140),
  created_at timestamptz default now()
);

-- PUSH SUBSCRIPTIONS
create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  subscription jsonb not null,
  created_at timestamptz default now()
);

-- FOLLOW SETTINGS (per-follow notification prefs)
create table public.follow_settings (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references profiles(id) on delete cascade,
  following_id uuid not null references profiles(id) on delete cascade,
  notify_on_checkin boolean default false,
  notify_on_missed boolean default true,
  notify_on_crisis boolean default true,
  unique(follower_id, following_id)
);

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_check_ins_user_created on check_ins(user_id, created_at desc);
create index idx_follows_follower on follows(follower_id);
create index idx_follows_following on follows(following_id);
create index idx_invite_links_token on invite_links(token);
create index idx_push_subs_user on push_subscriptions(user_id);

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- profiles
alter table profiles enable row level security;
create policy "Anyone authenticated can read profiles"
  on profiles for select using (auth.role() = 'authenticated');
create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- follows
alter table follows enable row level security;
create policy "Users see follows involving them"
  on follows for select using (auth.uid() = follower_id or auth.uid() = following_id);
create policy "Users can create follow where they are follower"
  on follows for insert with check (auth.uid() = follower_id);
create policy "Followed user can update follow status"
  on follows for update using (auth.uid() = following_id);
create policy "Either party can delete follow"
  on follows for delete using (auth.uid() = follower_id or auth.uid() = following_id);

-- invite_links
alter table invite_links enable row level security;
create policy "Owner can manage own links"
  on invite_links for all using (auth.uid() = owner_id);
create policy "Anyone authenticated can read invite by token"
  on invite_links for select using (auth.role() = 'authenticated');

-- check_ins
alter table check_ins enable row level security;
create policy "Users can insert own check-ins"
  on check_ins for insert with check (auth.uid() = user_id);
create policy "Users can read own check-ins"
  on check_ins for select using (auth.uid() = user_id);
create policy "Active followers can read check-ins"
  on check_ins for select using (
    exists (
      select 1 from follows
      where follows.follower_id = auth.uid()
        and follows.following_id = check_ins.user_id
        and follows.status = 'active'
    )
  );

-- push_subscriptions
alter table push_subscriptions enable row level security;
create policy "Users manage own push subscriptions"
  on push_subscriptions for all using (auth.uid() = user_id);

-- follow_settings
alter table follow_settings enable row level security;
create policy "Follower can manage own settings"
  on follow_settings for all using (auth.uid() = follower_id);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', null),
    coalesce(new.raw_user_meta_data->>'avatar_url', null)
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-create follow_settings when follow becomes active
create or replace function public.handle_new_follow_settings()
returns trigger as $$
begin
  insert into public.follow_settings (follower_id, following_id)
  values (new.follower_id, new.following_id)
  on conflict (follower_id, following_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_follow_created
  after insert on follows
  for each row execute function public.handle_new_follow_settings();
