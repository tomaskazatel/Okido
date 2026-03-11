-- ============================================================
-- Okido — Self-reminder: notify user 15 min before check-in deadline
-- ============================================================

-- Find users whose check-in deadline is within the next 15 minutes
-- (but not yet overdue — those are handled by get_overdue_users)
create or replace function public.get_soon_due_users()
returns table (
  user_id uuid,
  display_name text,
  mode text,
  last_checkin_at timestamptz,
  deadline_at timestamptz
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
    -- Only users who have push subscriptions (they can receive self-push)
    where exists (
      select 1 from push_subscriptions ps where ps.user_id = ci.user_id
    )
    order by ci.user_id, ci.created_at desc
  ),
  with_deadline as (
    select
      l.*,
      l.last_checkin_at + case l.mode
        when 'ok' then interval '24 hours'
        when 'uncertain' then interval '12 hours'
        when 'crisis' then interval '3 hours'
      end as deadline_at
    from latest l
  )
  select * from with_deadline
  where
    -- Deadline is within the next 15 minutes (soon due but not yet overdue)
    deadline_at > now()
    and deadline_at <= now() + interval '15 minutes';
$$;
