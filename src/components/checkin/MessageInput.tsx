import { MESSAGE_MAX_LENGTH } from '@/lib/constants'
import { CHECKIN } from '@/lib/copy'
import { cn } from '@/lib/utils'

interface MessageInputProps {
  value: string
  onChange: (value: string) => void
}

const WARN_THRESHOLD = 120

export function MessageInput({ value, onChange }: MessageInputProps) {
  const remaining = MESSAGE_MAX_LENGTH - value.length
  const isWarning = remaining <= MESSAGE_MAX_LENGTH - WARN_THRESHOLD
  const isOver = remaining < 0

  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, MESSAGE_MAX_LENGTH))}
        placeholder={CHECKIN.messagePlaceholder}
        rows={2}
        maxLength={MESSAGE_MAX_LENGTH}
        className="w-full resize-none rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-white/[0.12]"
      />
      {value.length > 0 && (
        <span
          className={cn(
            'absolute bottom-2 right-3 text-xs tabular-nums',
            isOver ? 'text-red-500' : isWarning ? 'text-red-400' : 'text-white/20',
          )}
        >
          {remaining}
        </span>
      )}
    </div>
  )
}
