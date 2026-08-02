import { useLayoutEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from './lib/gsap'
import { useLenis } from './hooks/useLenis'
import Shader from './gl/Shader'
import GrainOverlay from './components/GrainOverlay'
import Nav from './components/Nav'
import Hero from './components/Hero'
import BentoGrid from './components/BentoGrid'
import Showcase from './components/Showcase'
import Security from './components/Security'
import Numbers from './components/Numbers'
import FinalCta from './components/FinalCta'
import Footer from './components/footer/Footer'
import WaitlistModal from './components/WaitlistModal'

export default function App() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [waitlistOpen, setWaitlistOpen] = useState(false)
  const openWaitlist = () => setWaitlistOpen(true)

  useLenis()

  // Load sequence (brief §7). Reduced-motion → skip; markup renders at final state.
  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context((self) => {
      const q = self.selector!
      gsap.set(q('[data-load="nav"]'), { autoAlpha: 0, y: -12 })
      gsap.set(q('[data-load="eyebrow"]'), { autoAlpha: 0, scale: 0.92 })
      gsap.set(q('[data-load="line"]'), { yPercent: 110, clipPath: 'inset(0 0 100% 0)' })
      gsap.set(q('[data-load="sub"], [data-load="cta"]'), { autoAlpha: 0, y: 16 })
      gsap.set(q('[data-load="net"]'), { autoAlpha: 0, y: 10 })

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.to(q('[data-load="nav"]'), { autoAlpha: 1, y: 0, duration: 0.8 }, 0.5)
        .to(q('[data-load="eyebrow"]'), { autoAlpha: 1, scale: 1, duration: 0.6 }, 0.6)
        .to(
          q('[data-load="line"]'),
          { yPercent: 0, clipPath: 'inset(0 0 0% 0)', duration: 1.0, stagger: 0.09 },
          0.72,
        )
        .to(q('[data-load="sub"], [data-load="cta"]'), { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08 }, 1.05)
        .to(q('[data-load="net"]'), { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.04 }, 1.2)

      // Section reveals (brief §7): fade-up once per element on scroll-in.
      gsap.set(q('[data-reveal]'), { autoAlpha: 0, y: 28 })
      ScrollTrigger.batch(q('[data-reveal]'), {
        start: 'top 82%',
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.06, ease: 'power3.out' }),
      })
    }, rootRef)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={rootRef} className="relative">
      <Shader />
      <Nav onWaitlist={openWaitlist} />
      <main>
        <Hero />
        {/* opaque backdrop: covers the fixed shader once the hero scrolls away */}
        <div className="relative z-10 bg-base">
          <BentoGrid />
          <Showcase />
          <Security />
          <Numbers />
          <FinalCta />
        </div>
      </main>
      <Footer />
      <GrainOverlay />
      <WaitlistModal open={waitlistOpen} onClose={() => setWaitlistOpen(false)} />
    </div>
  )
}
