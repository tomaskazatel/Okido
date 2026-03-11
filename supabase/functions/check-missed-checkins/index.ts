// Supabase Edge Function: check-missed-checkins
// Cron job (every 15 min) to:
//   1. Notify followers when a user is overdue
//   2. Self-remind users 15 min before their check-in deadline
//
// Deploy with: supabase functions deploy check-missed-checkins
// Schedule in Supabase dashboard: */15 * * * * (every 15 minutes)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async () => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    let totalNotifiedFollowers = 0
    let totalSelfReminders = 0

    // ─── 1. Notify followers about overdue users ───
    const { data: overdueUsers, error: overdueError } = await supabase.rpc('get_overdue_users')

    if (overdueError) {
      console.error('Error fetching overdue users:', overdueError.message)
    }

    if (overdueUsers?.length) {
      for (const user of overdueUsers) {
        const { data: followers } = await supabase
          .from('follow_settings')
          .select('follower_id')
          .eq('following_id', user.user_id)
          .eq('notify_on_missed', true)

        if (!followers?.length) continue

        const followerIds = followers.map((f: any) => f.follower_id)

        const { error: pushError } = await supabase.functions.invoke('send-push', {
          body: {
            user_ids: followerIds,
            title: 'Missed check-in',
            body: `${user.display_name || 'Someone'} hasn't checked in on time.`,
            url: '/app/dashboard',
            tag: `missed-${user.user_id}`,
          },
        })

        if (!pushError) {
          totalNotifiedFollowers += followerIds.length
        }
      }
    }

    // ─── 2. Self-remind users before deadline ───
    const { data: soonDueUsers, error: soonError } = await supabase.rpc('get_soon_due_users')

    if (soonError) {
      console.error('Error fetching soon-due users:', soonError.message)
    }

    if (soonDueUsers?.length) {
      for (const user of soonDueUsers) {
        const { error: pushError } = await supabase.functions.invoke('send-push', {
          body: {
            user_ids: [user.user_id],
            title: 'Time to check in ⏰',
            body: `Your check-in is due soon. Let them know you're okay.`,
            url: '/app/checkin',
            tag: `reminder-${user.user_id}`,
          },
        })

        if (!pushError) {
          totalSelfReminders++
        }
      }
    }

    return new Response(
      JSON.stringify({
        overdue_users: overdueUsers?.length ?? 0,
        notified_followers: totalNotifiedFollowers,
        self_reminders: totalSelfReminders,
      }),
    )
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
