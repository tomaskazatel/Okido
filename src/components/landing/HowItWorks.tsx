import { LANDING } from '@/lib/copy'

const steps = [
  {
    number: '1',
    emoji: '\u{1F7E2}\u{1F7E1}\u{1F534}',
    title: LANDING.step1Title,
    desc: LANDING.step1Desc,
  },
  {
    number: '2',
    emoji: '\u{1F44D}',
    title: LANDING.step2Title,
    desc: LANDING.step2Desc,
  },
  {
    number: '3',
    emoji: '\u{1F514}',
    title: LANDING.step3Title,
    desc: LANDING.step3Desc,
  },
]

export function HowItWorks() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center text-sm font-semibold uppercase tracking-widest text-emerald-400">
          {LANDING.howItWorksTitle}
        </h2>
        <div className="mt-12 space-y-12">
          {steps.map((step) => (
            <div key={step.number} className="flex gap-6 items-start">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-800 text-sm font-bold text-emerald-400 border border-navy-700">
                {step.number}
              </div>
              <div>
                <div className="text-2xl mb-2">{step.emoji}</div>
                <h3 className="text-lg font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-1 text-slate-400">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
