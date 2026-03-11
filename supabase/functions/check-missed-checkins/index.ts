// Supabase Edge Function: check-missed-checkins
// Cron job (every 15 min) to find overdue users and notify their followers
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

    // Find users whose latest check-in is overdue based on their mode interval
    const { data: overdueUsers, error } = await supabase.rpc('get_overdue_users')

    if (error) {
      console.error('Error fetching overdue users:', error.message)
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }

    if (!overdueUsers?.length) {
      return new Response(JSON.stringify({ notified: 0, message: 'No overdue users' }))
    }

    let totalNotified = 0

    for (const user of overdueUsers) {
      // Get followers who want missed notifications
      const { data: followers } = await supabase
        .from('follow_settings')
        .select('follower_id')
        .eq('following_id', user.user_id)
        .eq('notify_on_missed', true)

      if (!followers?.length) continue

      const followerIds = followers.map((f: any) => f.follower_id)

      // Call send-push function
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
        totalNotified += followerIds.length
      }
    }

    return new Response(
      JSON.stringify({ notified: totalNotified, overdue_users: overdueUsers.length }),
    )
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
