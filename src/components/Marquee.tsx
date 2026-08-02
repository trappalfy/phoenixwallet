import { useLayoutEffect, useRef } from 'react'
import { numbers } from '../content/copy'
import { gsap, prefersReducedMotion } from '../lib/gsap'

function Row({ items, reverse = false }: { items: readonly string[]; reverse?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)

  // Content is duplicated ×2, so a -50% shift loops seamlessly. Always runs.
  useLayoutEffect(() => {
    if (prefersReducedMotion()) return
    const el = ref.current
    if (!el) return
    const tween = gsap.fromTo(
      el,
      { xPercent: reverse ? -50 : 0 },
      { xPercent: reverse ? 0 : -50, duration: 38, ease: 'none', repeat: -1 },
    )
    return () => {
      tween.kill()
    }
  }, [reverse])

  return (
    <div ref={ref} className="flex w-max gap-12 whitespace-nowrap will-change-transform">
      {[...items, ...items].map((name, i) => (
        <span
          key={`${name}-${i}`}
          className="font-display text-[clamp(1.5rem,3vw,2.5rem)] font-medium tracking-display text-ink/[0.14]"
        >
          {name}
        </span>
      ))}
    </div>
  )
}

// Two rows scrolling opposite ways, edges masked to --void (brief §5).
export default function Marquee() {
  return (
    <div className="relative space-y-5 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
      <Row items={numbers.marquee} />
      <Row items={[...numbers.marquee].reverse()} reverse />
    </div>
  )
}
