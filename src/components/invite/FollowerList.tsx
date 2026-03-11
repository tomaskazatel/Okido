import type { Follower } from '@/hooks/useFollows'
import { cn } from '@/lib/utils'
import { timeAgo } from '@/lib/utils'

interface FollowerListProps {
  followers: Follower[]
  loading: boolean
  onAccept: (id: string) => Promise<{ error: string | null }>
  onDecline: (id: string) => Promise<{ error: string | null }>
  onRemove: (id: string) => Promise<{ error: string | null }>
}

export function FollowerList({ followers, loading, onAccept, onDecline, onRemove }: FollowerListProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-white/[0.03]" />
        ))}
      </div>
    )
  }

  const pending = followers.filter((f) => f.status === 'pending')
  const active = followers.filter((f) => f.status === 'active')

  if (followers.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-white/30">No followers yet.</p>
    )
  }

  return (
    <div className="space-y-5">
      {/* Pending */}
      {pending.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-medium text-white/30 uppercase tracking-wider">
            Pending ({pending.length})
          </h3>
          <div className="space-y-2">
            {pending.map((follower) => (
              <div
                key={follower.id}
                className="flex items-center justify-between rounded-xl border border-amber-500/10 bg-amber-500/[0.03] px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-white/70">
                    {follower.profile.display_name || 'Anonymous'}
                  </p>
                  <p className="text-[11px] text-white/25">{timeAgo(follower.created_at)}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onDecline(follower.id)}
                    className="rounded-lg border border-white/[0.06] px-3 py-1.5 text-xs font-medium text-white/40 hover:text-white/60 hover:border-white/[0.12] transition-colors cursor-pointer"
                  >
                    Decline
                  </button>
                  <button
                    type="button"
                    onClick={() => onAccept(follower.id)}
                    className="rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/25 transition-colors cursor-pointer"
                  >
                    Accept
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active */}
      {active.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-medium text-white/30 uppercase tracking-wider">
            Active ({active.length})
          </h3>
          <div className="space-y-2">
            {active.map((follower) => (
              <div
                key={follower.id}
                className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-white/70">
                    {follower.profile.display_name || 'Anonymous'}
                  </p>
                  <p className="text-[11px] text-white/25">Following since {timeAgo(follower.created_at)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(follower.id)}
                  className="rounded-lg border border-white/[0.06] px-3 py-1.5 text-xs font-medium text-red-400/60 hover:text-red-400 hover:border-red-500/20 transition-colors cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
