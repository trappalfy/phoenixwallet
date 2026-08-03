import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../../lib/gsap'
import { scanWordmark, type ScanResult } from './scanWordmark'
import { useWordmarkWave } from './useWordmarkWave'
import { FOOTER } from './footer.config'

const ROWS = 24 // same on every breakpoint; only the pitch changes (§13.4)

// "PERIGEE" rendered as horizontal scanlines (FOOTER-SPEC §13). Signature piece.
export default function LineWordmark() {
  const hostRef = useRef<HTMLDivElement>(null)
  const rowRefs = useRef<(HTMLDivElement | null)[]>([])
  const [data, setData] = useState<ScanResult | null>(null)

  // scan on mount + on width change (debounced; width only — §18)
  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    let cancelled = false
    let lastWidth = 0
    let t = 0

    const run = () => {
      const width = Math.round(host.clientWidth)
      if (!width || width === lastWidth) return
      lastWidth = width
      scanWordmark({ text: FOOTER.brandName, width, rows: ROWS, tracking: -0.04 }).then((res) => {
        if (!cancelled) setData(res)
      })
    }
    run()
    const ro = new ResizeObserver(() => {
      window.clearTimeout(t)
      t = window.setTimeout(run, 150)
    })
    ro.observe(host)
    return () => {
      cancelled = true
      ro.disconnect()
      window.clearTimeout(t)
    }
  }, [])

  // reveal: rows draw in top→down like a scan (§13.5), once
  useEffect(() => {
    if (!data || prefersReducedMotion()) return
    const rows = rowRefs.current.filter(Boolean) as HTMLDivElement[]
    if (!rows.length) return
    const ctx = gsap.context(() => {
      gsap.set(rows, { '--sx': 0.08, '--o': 0 })
      gsap.to(rows, {
        '--sx': 1,
        '--o': 1,
        duration: 1.1,
        ease: 'expo.out',
        stagger: 0.018,
        // 'top bottom' (not a % start): the wordmark sits at the very bottom of
        // the page, so a start like 'top 88%' can never be scrolled into range on
        // mobile and the rows would stay collapsed. This fires as it enters.
        scrollTrigger: { trigger: hostRef.current, start: 'top bottom', once: true },
      })
    }, hostRef)
    ScrollTrigger.refresh()
    return () => ctx.revert()
  }, [data])

  useWordmarkWave(hostRef, rowRefs, data?.rows.length ?? 0)

  const pitch = data ? data.height / data.rows.length : 0
  const stroke = Math.max(1, Math.min(3, pitch * 0.22))

  return (
    <>
      <div
        className="wm"
        ref={hostRef}
        style={{ ['--wm-h' as string]: `${data?.height ?? 0}px`, height: 'var(--wm-h)' }}
        aria-hidden="true"
      >
        {data?.rows.map((segs, i) => (
          <div
            className="wm__row"
            key={i}
            ref={(el) => {
              rowRefs.current[i] = el
            }}
            style={{ top: i * pitch, height: stroke }}
          >
            {segs.map(([x0, x1], j) => (
              <i key={j} style={{ left: x0, width: x1 - x0 }} />
            ))}
          </div>
        ))}
      </div>
      <p className="sr-only">Perigee Wallet</p>
    </>
  )
}
