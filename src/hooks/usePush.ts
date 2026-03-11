import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
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
  const supported = isPushSupported()
  const needsInstall = isIOS() && !isStandalone()

  // Refresh permission state when it might change
  useEffect(() => {
    if (!supported) return
    const check = () => setPermission(Notification.permission)
    // Check on visibility change (user might have changed in settings)
    document.addEventListener('visibilitychange', check)
    return () => document.removeEventListener('visibilitychange', check)
  }, [supported])

  const subscribe = async () => {
    if (!user || subscribing) return { error: 'Not ready' }
    setSubscribing(true)
    const result = await subscribeToPush(user.id)
    setPermission(getPermissionState())
    setSubscribing(false)
    return result
  }

  const unsubscribe = async () => {
    if (!user) return { error: 'Not ready' }
    const result = await unsubscribeFromPush(user.id)
    setPermission(getPermissionState())
    return result
  }

  return {
    supported,
    needsInstall,
    permission,
    subscribing,
    subscribe,
    unsubscribe,
    isSubscribed: permission === 'granted',
  }
}
