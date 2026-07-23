import { useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../lib/gsap'

type Props = { wrapperRef: RefObject<HTMLDivElement | null> }

const CX = 30 // svg centre (width 60)

// The thread: one vertical --ember path, drawn by scroll progress, terminating
// in the security enclave (brief §4). Flares bloom per section anchor.
export default function Thread({ wrapperRef }: Props) {
  const pathRef = useRef<SVGPathElement>(null)
  const flareRefs = useRef<(SVGGElement | null)[]>([])
  const [geom, setGeom] = useState<{ h: number; flares: number[] }>({ h: 0, flares: [] })

  // measure the enclave terminus + flare anchors relative to the wrapper
  useLayoutEffect(() => {
    const wrap = wrapperRef.current
    if (!wrap) return
    const measure = () => {
      const end = wrap.querySelector<HTMLElement>('[data-thread-end]')
      if (!end) return
      const wrapTop = wrap.getBoundingClientRect().top + window.scrollY
      const endRect = end.getBoundingClientRect()
      const endY = endRect.top + window.scrollY - wrapTop + endRect.height / 2
      const flares = Array.from(
        wrap.querySelectorAll<HTMLElement>('[data-thread-flare]'),
      ).map((el) => {
        const r = el.getBoundingClientRect()
        return r.top + window.scrollY - wrapTop + Math.min(r.height / 2, 140)
      })
      setGeom({ h: Math.round(endY), flares })
    }
    measure()
    const ro = new ResizeObserver(() => {
      measure()
      ScrollTrigger.refresh()
    })
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [wrapperRef])

  // draw + flare animations
  useLayoutEffect(() => {
    const wrap = wrapperRef.current
    const path = pathRef.current
    if (!wrap || !path || geom.h === 0) return

    const len = path.getTotalLength()
    path.style.strokeDasharray = `${len}`

    if (prefersReducedMotion()) {
      path.style.strokeDashoffset = '0'
      flareRefs.current.forEach((f) => f && (f.style.opacity = '0.7'))
      return
    }
    path.style.strokeDashoffset = `${len}`

    const end = wrap.querySelector<HTMLElement>('[data-thread-end]')
    const ctx = gsap.context(() => {
      gsap.to(path, {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: wrap,
          start: 'top 75%',
          endTrigger: end ?? undefined,
          end: 'center 55%',
          scrub: 0.6,
        },
      })
      Array.from(wrap.querySelectorAll<HTMLElement>('[data-thread-flare]')).forEach((el, i) => {
        const f = flareRefs.current[i]
        if (!f) return
        gsap
          .timeline({
            scrollTrigger: { trigger: el, start: 'top 72%', end: 'bottom 28%', scrub: true },
          })
          .fromTo(f, { opacity: 0.12 }, { opacity: 1, ease: 'power2.in' })
          .to(f, { opacity: 0.4, ease: 'power2.out' })
      })
    }, wrap)
    return () => ctx.revert()
  }, [geom, wrapperRef])

  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-0 z-30 -translate-x-1/2"
      width="60"
      height={geom.h || 1}
      viewBox={`0 0 60 ${geom.h || 1}`}
      fill="none"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <filter id="thread-flare" x="-300%" y="-300%" width="700%" height="700%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>
      <path
        ref={pathRef}
        d={`M ${CX} 0 L ${CX} ${geom.h}`}
        stroke="#FF5A1F"
        strokeWidth="1.5"
        strokeLinecap="round"
        style={{ filter: 'drop-shadow(0 0 5px rgba(255,90,31,0.8))' }}
      />
      {geom.flares.map((y, i) => (
        <g
          key={i}
          ref={(el) => {
            flareRefs.current[i] = el
          }}
          style={{ opacity: 0.12 }}
        >
          <circle cx={CX} cy={y} r="9" fill="#FF5A1F" filter="url(#thread-flare)" />
          <circle cx={CX} cy={y} r="2.5" fill="#FFE9C4" />
        </g>
      ))}
    </svg>
  )
}
