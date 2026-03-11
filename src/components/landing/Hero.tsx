import { LANDING } from '@/lib/copy'
import { Button } from '@/components/ui/Button'
import { PhoneMockup } from './PhoneMockup'

export function Hero() {
  const scrollToWaitlist = () => {
    document
      .getElementById('waitlist')
      ?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="px-6 py-20 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center gap-16 lg:flex-row lg:gap-20">
          {/* Text */}
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {LANDING.heroTitle}
            </h1>
            <p className="mt-6 text-lg text-slate-400 sm:text-xl leading-relaxed">
              {LANDING.heroSubtitle}
            </p>
            <div className="mt-10">
              <Button size="lg" onClick={scrollToWaitlist}>
                {LANDING.ctaButton}
              </Button>
            </div>
          </div>

          {/* Phone mockup */}
          <div className="flex-shrink-0">
            <PhoneMockup />
          </div>
        </div>
      </div>
    </section>
  )
}
