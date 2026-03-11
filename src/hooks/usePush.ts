import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import {
  isPushSupported,
  getPermissionState,
  subscribeToPush,
  unsubscribeFromPush,
  isIOS,
  isStandalone,
} from '@/lib/push'

export function usePush() {
  const { user } = useAuth()
  const [permission, setPermission] = useState<NotificationPermission>(() => getPermissionState())
  const [subscribing, setSubscribing] = useState(false)
  const [dbSubscribed, setDbSubscribed] = useState(false)
  const supported = isPushSupported()
  const needsInstall = isIOS() && !isStandalone()

  // Check if user has a push subscription in DB
  useEffect(() => {
    if (!user || !supported) return
    supabase
      .from('push_subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        setDbSubscribed(!!data)
      })
  }, [user, supported])

  // Refresh permission state when it might change
  useEffect(() => {
    if (!supported) return
    const check = () => setPermission(Notification.permission)
    document.addEventListener('visibilitychange', check)
    return () => document.removeEventListener('visibilitychange', check)
  }, [supported])

  const subscribe = async () => {
    if (!user || subscribing) return { error: 'Not ready' }
    setSubscribing(true)
    const result = await subscribeToPush(user.id)
    setPermission(getPermissionState())
    if (!result.error) setDbSubscribed(true)
    setSubscribing(false)
    return result
  }

  const unsubscribe = async () => {
    if (!user) return { error: 'Not ready' }
    const result = await unsubscribeFromPush(user.id)
    setPermission(getPermissionState())
    if (!result.error) setDbSubscribed(false)
    return result
  }

  const isSubscribed = permission === 'granted' && dbSubscribed

  return {
    supported,
    needsInstall,
    permission,
    subscribing,
    subscribe,
    unsubscribe,
    isSubscribed,
  }
}
