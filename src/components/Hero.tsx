import { useLayoutEffect, useRef } from 'react'
import { hero } from '../content/copy'
import { NetworkMark } from '../lib/icons'
import { gsap, prefersReducedMotion } from '../lib/gsap'

// Networks as a seamless marquee — same technique as <Marquee/>: content is
// duplicated ×2 and shifted -50% on an infinite loop, never pausing on hover.
function NetworkRow() {
  const ref = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    if (prefersReducedMotion()) return
    const el = ref.current
    if (!el) return
    const tween = gsap.fromTo(el, { xPercent: 0 }, { xPercent: -50, duration: 30, ease: 'none', repeat: -1 })
    return () => {
      tween.kill()
    }
  }, [])
  return (
    <div ref={ref} className="flex w-max items-center gap-10 whitespace-nowrap will-change-transform">
      {[...hero.networks, ...hero.networks].map((n, i) => (
        <div key={`${n.id}-${i}`} className="flex items-center gap-2 text-haze/45">
          <NetworkMark id={n.id} className="h-5 w-5 shrink-0" />
          <span className="font-mono text-[12px] uppercase tracking-[0.08em]">{n.name}</span>
        </div>
      ))}
    </div>
  )
}

export default function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] flex-col justify-between px-6 pb-10 pt-[calc(var(--bar-h)_+_var(--nav-h))]"
    >
      {/* scrim: darkens top + left (where all the text lives) so body copy keeps
          ≥4.5:1 over the shader, while the molten band still glows bottom-right */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(10,8,24,0.72) 0%, rgba(10,8,24,0.18) 44%, rgba(10,8,24,0) 62%), linear-gradient(90deg, rgba(10,8,24,0.82) 0%, rgba(10,8,24,0.32) 42%, rgba(10,8,24,0) 70%)',
        }}
      />

      {/* centre block */}
      <div className="relative mx-auto flex w-full max-w-[1200px] flex-1 flex-col justify-center">
        <div
          data-load="eyebrow"
          className="inline-flex w-fit items-center rounded-pill border border-subtle bg-ink/[0.03] px-3.5 py-1.5 font-mono text-label uppercase text-haze"
        >
          {hero.eyebrow}
        </div>

        <h1 className="mt-7 leading-[0.92]">
          <span className="block overflow-hidden pb-[0.1em]">
            <span
              data-load="line"
              className="block font-display font-medium tracking-display text-ink"
              style={{ fontSize: 'clamp(1.25rem, 3.3vw, 3rem)' }}
            >
              {hero.line1}
            </span>
          </span>
          <span className="block overflow-hidden pb-[0.1em]">
            <span
              data-load="line"
              className="block font-display text-hero font-bold tracking-display text-ink"
            >
              {hero.line2}
            </span>
          </span>
        </h1>

        <p data-load="sub" className="mt-7 max-w-prose text-body text-haze">
          {hero.sub}
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          {/* Straight to the walkthrough — it works in any browser, and the page
              itself states which ones can actually load the extension. */}
          <a
            data-load="cta"
            data-magnetic
            href="/install"
            className="rounded-pill bg-accent-500 px-6 py-3.5 text-[15px] font-medium text-base transition-opacity hover:opacity-90"
          >
            {hero.ctaPrimary}
          </a>
          <a
            data-load="cta"
            href="#security"
            className="rounded-pill border border-subtle px-6 py-3.5 text-[15px] text-ink transition-colors hover:border-ink/25"
          >
            {hero.ctaSecondary}
          </a>
        </div>
      </div>

      {/* network row pinned to the bottom */}
      <div className="relative mx-auto w-full max-w-[1200px]">
        <p data-load="net" className="font-mono text-label uppercase text-haze/70">
          {hero.networksLabel}
        </p>
        <div
          data-load="net"
          className="mt-4 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_5%,#000_95%,transparent)]"
        >
          <NetworkRow />
        </div>
      </div>
    </section>
  )
}
