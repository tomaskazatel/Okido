import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export function ProtectedRoute() {
  const { session, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
      </div>
    )
  }

  if (!session) {
    return <Navigate to={`/app/login?redirect=${encodeURIComponent(location.pathname)}`} replace />
  }

  // If profile exists but no display_name, redirect to onboarding
  if (profile && !profile.display_name && location.pathname !== '/app/onboarding') {
    return <Navigate to="/app/onboarding" replace />
  }

  return <Outlet />
}
