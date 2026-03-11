import { useState } from 'react'
import { INVITE } from '@/lib/copy'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { InviteLink } from '@/hooks/useFollows'

const expiryOptions = [
  { label: INVITE.expiry24h, hours: 24 },
  { label: INVITE.expiry7d, hours: 168 },
  { label: INVITE.expiryNever, hours: null },
] as const

interface InviteLinkGeneratorProps {
  inviteLinks: InviteLink[]
  onGenerate: (autoApprove: boolean, expiresInHours: number | null) => Promise<{ error: string | null }>
}

export function InviteLinkGenerator({ inviteLinks, onGenerate }: InviteLinkGeneratorProps) {
  const [autoApprove, setAutoApprove] = useState(false)
  const [expiryIndex, setExpiryIndex] = useState(0)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleGenerate = async () => {
    setGenerating(true)
    setError(null)
    const result = await onGenerate(autoApprove, expiryOptions[expiryIndex].hours)
    if (result.error) setError(result.error)
    setGenerating(false)
  }

  const copyLink = async (token: string, id: string) => {
    const url = `${window.location.origin}/app/join/${token}`
    await navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-4">
        {/* Auto-approve toggle */}
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm text-white/60">{INVITE.autoApproveLabel}</span>
          <button
            type="button"
            role="switch"
            aria-checked={autoApprove}
            onClick={() => setAutoApprove(!autoApprove)}
            className={cn(
              'relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors cursor-pointer',
              autoApprove ? 'bg-emerald-500' : 'bg-white/10',
            )}
          >
            <span
              className={cn(
                'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
                autoApprove ? 'translate-x-5' : 'translate-x-0',
              )}
            />
          </button>
        </label>

        {/* Expiry selector */}
        <div>
          <p className="text-sm text-white/60 mb-2">{INVITE.expiryLabel}</p>
          <div className="grid grid-cols-3 gap-2">
            {expiryOptions.map((opt, i) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => setExpiryIndex(i)}
                className={cn(
                  'rounded-lg border px-3 py-2 text-xs font-medium transition-colors cursor-pointer',
                  i === expiryIndex
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                    : 'border-white/[0.06] text-white/40 hover:border-white/[0.12]',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={handleGenerate} disabled={generating} className="w-full">
          {generating ? 'Generating...' : INVITE.generateButton}
        </Button>

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
      </div>

      {/* Generated links */}
      {inviteLinks.length > 0 && (
        <div className="space-y-2">
          {inviteLinks.map((link) => {
            const isExpired = link.expires_at && new Date(link.expires_at) < new Date()
            const isUsed = !!link.used_at
            const isActive = !isExpired && !isUsed
            const isCopied = copiedId === link.id

            return (
              <div
                key={link.id}
                className={cn(
                  'flex items-center justify-between rounded-xl border px-4 py-3',
                  isActive
                    ? 'border-white/[0.06] bg-white/[0.02]'
                    : 'border-white/[0.03] bg-white/[0.01] opacity-50',
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white/60 font-mono truncate">
                    /join/{link.token.slice(0, 8)}...
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {link.auto_approve && (
                      <span className="text-[10px] text-emerald-400/60">auto-approve</span>
                    )}
                    {isExpired && <span className="text-[10px] text-red-400/60">expired</span>}
                    {isUsed && <span className="text-[10px] text-white/30">used</span>}
                  </div>
                </div>
                {isActive && (
                  <button
                    type="button"
                    onClick={() => copyLink(link.token, link.id)}
                    className="ml-3 shrink-0 rounded-lg border border-white/[0.06] px-3 py-1.5 text-xs font-medium text-white/50 hover:text-white/70 hover:border-white/[0.12] transition-colors cursor-pointer"
                  >
                    {isCopied ? INVITE.copied : INVITE.copyButton}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
