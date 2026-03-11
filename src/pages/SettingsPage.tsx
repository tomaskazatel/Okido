import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'

export default function SettingsPage() {
  const { user, profile, signOut } = useAuth()

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

      <Button variant="ghost" className="w-full text-red-500 hover:text-red-400 hover:bg-red-500/10" onClick={signOut}>
        Log out
      </Button>
    </div>
  )
}
