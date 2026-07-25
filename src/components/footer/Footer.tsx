import { useLayoutEffect, useRef } from 'react'
import './footer.css'
import { FOOTER } from './footer.config'
import { gsap, prefersReducedMotion } from '../../lib/gsap'
import SmokeBackground from './SmokeBackground'
import LineWordmark from './LineWordmark'
import { useLocalClock } from './useLocalClock'

// Phoenix Wallet footer (FOOTER-SPEC).
export default function Footer() {
  const time = useLocalClock(FOOTER.timezone)
  const [s1, s2, s3, s4] = FOOTER.socials
  const rootRef = useRef<HTMLElement>(null)

  // reveal on scroll-in, once (§15). Headline lines clip up; the rest fades up.
  // Skipped under reduced motion — everything renders at its final state.
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      const lines = root.querySelectorAll('.headline__line > span')
      const items = root.querySelectorAll('[data-reveal]')
      gsap.set(lines, { yPercent: 110 })
      gsap.set(items, { autoAlpha: 0, y: 20 })
      gsap
        .timeline({ scrollTrigger: { trigger: root, start: 'top 75%', once: true } })
        .to(lines, { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.09 })
        .to(items, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'expo.out', stagger: 0.06 }, 0.15)
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <footer className="footer" ref={rootRef}>
      <SmokeBackground />

      {/* ---- top: eyebrow + clock / headline + CTA (§9–11) ---------------- */}
      <div className="footer__top">
        <p className="eyebrow" data-reveal>{FOOTER.eyebrow}</p>

        <p className="clock" aria-live="off" data-reveal>
          <span>{FOOTER.timezoneLabel}</span>
          <span aria-hidden="true"> → </span>
          <time className="clock__time">{time ?? '--:--'}</time>
        </p>

        <h2 className="headline">
          {FOOTER.headline.map((line) => (
            <span className="headline__line" key={line}>
              <span>{line}</span>
            </span>
          ))}
        </h2>

        <a className="cta" href={FOOTER.cta.href} data-reveal>
          <span className="cta__label">{FOOTER.cta.label}</span>
          <span className="cta__arrow" aria-hidden="true">↑</span>
          <span className="cta__rule" />
        </a>
      </div>

      {/* ---- meta: legal / business enquiry / social (§12) ---------------- */}
      <div className="footer__meta">
        <p className="legal meta__legal" data-reveal>
          ©Phoenix Wallet<sup>®</sup> 2026
        </p>

        <div className="meta__enquiry" data-reveal>
          <p className="label">Business enquiry</p>
          <p>
            <span className="pfx">E.</span>{' '}
            <a className="metalink" href={`mailto:${FOOTER.email}`}>
              {FOOTER.email}
            </a>
          </p>
        </div>

        <div className="meta__social" data-reveal>
          <p className="label">Social</p>
          <ul>
            <li><SocialLink {...s1} /></li>
            <li><SocialLink {...s2} /></li>
          </ul>
          <ul>
            <li><SocialLink {...s3} /></li>
            <li><SocialLink {...s4} /></li>
          </ul>
        </div>
      </div>

      <div className="footer__spacer" />

      <LineWordmark />
    </footer>
  )
}

function SocialLink({ label, href, soon }: { label: string; href?: string | null; soon?: boolean }) {
  if (soon || !href) {
    return (
      <span className="social-soon">
        {label}
        <span className="social-soon__tag">soon</span>
      </span>
    )
  }
  return (
    <a className="metalink" href={href} target="_blank" rel="noopener noreferrer">
      {label}
    </a>
  )
}
