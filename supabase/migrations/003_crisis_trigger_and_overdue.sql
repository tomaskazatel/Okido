-- ============================================================
-- Okido — Phase 5: Crisis trigger + overdue users function
-- ============================================================

-- Function to find overdue users (used by check-missed-checkins cron)
create or replace function public.get_overdue_users()
returns table (
  user_id uuid,
  display_name text,
  mode text,
  last_checkin_at timestamptz
)
language sql
stable
security definer
as $$
  select distinct on (ci.user_id)
    ci.user_id,
    p.display_name,
    ci.mode,
    ci.created_at as last_checkin_at
  from check_ins ci
  join profiles p on p.id = ci.user_id
  where
    -- Only users who have active followers
    exists (
      select 1 from follows f
      where f.following_id = ci.user_id and f.status = 'active'
    )
  order by ci.user_id, ci.created_at desc
$$;

-- Wrap the above to filter only actually overdue
-- (can't use window + filter in one pass cleanly, so wrap it)
create or replace function public.get_overdue_users()
returns table (
  user_id uuid,
  display_name text,
  mode text,
  last_checkin_at timestamptz
)
language sql
stable
security definer
as $$
  with latest as (
    select distinct on (ci.user_id)
      ci.user_id,
      p.display_name,
      ci.mode,
      ci.created_at as last_checkin_at
    from check_ins ci
    join profiles p on p.id = ci.user_id
    where exists (
      select 1 from follows f
      where f.following_id = ci.user_id and f.status = 'active'
    )
    order by ci.user_id, ci.created_at desc
  )
  select * from latest
  where
    (mode = 'ok' and last_checkin_at < now() - interval '24 hours')
    or (mode = 'uncertain' and last_checkin_at < now() - interval '12 hours')
    or (mode = 'crisis' and last_checkin_at < now() - interval '3 hours');
$$;

-- Crisis trigger: when a crisis check-in is inserted, notify followers immediately
-- Uses pg_net to call the send-push edge function
-- NOTE: pg_net must be enabled in Supabase dashboard (Extensions)

create or replace function public.handle_crisis_checkin()
returns trigger as $$
declare
  v_follower_ids uuid[];
  v_display_name text;
  v_supabase_url text;
  v_service_key text;
begin
  -- Only fire for crisis mode
  if new.mode != 'crisis' then
    return new;
  end if;

  -- Get follower IDs with crisis notifications enabled
  select array_agg(fs.follower_id)
  into v_follower_ids
  from follow_settings fs
  join follows f on f.follower_id = fs.follower_id and f.following_id = fs.following_id
  where fs.following_id = new.user_id
    and fs.notify_on_crisis = true
    and f.status = 'active';

  if v_follower_ids is null or array_length(v_follower_ids, 1) is null then
    return new;
  end if;

  -- Get display name
  select display_name into v_display_name
  from profiles where id = new.user_id;

  -- Call send-push via pg_net
  -- The URL will be: <SUPABASE_URL>/functions/v1/send-push
  perform net.http_post(
    url := current_setting('app.supabase_url', true) || '/functions/v1/send-push',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key', true)
    ),
    body := jsonb_build_object(
      'user_ids', to_jsonb(v_follower_ids),
      'title', 'Crisis Alert',
      'body', coalesce(v_display_name, 'Someone') || ' switched to Crisis mode.',
      'url', '/app/dashboard',
      'tag', 'crisis-' || new.user_id::text
    )
  );

  return new;
end;
$$ language plpgsql security definer;

-- Create trigger (drop first if exists for idempotency)
drop trigger if exists on_crisis_checkin on check_ins;
create trigger on_crisis_checkin
  after insert on check_ins
  for each row
  when (new.mode = 'crisis')
  execute function public.handle_crisis_checkin();
