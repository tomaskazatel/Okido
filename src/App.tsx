import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { router } from './router'
import { trackPageView } from '@/lib/analytics'

export default function App() {
  useEffect(() => {
    // Track initial page view
    trackPageView(window.location.pathname)

    // Track SPA route changes
    return router.subscribe((state) => {
      trackPageView(state.location.pathname)
    })
  }, [])

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}
