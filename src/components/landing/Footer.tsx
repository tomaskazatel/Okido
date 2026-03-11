import { APP } from '@/lib/copy'

export function Footer() {
  return (
    <footer className="border-t border-navy-800 px-6 py-10">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm text-slate-400">
          {APP.name} &middot; {APP.tagline} &middot; {APP.footerTagline}
        </p>
      </div>
    </footer>
  )
}
