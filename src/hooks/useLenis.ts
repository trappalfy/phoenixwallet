import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../lib/gsap'

// Smooth scroll wired to gsap.ticker + ScrollTrigger.update (brief §7).
// Skipped entirely under prefers-reduced-motion — native scroll takes over.
export function useLenis() {
  useEffect(() => {
    if (prefersReducedMotion()) return

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => 1 - Math.pow(1 - t, 3),
    })

    const onScroll = () => ScrollTrigger.update()
    lenis.on('scroll', onScroll)

    const onTick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(onTick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.off('scroll', onScroll)
      gsap.ticker.remove(onTick)
      lenis.destroy()
    }
  }, [])
}
