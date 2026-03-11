import { Link } from 'react-router-dom'
import { MODE_CONFIG } from '@/lib/constants'
import { DASHBOARD } from '@/lib/copy'
import { timeAgo } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { DashboardEntry } from '@/hooks/useDashboard'

const borderColors: Record<string, string> = {
  ok: 'border-emerald-500/30',
  uncertain: 'border-amber-500/30',
  crisis: 'border-red-500/30',
}

const dotColors: Record<string, string> = {
  ok: 'bg-emerald-400',
  uncertain: 'bg-amber-400',
  crisis: 'bg-red-400',
}

interface FolloweeCardProps {
  entry: DashboardEntry
}

export function FolloweeCard({ entry }: FolloweeCardProps) {
  const mode = entry.latest_mode
  const config = mode ? MODE_CONFIG[mode] : null

  return (
    <Link
      to={`/app/dashboard/${entry.follow_id}?uid=${entry.following_id}`}
      className={cn(
        'block rounded-xl border px-4 py-3.5 transition-colors hover:bg-white/[0.02]',
        mode ? borderColors[mode] : 'border-white/[0.06]',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {mode && <span className={cn('h-2 w-2 shrink-0 rounded-full', dotColors[mode])} />}
            <span className="text-sm font-medium text-white truncate">
              {entry.display_name || 'Anonymous'}
            </span>
          </div>

          {config && (
            <p className="mt-1 text-xs text-white/40">
              {config.label}
              {entry.latest_message && (
                <span className="text-white/25"> — {entry.latest_message}</span>
              )}
            </p>
          )}

          {!mode && (
            <p className="mt-1 text-xs text-white/25">No check-ins yet</p>
          )}
        </div>

        <div className="shrink-0 text-right">
          {entry.latest_checkin_at && (
            <span className="text-[11px] text-white/25">{timeAgo(entry.latest_checkin_at)}</span>
          )}
          {entry.is_overdue && (
            <span className="mt-0.5 block text-[10px] font-medium text-red-400">
              Overdue
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
