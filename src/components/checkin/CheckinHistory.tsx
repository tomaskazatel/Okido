import { MODE_CONFIG, type CheckinMode } from '@/lib/constants'
import { CHECKIN } from '@/lib/copy'
import { timeAgo } from '@/lib/utils'
import type { CheckinRecord } from '@/hooks/useCheckin'

const dotColors: Record<CheckinMode, string> = {
  ok: 'bg-emerald-400',
  uncertain: 'bg-amber-400',
  crisis: 'bg-red-400',
}

interface CheckinHistoryProps {
  history: CheckinRecord[]
  loading: boolean
}

export function CheckinHistory({ history, loading }: CheckinHistoryProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 animate-pulse rounded-xl bg-white/[0.03]" />
        ))}
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-white/30">{CHECKIN.noHistory}</p>
    )
  }

  return (
    <div className="space-y-2">
      {history.map((entry) => {
        const config = MODE_CONFIG[entry.mode]
        return (
          <div
            key={entry.id}
            className="flex items-start gap-3 rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3"
          >
            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dotColors[entry.mode]}`} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-white/70">{config.label}</span>
                <span className="shrink-0 text-xs text-white/25">{timeAgo(entry.created_at)}</span>
              </div>
              {entry.message && (
                <p className="mt-0.5 text-sm text-white/40 break-words">{entry.message}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
