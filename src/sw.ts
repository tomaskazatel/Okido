/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching'

declare const self: ServiceWorkerGlobalScope

// Precache app shell assets injected by VitePWA
precacheAndRoute(self.__WB_MANIFEST)

// Push notification handler
self.addEventListener('push', (event) => {
  if (!event.data) return

  const data = event.data.json() as {
    title?: string
    body?: string
    url?: string
    tag?: string
  }

  const title = data.title || 'Okido'
  const options: NotificationOptions = {
    body: data.body || '',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: data.tag || 'okido-notification',
    data: { url: data.url || '/app/dashboard' },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

// Notification click → open app at the right page
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const url = (event.notification.data?.url as string) || '/app/dashboard'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Focus existing window if open
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus()
          client.navigate(url)
          return
        }
      }
      // Otherwise open new window
      return self.clients.openWindow(url)
    }),
  )
})
