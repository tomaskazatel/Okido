import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { AUTH } from '@/lib/copy'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function OnboardingPage() {
  const { user, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState(profile?.display_name ?? '')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !user) return

    setError(null)
    setSubmitting(true)

    const { error: err } = await supabase
      .from('profiles')
      .update({ display_name: name.trim() })
      .eq('id', user.id)

    if (err) {
      setError(err.message)
      setSubmitting(false)
      return
    }

    await refreshProfile()
    navigate('/app/checkin', { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">
            {AUTH.displayNameTitle}
          </h1>
          <p className="mt-2 text-sm text-white/40">
            This is how your followers will see you.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            required
            placeholder={AUTH.displayNamePlaceholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            maxLength={50}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" disabled={submitting || !name.trim()} className="w-full">
            {submitting ? 'Saving...' : AUTH.displayNameButton}
          </Button>
        </form>
      </div>
    </div>
  )
}
