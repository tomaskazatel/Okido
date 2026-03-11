import { supabase } from './supabase'

const VAPID_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string

/** Convert VAPID public key from base64 to Uint8Array */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

/** Check if push notifications are supported */
export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

/** Check if running as installed PWA (standalone) */
export function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true
  )
}

/** Check if iOS Safari (needs Add to Home Screen for push) */
export function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
}

/** Get current notification permission */
export function getPermissionState(): NotificationPermission {
  if (!isPushSupported()) return 'denied'
  return Notification.permission
}

/** Request push permission and subscribe */
export async function subscribeToPush(userId: string): Promise<{ error: string | null }> {
  if (!isPushSupported()) return { error: 'Push notifications not supported' }
  if (!VAPID_KEY) return { error: 'VAPID key not configured' }

  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return { error: 'Permission denied' }

    const registration = await navigator.serviceWorker.ready
    let subscription = await registration.pushManager.getSubscription()

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_KEY),
      })
    }

    // Save to Supabase
    const { error } = await supabase.from('push_subscriptions').upsert(
      {
        user_id: userId,
        subscription: subscription.toJSON(),
      },
      { onConflict: 'user_id' },
    )

    if (error) return { error: error.message }
    return { error: null }
  } catch (err: any) {
    return { error: err?.message || 'Failed to subscribe' }
  }
}

/** Unsubscribe from push */
export async function unsubscribeFromPush(userId: string): Promise<{ error: string | null }> {
  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    if (subscription) await subscription.unsubscribe()

    await supabase.from('push_subscriptions').delete().eq('user_id', userId)
    return { error: null }
  } catch (err: any) {
    return { error: err?.message || 'Failed to unsubscribe' }
  }
}
