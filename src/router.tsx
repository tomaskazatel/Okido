import { createBrowserRouter, Navigate } from 'react-router-dom'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import OnboardingPage from '@/pages/OnboardingPage'
import CheckinPage from '@/pages/CheckinPage'
import DashboardPage from '@/pages/DashboardPage'
import InvitePage from '@/pages/InvitePage'
import SettingsPage from '@/pages/SettingsPage'
import JoinPage from '@/pages/JoinPage'
import FolloweeDetailPage from '@/pages/FolloweeDetailPage'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { AppShell } from '@/components/layout/AppShell'

export const router = createBrowserRouter([
  // Public
  { path: '/', element: <LandingPage /> },

  // Auth (public, redirect if logged in)
  { path: '/app/login', element: <LoginPage /> },
  { path: '/app/register', element: <RegisterPage /> },

  // Protected app routes
  {
    path: '/app',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <Navigate to="checkin" replace /> },
          { path: 'checkin', element: <CheckinPage /> },
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'dashboard/:followId', element: <FolloweeDetailPage /> },
          { path: 'invite', element: <InvitePage /> },
          { path: 'settings', element: <SettingsPage /> },
        ],
      },
      { path: 'onboarding', element: <OnboardingPage /> },
      { path: 'join/:token', element: <JoinPage /> },
    ],
  },
])
