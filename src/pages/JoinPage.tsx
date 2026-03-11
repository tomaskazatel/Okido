import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useJoinByToken } from '@/hooks/useFollows'

type JoinState = 'loading' | 'success' | 'pending' | 'error' | 'login-required'

export default function JoinPage() {
  const { token } = useParams<{ token: string }>()
  const { session, loading: authLoading } = useAuth()
  const { joinByToken } = useJoinByToken()
  const [state, setState] = useState<JoinState>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!token) {
      setState('error')
      setMessage('Invalid invite link.')
      return
    }
    if (!session) {
      setState('login-required')
      return
    }

    // Attempt to join
    joinByToken(token).then((result) => {
      if (result.error) {
        setState('error')
        setMessage(result.error)
      } else if (result.autoApproved) {
        setState('success')
      } else {
        setState('pending')
      }
    })
  }, [token, session, authLoading])

  if (authLoading || state === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
      </div>
    )
  }

  if (state === 'login-required') {
    return <Navigate to={`/app/register?invite=${token}`} replace />
  }

  const icon =
    state === 'success' ? (
      <svg className="h-6 w-6 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ) : state === 'pending' ? (
      <svg className="h-6 w-6 text-amber-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ) : (
      <svg className="h-6 w-6 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9.303 3.376c-.866 1.5.217 3.374 1.948 3.374H4.354c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    )

  const title =
    state === 'success'
      ? "You're now following!"
      : state === 'pending'
        ? 'Follow request sent'
        : 'Oops'

  const subtitle =
    state === 'success'
      ? "You'll see their check-ins on your dashboard."
      : state === 'pending'
        ? "You'll be notified once they approve your request."
        : message

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-sm text-center space-y-4">
        <div className="mx-auto h-12 w-12 rounded-full bg-white/[0.05] flex items-center justify-center">
          {icon}
        </div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <p className="text-sm text-white/40">{subtitle}</p>
        <Link
          to="/app/dashboard"
          className="inline-block text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  )
}
