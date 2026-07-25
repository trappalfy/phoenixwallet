import { useEffect, type RefObject, type MutableRefObject } from 'react'
import { gsap, prefersReducedMotion } from '../../lib/gsap'

// Hover wave (FOOTER-SPEC §13.6). One shared state object + one pass over the
// rows per frame (inside the shared gsap.ticker) — never a tween per row.
// Rows near the cursor stretch on X, brighten, and heat toward ember.
const MAX_STRETCH = 0.42 // → scaleX(1.42)
const FALLOFF = 4.5 // rows the wave reaches

export function useWordmarkWave(
  hostRef: RefObject<HTMLDivElement | null>,
  rowRefs: MutableRefObject<(HTMLDivElement | null)[]>,
  rowCount: number,
) {
  useEffect(() => {
    const host = hostRef.current
    if (!host || rowCount === 0) return
    if (prefersReducedMotion()) return
    if (!matchMedia('(pointer: fine)').matches) return // no wave on touch

    const wave = { row: -99, power: 0 }
    const toRow = gsap.quickTo(wave, 'row', { duration: 0.35, ease: 'power3' })
    let settled = true

    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect()
      toRow(((e.clientY - r.top) / r.height) * rowCount)
      gsap.to(wave, { power: 1, duration: 0.35, ease: 'power2.out', overwrite: 'auto' })
      settled = false
    }
    const onLeave = () =>
      gsap.to(wave, { power: 0, duration: 0.6, ease: 'power3.out', overwrite: 'auto' })

    host.addEventListener('pointermove', onMove, { passive: true })
    host.addEventListener('pointerleave', onLeave)

    const tick = () => {
      if (wave.power < 0.001 && settled) return
      for (let i = 0; i < rowCount; i++) {
        const el = rowRefs.current[i]
        if (!el) continue
        const d = Math.abs(i + 0.5 - wave.row) / FALLOFF
        const k = Math.max(0, 1 - d * d) * wave.power // smooth falloff
        el.style.setProperty('--sx', String(1 + k * MAX_STRETCH))
        el.style.setProperty('--o', String(0.55 + k * 0.45))
        el.style.setProperty('--heat', String(k * 0.85)) // ember lights up here
      }
      settled = wave.power < 0.001
    }
    gsap.ticker.add(tick)

    return () => {
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
      gsap.ticker.remove(tick)
    }
  }, [hostRef, rowRefs, rowCount])
}
