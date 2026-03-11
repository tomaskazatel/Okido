import { useEffect, useState } from 'react'
import { MODE_CONFIG, type CheckinMode } from '@/lib/constants'
import { CHECKIN } from '@/lib/copy'
import { cn } from '@/lib/utils'

interface NextCheckinDueProps {
  lastCheckinAt: string | null
  mode: CheckinMode
}

export function NextCheckinDue({ lastCheckinAt, mode }: NextCheckinDueProps) {
  const [now, setNow] = useState(() => new Date())

  // Tick every minute
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(interval)
  }, [])

  if (!lastCheckinAt) return null

  const intervalMs = MODE_CONFIG[mode].intervalHours * 60 * 60 * 1000
  const dueAt = new Date(new Date(lastCheckinAt).getTime() + intervalMs)
  const diffMs = dueAt.getTime() - now.getTime()
  const isOverdue = diffMs <= 0

  const formatRemaining = () => {
    if (isOverdue) return CHECKIN.overdue
    const totalMinutes = Math.floor(diffMs / 60_000)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm',
        isOverdue
          ? 'bg-red-500/10 border border-red-500/20 text-red-400'
          : 'bg-white/[0.02] border border-white/[0.04] text-white/40',
      )}
    >
      {isOverdue ? (
        <>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <span className="font-medium">{CHECKIN.overdue}</span>
        </>
      ) : (
        <>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            {CHECKIN.nextDue} <span className="font-medium text-white/60">{formatRemaining()}</span>
          </span>
        </>
      )}
    </div>
  )
}
