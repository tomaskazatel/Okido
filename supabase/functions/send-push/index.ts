// Supabase Edge Function: send-push
// Sends Web Push notifications using web-push via Deno npm compat

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webpush from 'npm:web-push@3.6.7'

const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') || 'mailto:hello@okido.app'

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

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
        const pushSub = sub.subscription as {
          endpoint: string
          keys: { p256dh: string; auth: string }
        }

        await webpush.sendNotification(pushSub, payload)
        sent++
      } catch (err: any) {
        if (err?.statusCode === 410 || err?.statusCode === 404) {
          expiredIds.push(sub.id)
        } else {
          console.error(`Push failed for ${sub.id}:`, err?.body || err?.message)
        }
      }
    }

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
