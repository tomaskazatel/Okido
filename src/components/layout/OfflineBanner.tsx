import { useOnline } from '@/hooks/useOnline'

export function OfflineBanner() {
  const online = useOnline()

  if (online) return null

  return (
    <div className="bg-amber-500/90 px-4 py-2 text-center text-xs font-medium text-navy-950">
      <span className="inline-flex items-center gap-1.5">
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728m-3.536-3.536a4 4 0 000-5.656M6.343 6.343a8 8 0 000 11.314" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.515 3.515l16.97 16.97" />
        </svg>
        You're offline — showing cached data
      </span>
    </div>
  )
}
