import { Hero } from '@/components/landing/Hero'
import { Problem } from '@/components/landing/Problem'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { DashboardPreview } from '@/components/landing/DashboardPreview'
import { WaitlistForm } from '@/components/landing/WaitlistForm'
import { Footer } from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Problem />
      <HowItWorks />
      <DashboardPreview />
      <WaitlistForm />
      <Footer />
    </div>
  )
}
