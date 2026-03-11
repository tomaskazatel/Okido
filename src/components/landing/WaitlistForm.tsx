import { useState, type FormEvent } from 'react'
import { supabase } from '@/lib/supabase'
import { LANDING } from '@/lib/copy'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function WaitlistForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'duplicate' | 'error'
  >('idle')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setStatus('loading')
    const { error } = await supabase
      .from('waitlist')
      .insert({ email: email.trim().toLowerCase() })

    if (error) {
      if (error.code === '23505') {
        setStatus('duplicate')
      } else {
        setStatus('error')
      }
      return
    }

    setStatus('success')
    setEmail('')
  }

  const message = {
    success: LANDING.waitlistSuccess,
    duplicate: LANDING.waitlistDuplicate,
    error: LANDING.waitlistError,
    idle: null,
    loading: null,
  }[status]

  const messageColor = {
    success: 'text-emerald-400',
    duplicate: 'text-amber-400',
    error: 'text-red-500',
    idle: '',
    loading: '',
  }[status]

  return (
    <section id="waitlist" className="px-6 py-20">
      <div className="mx-auto max-w-md text-center">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
          {LANDING.waitlistTitle}
        </h2>
        <form
          onSubmit={handleSubmit}
          className="mt-8 flex flex-col gap-3 sm:flex-row"
        >
          <Input
            type="email"
            required
            placeholder={LANDING.waitlistPlaceholder}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (status !== 'idle' && status !== 'loading') setStatus('idle')
            }}
            aria-label="Email address"
          />
          <Button
            type="submit"
            disabled={status === 'loading'}
            className="sm:shrink-0"
          >
            {status === 'loading' ? 'Joining...' : LANDING.waitlistButton}
          </Button>
        </form>
        {message && (
          <p className={`mt-4 text-sm ${messageColor}`}>{message}</p>
        )}
      </div>
    </section>
  )
}
