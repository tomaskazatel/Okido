const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined

/** Load gtag.js script once */
function loadGtag() {
  if (!GA_ID || document.querySelector(`script[src*="gtag/js"]`)) return

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(script)

  window.dataLayer = window.dataLayer || []
  window.gtag = function () {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments)
  }
  window.gtag('js', new Date())
  window.gtag('config', GA_ID, { send_page_view: false })
}

/** Track a page view (call on route change) */
export function trackPageView(path: string) {
  if (!GA_ID || !window.gtag) return
  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
  })
}

/** Track a custom event */
export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (!GA_ID || !window.gtag) return
  window.gtag('event', name, params)
}

/** Initialize analytics — call once at app startup */
export function initAnalytics() {
  loadGtag()
}

// Type augmentations
declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}
