import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export interface InviteLink {
  id: string
  token: string
  auto_approve: boolean
  expires_at: string | null
  used_at: string | null
  created_at: string
}

export interface Follower {
  id: string
  follower_id: string
  status: 'pending' | 'active'
  created_at: string
  profile: {
    display_name: string | null
  }
}

export function useFollows() {
  const { user } = useAuth()
  const [inviteLinks, setInviteLinks] = useState<InviteLink[]>([])
  const [followers, setFollowers] = useState<Follower[]>([])
  const [loading, setLoading] = useState(true)

  const fetchInviteLinks = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('invite_links')
      .select('id, token, auto_approve, expires_at, used_at, created_at')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })
    if (data) setInviteLinks(data)
  }, [user])

  const fetchFollowers = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('follows')
      .select('id, follower_id, status, created_at, profile:profiles!follows_follower_id_fkey(display_name)')
      .eq('following_id', user.id)
      .order('created_at', { ascending: false })
    if (data) {
      setFollowers(
        data.map((row: any) => ({
          ...row,
          profile: row.profile ?? { display_name: null },
        })),
      )
    }
  }, [user])

  useEffect(() => {
    Promise.all([fetchInviteLinks(), fetchFollowers()]).then(() => setLoading(false))
  }, [fetchInviteLinks, fetchFollowers])

  const createInviteLink = async (autoApprove: boolean, expiresInHours: number | null) => {
    if (!user) return { error: 'Not authenticated' }
    const expiresAt = expiresInHours
      ? new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString()
      : null
    const { error } = await supabase.from('invite_links').insert({
      owner_id: user.id,
      auto_approve: autoApprove,
      expires_at: expiresAt,
    })
    if (error) return { error: error.message }
    await fetchInviteLinks()
    return { error: null }
  }

  const acceptFollower = async (followId: string) => {
    const { error } = await supabase
      .from('follows')
      .update({ status: 'active' })
      .eq('id', followId)
    if (error) return { error: error.message }
    await fetchFollowers()
    return { error: null }
  }

  const declineFollower = async (followId: string) => {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('id', followId)
    if (error) return { error: error.message }
    await fetchFollowers()
    return { error: null }
  }

  const removeFollower = async (followId: string) => {
    return declineFollower(followId)
  }

  return {
    inviteLinks,
    followers,
    loading,
    createInviteLink,
    acceptFollower,
    declineFollower,
    removeFollower,
    refetch: () => Promise.all([fetchInviteLinks(), fetchFollowers()]),
  }
}

/** Hook for JoinPage — handles token-based follow creation */
export function useJoinByToken() {
  const { user } = useAuth()

  const lookupInvite = async (token: string) => {
    const { data, error } = await supabase
      .from('invite_links')
      .select('id, owner_id, auto_approve, expires_at, used_at')
      .eq('token', token)
      .single()
    if (error || !data) return { invite: null, error: 'Invite link not found.' }
    if (data.used_at) return { invite: null, error: 'This invite link has already been used.' }
    if (data.expires_at && new Date(data.expires_at) < new Date())
      return { invite: null, error: 'This invite link has expired.' }
    return { invite: data, error: null }
  }

  const joinByToken = async (token: string) => {
    if (!user) return { error: 'Not authenticated' }
    const { invite, error: lookupError } = await lookupInvite(token)
    if (lookupError || !invite) return { error: lookupError }

    if (invite.owner_id === user.id) return { error: 'You cannot follow yourself.' }

    // Check if already following
    const { data: existing } = await supabase
      .from('follows')
      .select('id, status')
      .eq('follower_id', user.id)
      .eq('following_id', invite.owner_id)
      .maybeSingle()

    if (existing) {
      if (existing.status === 'active') return { error: 'You are already following this person.' }
      return { error: 'Your follow request is pending approval.' }
    }

    // Create follow
    const status = invite.auto_approve ? 'active' : 'pending'
    const { error: followError } = await supabase.from('follows').insert({
      follower_id: user.id,
      following_id: invite.owner_id,
      status,
    })
    if (followError) return { error: followError.message }

    // Mark invite as used
    await supabase
      .from('invite_links')
      .update({ used_at: new Date().toISOString() })
      .eq('id', invite.id)

    return { error: null, autoApproved: invite.auto_approve }
  }

  return { joinByToken, lookupInvite }
}
