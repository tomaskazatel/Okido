import { useState } from 'react'
import type { CheckinMode } from '@/lib/constants'
import { CHECKIN } from '@/lib/copy'
import { cn } from '@/lib/utils'

const modeKeys: CheckinMode[] = ['ok', 'uncertain', 'crisis']

const modeColors: Record<CheckinMode, { active: string; ring: string; dot: string }> = {
  ok: {
    active: 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400',
    ring: 'ring-emerald-500/30',
    dot: 'bg-emerald-400',
  },
  uncertain: {
    active: 'bg-amber-500/15 border-amber-500/50 text-amber-400',
    ring: 'ring-amber-500/30',
    dot: 'bg-amber-400',
  },
  crisis: {
    active: 'bg-red-500/15 border-red-500/50 text-red-400',
    ring: 'ring-red-500/30',
    dot: 'bg-red-400',
  },
}

const modeLabels: Record<CheckinMode, string> = {
  ok: CHECKIN.modeOk,
  uncertain: CHECKIN.modeUncertain,
  crisis: CHECKIN.modeCrisis,
}

interface ModeSelectorProps {
  selected: CheckinMode
  onSelect: (mode: CheckinMode) => void
}

export function ModeSelector({ selected, onSelect }: ModeSelectorProps) {
  const [confirmingCrisis, setConfirmingCrisis] = useState(false)

  const handleSelect = (mode: CheckinMode) => {
    if (mode === 'crisis' && selected !== 'crisis') {
      setConfirmingCrisis(true)
      return
    }
    onSelect(mode)
  }

  const confirmCrisis = () => {
    setConfirmingCrisis(false)
    onSelect('crisis')
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {modeKeys.map((mode) => {
          const isActive = selected === mode
          const colors = modeColors[mode]
          return (
            <button
              key={mode}
              type="button"
              onClick={() => handleSelect(mode)}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-sm font-medium transition-all cursor-pointer',
                isActive
                  ? `${colors.active} ring-2 ${colors.ring}`
                  : 'border-white/[0.06] text-white/40 hover:border-white/[0.12] hover:text-white/60',
              )}
            >
              <span className={cn('h-2.5 w-2.5 rounded-full', isActive ? colors.dot : 'bg-white/20')} />
              {modeLabels[mode]}
            </button>
          )
        })}
      </div>

      {/* Crisis confirmation modal */}
      {confirmingCrisis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6">
          <div className="w-full max-w-sm rounded-2xl bg-navy-800 border border-white/[0.06] p-6 space-y-4">
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <h3 className="text-lg font-semibold text-white">{modeLabels.crisis}</h3>
            </div>
            <p className="text-sm text-white/50">{CHECKIN.crisisConfirm}</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmingCrisis(false)}
                className="flex-1 rounded-lg border border-white/[0.06] px-4 py-2.5 text-sm font-medium text-white/60 hover:bg-white/[0.03] transition-colors cursor-pointer"
              >
                {CHECKIN.cancelButton}
              </button>
              <button
                type="button"
                onClick={confirmCrisis}
                className="flex-1 rounded-lg bg-red-500/15 border border-red-500/30 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/25 transition-colors cursor-pointer"
              >
                {CHECKIN.crisisConfirmButton}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
