import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { CheckinMode } from '@/lib/constants'
import { CHECKIN_HISTORY_LIMIT } from '@/lib/constants'

export interface CheckinRecord {
  id: string
  mode: CheckinMode
  message: string | null
  created_at: string
}

export function useCheckin() {
  const { user } = useAuth()
  const [history, setHistory] = useState<CheckinRecord[]>([])
  const [latest, setLatest] = useState<CheckinRecord | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchHistory = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('check_ins')
      .select('id, mode, message, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(CHECKIN_HISTORY_LIMIT)
    if (data) {
      setHistory(data as CheckinRecord[])
      setLatest((data[0] as CheckinRecord) ?? null)
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const createCheckin = async (mode: CheckinMode, message?: string) => {
    if (!user) return { error: 'Not authenticated' }
    const { error } = await supabase.from('check_ins').insert({
      user_id: user.id,
      mode,
      message: message?.trim() || null,
    })
    if (error) return { error: error.message }
    await fetchHistory()
    return { error: null }
  }

  return { history, latest, loading, createCheckin, refetch: fetchHistory }
}
