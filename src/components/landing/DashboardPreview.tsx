import { LANDING } from '@/lib/copy'

const mockUsers = [
  {
    name: 'Sarah',
    mode: 'ok' as const,
    emoji: '\u{1F7E2}',
    label: 'All good',
    time: '2 hours ago',
    message: 'Made it to the hotel safely',
    borderColor: 'border-emerald-400',
    badgeColor: 'bg-emerald-400/10 text-emerald-400',
  },
  {
    name: 'Marco',
    mode: 'uncertain' as const,
    emoji: '\u{1F7E1}',
    label: 'Uncertain',
    time: '5 hours ago',
    message: 'Flight delayed, waiting at airport',
    borderColor: 'border-amber-400',
    badgeColor: 'bg-amber-400/10 text-amber-400',
  },
  {
    name: 'Aisha',
    mode: 'ok' as const,
    emoji: '\u{1F7E2}',
    label: 'All good',
    time: '30 min ago',
    message: '',
    borderColor: 'border-emerald-400',
    badgeColor: 'bg-emerald-400/10 text-emerald-400',
  },
]

export function DashboardPreview() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-md">
        <h2 className="text-center text-sm font-semibold uppercase tracking-widest text-emerald-400 mb-10">
          {LANDING.previewTitle}
        </h2>
        <div className="rounded-2xl bg-navy-900 border border-navy-700 p-4 space-y-3 shadow-2xl">
          {mockUsers.map((user) => (
            <div
              key={user.name}
              className={`rounded-xl bg-navy-800 border-l-4 ${user.borderColor} p-4`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-navy-700 flex items-center justify-center text-sm font-medium text-slate-300">
                    {user.name[0]}
                  </div>
                  <div>
                    <p className="font-medium text-white">{user.name}</p>
                    <p className="text-xs text-slate-400">{user.time}</p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${user.badgeColor}`}
                >
                  {user.emoji} {user.label}
                </span>
              </div>
              {user.message && (
                <p className="mt-2 text-sm text-slate-400 pl-12">
                  {user.message}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
