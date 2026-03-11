import { Link, useSearchParams } from 'react-router-dom'
import { MODE_CONFIG, type CheckinMode } from '@/lib/constants'
import { timeAgo } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { useFolloweeHistory } from '@/hooks/useDashboard'
import { Button } from '@/components/ui/Button'

const dotColors: Record<CheckinMode, string> = {
  ok: 'bg-emerald-400',
  uncertain: 'bg-amber-400',
  crisis: 'bg-red-400',
}

export default function FolloweeDetailPage() {
  const [searchParams] = useSearchParams()
  const uid = searchParams.get('uid') ?? undefined
  const { history, profile, loading, hasMore, loadMore } = useFolloweeHistory(uid)

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-32 animate-pulse rounded bg-white/[0.05]" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-white/[0.03]" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Back + name */}
      <div className="flex items-center gap-3">
        <Link
          to="/app/dashboard"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] text-white/40 hover:text-white/60 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="text-lg font-semibold text-white">
          {profile?.display_name || 'Anonymous'}
        </h1>
      </div>

      {/* History */}
      {history.length === 0 ? (
        <p className="py-12 text-center text-sm text-white/30">No check-ins yet.</p>
      ) : (
        <div className="space-y-2">
          {history.map((entry) => {
            const config = MODE_CONFIG[entry.mode]
            return (
              <div
                key={entry.id}
                className="flex items-start gap-3 rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3"
              >
                <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', dotColors[entry.mode])} />
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
      )}

      {hasMore && history.length > 0 && (
        <Button variant="ghost" onClick={loadMore} className="w-full">
          Load more
        </Button>
      )}
    </div>
  )
}
