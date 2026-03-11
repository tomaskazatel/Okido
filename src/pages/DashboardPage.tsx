import { Link } from 'react-router-dom'
import { DASHBOARD } from '@/lib/copy'
import { useDashboard } from '@/hooks/useDashboard'
import { FolloweeCard } from '@/components/dashboard/FolloweeCard'

export default function DashboardPage() {
  const { entries, loading } = useDashboard()

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-white">{DASHBOARD.title}</h1>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-white/[0.03]" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="py-16 text-center space-y-3">
          <p className="text-sm text-white/30">{DASHBOARD.empty}</p>
          <Link
            to="/app/invite"
            className="inline-block text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            {DASHBOARD.emptyCta}
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <FolloweeCard key={entry.follow_id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  )
}
