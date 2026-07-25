import { useLayoutEffect, useRef, useState, type ComponentType } from 'react'
import { showcase } from '../content/copy'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../lib/gsap'
import DeviceFrame from './DeviceFrame'
import SurfaceGlow from './SurfaceGlow'
import Portfolio from './mockups/Portfolio'
import Swap from './mockups/Swap'
import SignatureRequest from './mockups/SignatureRequest'

const MOCKS: Record<string, ComponentType> = {
  portfolio: Portfolio,
  swap: Swap,
  signature: SignatureRequest,
}

function CopyBlock({ kicker, title, body }: { kicker: string; title: string; body: string }) {
  return (
    <>
      <p className="font-mono text-label uppercase text-flare">{kicker}</p>
      <h3 className="mt-4 font-display text-section font-medium tracking-display text-bone">
        {title}
      </h3>
      <p className="mt-4 max-w-prose text-body text-smoke">{body}</p>
    </>
  )
}

export default function Showcase() {
  const [reduced] = useState(prefersReducedMotion)
  const copyRefs = useRef<(HTMLDivElement | null)[]>([])
  const mockRefs = useRef<(HTMLDivElement | null)[]>([])
  const activeRef = useRef(0)

  // Desktop: the three mockups scroll normally; the copy column is sticky and
  // swaps to whichever mockup currently owns the viewport centre.
  useLayoutEffect(() => {
    if (reduced) return
    const mm = gsap.matchMedia()
    mm.add('(min-width: 768px)', () => {
      const copy = copyRefs.current
      gsap.set(copy[0], { autoAlpha: 1, y: 0 })
      gsap.set(copy.slice(1), { autoAlpha: 0, y: 16 })

      const show = (i: number) => {
        if (activeRef.current === i) return
        activeRef.current = i
        copy.forEach((el, j) => {
          if (!el) return
          gsap.to(el, {
            autoAlpha: j === i ? 1 : 0,
            y: j === i ? 0 : -16,
            duration: 0.45,
            ease: 'power2.out',
            overwrite: 'auto',
          })
        })
      }

      const triggers = mockRefs.current.map((el, i) =>
        ScrollTrigger.create({
          trigger: el,
          start: 'top 62%',
          end: 'bottom 38%',
          onToggle: (self) => self.isActive && show(i),
        }),
      )
      return () => triggers.forEach((t) => t.kill())
    })
    return () => mm.revert()
  }, [reduced])

  return (
    // No overflow-hidden on the section itself — it would make this a scroll
    // container and kill the sticky copy column. The rakes get their own
    // clipping wrapper instead.
    <section className="relative">
      {/* The portal beam blooms centre-column — on desktop that's the gutter
          between the sticky copy and the mockups. Below md there is no gutter
          (single column), so it would wash out the copy; mobile keeps the
          device's own ember glow instead. */}
      <div className="hidden md:block">
        <SurfaceGlow />
      </div>

      <div className="relative z-10 mx-auto max-w-[1200px] px-6 pt-24 md:pt-32">
        <p data-reveal className="font-mono text-label uppercase text-smoke">
          {showcase.label}
        </p>
      </div>

      {/* stacked — mobile, and the whole layout under reduced motion */}
      <div className={reduced ? 'block' : 'md:hidden'}>
        <div className="relative z-10 mx-auto max-w-[1200px] space-y-20 px-6 pb-24 pt-12">
          {showcase.states.map((s) => {
            const Mock = MOCKS[s.key]
            return (
              <div key={s.key} data-reveal className="grid items-center gap-10 md:grid-cols-2">
                <div>
                  <CopyBlock kicker={s.kicker} title={s.title} body={s.body} />
                </div>
                <div className="flex justify-center md:justify-end">
                  <DeviceFrame title={s.kicker}>
                    <Mock />
                  </DeviceFrame>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* sticky copy + scrolling mockups — desktop */}
      <div className={reduced ? 'hidden' : 'hidden md:block'}>
        <div className="relative z-10 mx-auto grid max-w-[1200px] grid-cols-2 gap-16 px-6 pb-32 pt-16">
          <div>
            <div className="sticky top-[calc(50vh-130px)] h-[260px]">
              {showcase.states.map((s, i) => (
                <div
                  key={s.key}
                  ref={(el) => {
                    copyRefs.current[i] = el
                  }}
                  className="absolute inset-0 flex flex-col justify-center"
                >
                  <CopyBlock kicker={s.kicker} title={s.title} body={s.body} />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-[22vh]">
            {showcase.states.map((s, i) => {
              const Mock = MOCKS[s.key]
              return (
                <div
                  key={s.key}
                  ref={(el) => {
                    mockRefs.current[i] = el
                  }}
                  data-reveal
                >
                  <DeviceFrame title={s.kicker}>
                    <Mock />
                  </DeviceFrame>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
