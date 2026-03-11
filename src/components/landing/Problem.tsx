import { LANDING } from '@/lib/copy'

export function Problem() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
          {LANDING.problemTitle}
        </h2>
        <p className="mt-6 text-xl leading-relaxed text-slate-300 sm:text-2xl">
          {LANDING.problemText}
        </p>
      </div>
    </section>
  )
}
