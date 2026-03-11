-- ============================================================
-- Okido — Phase 4: Dashboard data function
-- ============================================================

-- Returns all followed users with their latest check-in and overdue status
-- Sorted: crisis → overdue → uncertain → ok
create or replace function public.get_dashboard_data(p_follower_id uuid)
returns table (
  follow_id uuid,
  following_id uuid,
  display_name text,
  avatar_url text,
  latest_mode text,
  latest_message text,
  latest_checkin_at timestamptz,
  is_overdue boolean,
  sort_priority int
)
language sql
stable
security definer
as $$
  select
    f.id as follow_id,
    f.following_id,
    p.display_name,
    p.avatar_url,
    ci.mode as latest_mode,
    ci.message as latest_message,
    ci.created_at as latest_checkin_at,
    -- overdue if last check-in exceeds mode interval
    case
      when ci.created_at is null then false
      when ci.mode = 'ok' and ci.created_at < now() - interval '24 hours' then true
      when ci.mode = 'uncertain' and ci.created_at < now() - interval '12 hours' then true
      when ci.mode = 'crisis' and ci.created_at < now() - interval '3 hours' then true
      else false
    end as is_overdue,
    -- sort: crisis=0, overdue=1, uncertain=2, ok=3, no-checkin=4
    case
      when ci.mode = 'crisis' then 0
      when ci.mode = 'ok' and ci.created_at < now() - interval '24 hours' then 1
      when ci.mode = 'uncertain' and ci.created_at < now() - interval '12 hours' then 1
      when ci.mode = 'crisis' and ci.created_at < now() - interval '3 hours' then 1
      when ci.mode = 'uncertain' then 2
      when ci.mode = 'ok' then 3
      when ci.mode is null then 4
      else 3
    end as sort_priority
  from follows f
  join profiles p on p.id = f.following_id
  left join lateral (
    select mode, message, created_at
    from check_ins
    where check_ins.user_id = f.following_id
    order by created_at desc
    limit 1
  ) ci on true
  where f.follower_id = p_follower_id
    and f.status = 'active'
  order by sort_priority asc, ci.created_at desc nulls last;
$$;
