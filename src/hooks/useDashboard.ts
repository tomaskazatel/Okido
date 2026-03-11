import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { CheckinMode } from '@/lib/constants'

export interface DashboardEntry {
  follow_id: string
  following_id: string
  display_name: string | null
  avatar_url: string | null
  latest_mode: CheckinMode | null
  latest_message: string | null
  latest_checkin_at: string | null
  is_overdue: boolean
  sort_priority: number
}

export function useDashboard() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<DashboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!user) return
    const { data } = await supabase.rpc('get_dashboard_data', {
      p_follower_id: user.id,
    })
    if (data) setEntries(data as DashboardEntry[])
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { entries, loading, refetch: fetch }
}

export function useFolloweeHistory(followingId: string | undefined) {
  const [history, setHistory] = useState<{
    id: string
    mode: CheckinMode
    message: string | null
    created_at: string
  }[]>([])
  const [profile, setProfile] = useState<{ display_name: string | null; avatar_url: string | null } | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const PAGE_SIZE = 20

  const fetchPage = useCallback(async (pageNum: number) => {
    if (!followingId) return
    const { data } = await supabase
      .from('check_ins')
      .select('id, mode, message, created_at')
      .eq('user_id', followingId)
      .order('created_at', { ascending: false })
      .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1)
    if (data) {
      if (pageNum === 0) {
        setHistory(data as any)
      } else {
        setHistory((prev) => [...prev, ...(data as any)])
      }
      setHasMore(data.length === PAGE_SIZE)
    }
    setLoading(false)
  }, [followingId])

  const fetchProfile = useCallback(async () => {
    if (!followingId) return
    const { data } = await supabase
      .from('profiles')
      .select('display_name, avatar_url')
      .eq('id', followingId)
      .single()
    if (data) setProfile(data)
  }, [followingId])

  useEffect(() => {
    Promise.all([fetchPage(0), fetchProfile()])
  }, [fetchPage, fetchProfile])

  const loadMore = () => {
    const next = page + 1
    setPage(next)
    fetchPage(next)
  }

  return { history, profile, loading, hasMore, loadMore }
}
