// Supabase Edge Function: send-push
// Sends Web Push notifications to specified users
// Called by: crisis trigger (via pg_net), check-missed-checkins cron
//
// Expected payload:
// {
//   user_ids: string[],       // follower user IDs to notify
//   title: string,
//   body: string,
//   url?: string,             // deep link path
//   tag?: string              // notification grouping tag
// }

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') || 'mailto:hello@okido.app'

Deno.serve(async (req) => {
  try {
    const { user_ids, title, body, url, tag } = await req.json()

    if (!user_ids?.length) {
      return new Response(JSON.stringify({ error: 'No user_ids provided' }), { status: 400 })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Get push subscriptions for these users
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('id, user_id, subscription')
      .in('user_id', user_ids)

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }

    if (!subscriptions?.length) {
      return new Response(JSON.stringify({ sent: 0, message: 'No subscriptions found' }))
    }

    const payload = JSON.stringify({ title, body, url, tag })
    const expiredIds: string[] = []
    let sent = 0

    for (const sub of subscriptions) {
      try {
        // Use Web Push protocol
        const pushSub = sub.subscription as {
          endpoint: string
          keys: { p256dh: string; auth: string }
        }

        const response = await fetch(pushSub.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/octet-stream',
            TTL: '86400',
            // Note: In production, you'd use proper VAPID signing here
            // For now, we rely on the subscription being valid
          },
          body: payload,
        })

        if (response.status === 410 || response.status === 404) {
          // Subscription expired, mark for cleanup
          expiredIds.push(sub.id)
        } else if (response.ok) {
          sent++
        }
      } catch {
        // Individual send failure, continue
      }
    }

    // Clean up expired subscriptions
    if (expiredIds.length > 0) {
      await supabase.from('push_subscriptions').delete().in('id', expiredIds)
    }

    return new Response(
      JSON.stringify({ sent, expired_cleaned: expiredIds.length }),
    )
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
