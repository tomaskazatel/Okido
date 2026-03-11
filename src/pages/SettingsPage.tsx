import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { usePush } from '@/hooks/usePush'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
  const { user, profile, signOut } = useAuth()
  const { supported, needsInstall, permission, subscribing, subscribe, unsubscribe, isSubscribed } = usePush()

  const handleTogglePush = async () => {
    if (isSubscribed) {
      await unsubscribe()
    } else {
      await subscribe()
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold text-white">Settings</h1>

      <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 space-y-3">
        <div>
          <p className="text-xs text-white/30 uppercase tracking-wider">Name</p>
          <p className="text-sm text-white mt-0.5">{profile?.display_name}</p>
        </div>
        <div>
          <p className="text-xs text-white/30 uppercase tracking-wider">Email</p>
          <p className="text-sm text-white mt-0.5">{user?.email}</p>
        </div>
      </div>

      {/* Push notifications */}
      <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 space-y-3">
        <p className="text-xs text-white/30 uppercase tracking-wider">Notifications</p>
        {!supported ? (
          <p className="text-sm text-white/40">Push notifications are not supported in this browser.</p>
        ) : needsInstall ? (
          <p className="text-sm text-white/40">
            Add Okido to your Home Screen first to enable notifications.
          </p>
        ) : (
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-white/60">Push notifications</span>
            <button
              type="button"
              role="switch"
              aria-checked={isSubscribed}
              disabled={subscribing || permission === 'denied'}
              onClick={handleTogglePush}
              className={cn(
                'relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors cursor-pointer disabled:opacity-50',
                isSubscribed ? 'bg-emerald-500' : 'bg-white/10',
              )}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
                  isSubscribed ? 'translate-x-5' : 'translate-x-0',
                )}
              />
            </button>
          </label>
        )}
        {permission === 'denied' && (
          <p className="text-xs text-red-400/60">
            Notifications are blocked. Please enable them in your browser settings.
          </p>
        )}
      </div>

      <Button variant="ghost" className="w-full text-red-500 hover:text-red-400 hover:bg-red-500/10" onClick={signOut}>
        Log out
      </Button>
    </div>
  )
}
