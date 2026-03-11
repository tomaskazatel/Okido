import { useState, useEffect, useRef } from 'react'
import { MODE_CONFIG, type CheckinMode } from '@/lib/constants'
import { CHECKIN } from '@/lib/copy'
import { cn } from '@/lib/utils'

const COOLDOWN_MS = 60_000 // 1 minute

const buttonColors: Record<CheckinMode, string> = {
  ok: 'bg-emerald-500 hover:bg-emerald-400 text-navy-950',
  uncertain: 'bg-amber-500 hover:bg-amber-400 text-navy-950',
  crisis: 'bg-red-500 hover:bg-red-400 text-white',
}

interface CheckinButtonProps {
  mode: CheckinMode
  onCheckin: () => Promise<void>
  disabled?: boolean
}

export function CheckinButton({ mode, onCheckin, disabled }: CheckinButtonProps) {
  const [submitting, setSubmitting] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const startCooldown = () => {
    setCooldown(COOLDOWN_MS)
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1000) {
          if (timerRef.current) clearInterval(timerRef.current)
          return 0
        }
        return prev - 1000
      })
    }, 1000)
  }

  const handleClick = async () => {
    if (submitting || cooldown > 0) return
    setSubmitting(true)
    await onCheckin()
    setSubmitting(false)
    startCooldown()
  }

  const isDisabled = disabled || submitting || cooldown > 0
  const cooldownSec = Math.ceil(cooldown / 1000)

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
      className={cn(
        'w-full rounded-2xl py-5 text-lg font-semibold transition-all cursor-pointer',
        'disabled:opacity-50 disabled:pointer-events-none',
        'active:scale-[0.98]',
        buttonColors[mode],
      )}
    >
      {submitting ? (
        <span className="inline-flex items-center gap-2">
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Sending...
        </span>
      ) : cooldown > 0 ? (
        `${CHECKIN.button} (${cooldownSec}s)`
      ) : (
        CHECKIN.button
      )}
    </button>
  )
}
