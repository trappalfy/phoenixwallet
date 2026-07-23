import { useLayoutEffect, useRef, useState, type ComponentType } from 'react'
import { showcase } from '../content/copy'
import { gsap, prefersReducedMotion } from '../lib/gsap'
import DeviceFrame from './DeviceFrame'
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
  const pinRef = useRef<HTMLDivElement>(null)
  const copyRefs = useRef<(HTMLDivElement | null)[]>([])
  const deviceRefs = useRef<(HTMLDivElement | null)[]>([])

  // Desktop: pin (CSS sticky) for 300vh, cross-fade the three states on scroll.
  useLayoutEffect(() => {
    if (reduced) return
    const mm = gsap.matchMedia()
    mm.add('(min-width: 768px)', () => {
      const c = copyRefs.current
      const d = deviceRefs.current
      gsap.set([c[0], d[0]], { autoAlpha: 1 })
      gsap.set([c[1], c[2], d[1], d[2]], { autoAlpha: 0 })
      gsap
        .timeline({
          scrollTrigger: {
            trigger: pinRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.5,
          },
        })
        .to([c[0], d[0]], { autoAlpha: 0, duration: 1 }, 1)
        .to([c[1], d[1]], { autoAlpha: 1, duration: 1 }, 1)
        .to([c[1], d[1]], { autoAlpha: 0, duration: 1 }, 3)
        .to([c[2], d[2]], { autoAlpha: 1, duration: 1 }, 3)
    })
    return () => mm.revert()
  }, [reduced])

  return (
    <section data-thread-flare className="relative">
      <div className="mx-auto max-w-[1200px] px-6 pt-24 md:pt-32">
        <p data-reveal className="font-mono text-label uppercase text-smoke">
          {showcase.label}
        </p>
      </div>

      {/* stacked — mobile (and the reduced-motion layout at every width) */}
      <div className={reduced ? 'block' : 'md:hidden'}>
        <div className="mx-auto max-w-[1200px] space-y-20 px-6 pb-24 pt-12">
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

      {/* pinned cross-fade — desktop */}
      <div className={reduced ? 'hidden' : 'hidden md:block'}>
        <div ref={pinRef} className="relative h-[300vh]">
          <div className="sticky top-0 flex h-screen items-center">
            <div className="mx-auto grid w-full max-w-[1200px] grid-cols-2 items-center gap-12 px-6">
              <div className="relative h-[380px]">
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
              <div className="relative flex h-[540px] items-center justify-center">
                {showcase.states.map((s, i) => {
                  const Mock = MOCKS[s.key]
                  return (
                    <div
                      key={s.key}
                      ref={(el) => {
                        deviceRefs.current[i] = el
                      }}
                      className="absolute inset-0 flex items-center justify-center"
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
        </div>
      </div>
    </section>
  )
}
