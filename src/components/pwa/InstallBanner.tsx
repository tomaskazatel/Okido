import { useState, useEffect } from 'react'
import { NOTIFICATIONS } from '@/lib/copy'
import { isIOS, isStandalone } from '@/lib/push'

export function InstallBanner() {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Show only on iOS Safari, not standalone, and not previously dismissed
    if (isIOS() && !isStandalone() && !sessionStorage.getItem('install-banner-dismissed')) {
      // Delay show until 2nd page view
      const views = parseInt(sessionStorage.getItem('page-views') || '0', 10) + 1
      sessionStorage.setItem('page-views', String(views))
      if (views >= 2) setVisible(true)
    }
  }, [])

  const dismiss = () => {
    setDismissed(true)
    sessionStorage.setItem('install-banner-dismissed', '1')
    setTimeout(() => setVisible(false), 300)
  }

  if (!visible) return null

  return (
    <div
      className={`fixed bottom-20 left-4 right-4 z-40 transition-all duration-300 ${
        dismissed ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'
      }`}
    >
      <div className="mx-auto max-w-lg rounded-2xl border border-white/[0.08] bg-navy-800/95 backdrop-blur-xl p-4 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 shrink-0 rounded-lg bg-emerald-500/10 p-2">
            <svg className="h-5 w-5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white">Add to Home Screen</p>
            <p className="mt-0.5 text-xs text-white/40">{NOTIFICATIONS.iosPrompt}</p>
            <div className="mt-2 flex items-center gap-1 text-xs text-white/50">
              <span>Tap</span>
              <svg className="h-4 w-4 text-blue-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3V15" />
              </svg>
              <span>then "Add to Home Screen"</span>
            </div>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="shrink-0 rounded-lg p-1 text-white/30 hover:text-white/50 transition-colors cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
