import { useState } from 'react'
import type { CheckinMode } from '@/lib/constants'
import { useCheckin } from '@/hooks/useCheckin'
import { ModeSelector } from '@/components/checkin/ModeSelector'
import { CheckinButton } from '@/components/checkin/CheckinButton'
import { MessageInput } from '@/components/checkin/MessageInput'
import { CheckinHistory } from '@/components/checkin/CheckinHistory'
import { NextCheckinDue } from '@/components/checkin/NextCheckinDue'

export default function CheckinPage() {
  const { history, latest, loading, createCheckin } = useCheckin()
  const [mode, setMode] = useState<CheckinMode>(() => (latest?.mode as CheckinMode) ?? 'ok')
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Sync mode when latest check-in loads
  const latestMode = latest?.mode as CheckinMode | undefined
  const [syncedLatestId, setSyncedLatestId] = useState<string | null>(null)
  if (latest && latest.id !== syncedLatestId) {
    setSyncedLatestId(latest.id)
    if (latestMode) setMode(latestMode)
  }

  const handleCheckin = async () => {
    setError(null)
    const result = await createCheckin(mode, message)
    if (result.error) {
      setError(result.error)
    } else {
      setMessage('')
    }
  }

  return (
    <div className="space-y-6">
      <ModeSelector selected={mode} onSelect={setMode} />

      <MessageInput value={message} onChange={setMessage} />

      <CheckinButton mode={mode} onCheckin={handleCheckin} />

      {error && (
        <p className="text-center text-sm text-red-500">{error}</p>
      )}

      <NextCheckinDue lastCheckinAt={latest?.created_at ?? null} mode={mode} />

      <div className="pt-2">
        <h2 className="mb-3 text-sm font-medium text-white/30 uppercase tracking-wider">History</h2>
        <CheckinHistory history={history} loading={loading} />
      </div>
    </div>
  )
}
