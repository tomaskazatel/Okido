import { useState } from 'react'
import { usePush } from '@/hooks/usePush'

/**
 * Inline banner prompting user to enable push notifications.
 * Shows after first check-in, dismissable, remembers dismissal per session.
 */
export function PushPrompt() {
  const { supported, needsInstall, permission, subscribing, subscribe } = usePush()
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem('push-prompt-dismissed') === '1',
  )

  // Don't show if: dismissed, already granted, denied (can't ask again), not supported, or iOS needs install
  if (dismissed || permission === 'granted' || permission === 'denied' || !supported || needsInstall) {
    return null
  }

  const dismiss = () => {
    setDismissed(true)
    sessionStorage.setItem('push-prompt-dismissed', '1')
  }

  const handleEnable = async () => {
    await subscribe()
    dismiss()
  }

  return (
    <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.04] p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0 rounded-lg bg-emerald-500/10 p-1.5">
          <svg className="h-4 w-4 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white/80">Stay in the loop</p>
          <p className="mt-0.5 text-xs text-white/40">
            Get notified when someone you follow misses a check-in or switches to crisis mode.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={handleEnable}
              disabled={subscribing}
              className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-navy-950 hover:bg-emerald-400 transition-colors cursor-pointer disabled:opacity-50"
            >
              {subscribing ? 'Enabling...' : 'Enable notifications'}
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-white/30 hover:text-white/50 transition-colors cursor-pointer"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
