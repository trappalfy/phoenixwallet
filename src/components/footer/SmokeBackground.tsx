import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../../lib/gsap'
import { createGLScene } from '../../gl/webgl'
import { SMOKE_FRAG } from './smoke'

// Living smoke background (FOOTER-SPEC §7). Reuses the project's raw-WebGL2
// runner and the shared gsap.ticker (§7.4 — no private rAF). Throttled to
// 30fps (24 on touch), paused offscreen and in background tabs. Reduced motion
// paints one static frame and stops. No WebGL → CSS fallback.
export default function SmokeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [fallback, setFallback] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const scene = createGLScene(canvas, SMOKE_FRAG)
    if (!scene) {
      setFallback(true)
      return
    }

    const coarse = matchMedia('(pointer: coarse)').matches
    const reduce = prefersReducedMotion()
    const dprCap = coarse ? 0.32 : 0.42
    scene.resize(dprCap)

    const target = { x: 0, y: 0 }
    const ptr = { x: 0, y: 0 }
    let elapsed = 12 // start mid-animation so the first frame is never empty

    const paint = () => {
      ptr.x += (target.x - ptr.x) * 0.045
      ptr.y += (target.y - ptr.y) * 0.045
      scene.render({ time: elapsed, mouse: [ptr.x, ptr.y], scroll: 0, intro: 0 })
    }
    paint()

    const ro = new ResizeObserver(() => {
      scene.resize(dprCap)
      paint()
    })
    ro.observe(canvas)

    if (reduce) {
      return () => {
        ro.disconnect()
        scene.dispose()
      }
    }

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      target.x = ((e.clientX - r.left) / r.width) * 2 - 1
      target.y = 1 - ((e.clientY - r.top) / r.height) * 2
    }
    if (!coarse) window.addEventListener('pointermove', onMove, { passive: true })

    // throttle inside the shared ticker
    const FRAME = 1 / (coarse ? 24 : 30)
    let acc = 0
    let active = false
    const tick = (_t: number, deltaMs: number) => {
      if (!active) return
      acc += deltaMs / 1000
      if (acc < FRAME) return
      elapsed += acc
      acc = 0
      paint()
    }
    gsap.ticker.add(tick)

    const st = ScrollTrigger.create({
      trigger: canvas.closest('.footer') ?? canvas,
      start: 'top bottom+=300',
      end: 'bottom top-=300',
      onToggle: (self) => {
        active = self.isActive && document.visibilityState === 'visible'
      },
    })
    active = st.isActive && document.visibilityState === 'visible'
    const onVis = () => {
      active = !document.hidden && st.isActive
    }
    document.addEventListener('visibilitychange', onVis)

    return () => {
      gsap.ticker.remove(tick)
      document.removeEventListener('visibilitychange', onVis)
      if (!coarse) window.removeEventListener('pointermove', onMove)
      st.kill()
      ro.disconnect()
      scene.dispose()
    }
  }, [])

  return (
    <div className="footer__bg" aria-hidden>
      {fallback ? <div className="footer__fallback" /> : <canvas ref={canvasRef} />}
      <div className="footer__dawn" />
      <div className="footer__grain" />
      <div className="footer__vignette" />
    </div>
  )
}
