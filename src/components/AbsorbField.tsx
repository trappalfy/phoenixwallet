import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../lib/gsap'

// Security's absorbing field. The enclave is a black hole at the centre: dots
// stream in along radial lines, accelerate as they near it, and are swallowed
// behind the icon.
//
// This is a canvas particle field, not CSS. Radial convergence to a single
// point can't be faked by translating a dot grid — that's exactly what made the
// left and right halves smear into each other. Here every dot has its own ray
// into the centre, so there are no halves to mismatch.
export default function AbsorbField({
  className = '',
  intensity = 1,
}: {
  className?: string
  intensity?: number
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const reduce = prefersReducedMotion()

    type P = { a: number; r: number; v: number; s: number }
    const RMIN = 0.055 // radius (0..1) at which the icon has swallowed the dot

    let W = 0
    let H = 0
    let cx = 0
    let cy = 0
    let RX = 0
    let RY = 0
    let ps: P[] = []

    // r near 1 = outer rim, r near 0 = the icon. atEdge respawns a swallowed dot.
    const respawn = (p: P, atEdge: boolean) => {
      p.a = Math.random() * Math.PI * 2
      p.r = atEdge ? 0.85 + Math.random() * 0.17 : Math.random() * 1.02
      p.v = 0.05 + Math.random() * 0.05 // base inward speed, r-units/sec
      p.s = 0.8 + Math.random() * 0.8 // dot size, px
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = wrap.clientWidth
      H = wrap.clientHeight
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      canvas.style.width = W + 'px'
      canvas.style.height = H + 'px'
      // canvas.width reset wipes context state — restore transform + fill here
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.fillStyle = 'rgba(167,139,250,0.95)'
      // Centre the hole on the icon's *actual* position, not the box centre —
      // the section's top padding differs by breakpoint, so a fixed centre drifts
      // off the icon. Measured once here (and on resize). Drives the CSS glow too.
      cx = W / 2
      cy = H / 2
      const icon = wrap.closest('section')?.querySelector('[data-absorb-center]')
      if (icon) {
        const wr = wrap.getBoundingClientRect()
        const ir = icon.getBoundingClientRect()
        cx = ir.left + ir.width / 2 - wr.left
        cy = ir.top + ir.height / 2 - wr.top
        wrap.style.setProperty('--hx', ((cx / W) * 100).toFixed(2) + '%')
        wrap.style.setProperty('--hy', ((cy / H) * 100).toFixed(2) + '%')
      }
      RX = W * 0.5
      RY = H * 0.44
      const count = Math.min(Math.round((W * H) / 180), 4200)
      ps = Array.from({ length: count }, () => {
        const p: P = { a: 0, r: 0, v: 0, s: 0 }
        respawn(p, false)
        return p
      })
    }

    const draw = (dt: number) => {
      ctx.clearRect(0, 0, W, H)
      for (const p of ps) {
        if (dt > 0) {
          // accelerate as it nears the centre — the pull of the hole
          p.r -= dt * (p.v + 0.22 * (1 - p.r))
          if (p.r <= RMIN) respawn(p, true)
        }
        const x = cx + Math.cos(p.a) * p.r * RX
        const y = cy + Math.sin(p.a) * p.r * RY
        const aIn = (1 - p.r) / 0.16 // fade in at the rim
        const aOut = (p.r - RMIN) / 0.09 // fade out into the hole
        const alpha = Math.max(0, Math.min(1, aIn, aOut)) * 0.92 * intensity
        if (alpha <= 0.01) continue
        ctx.globalAlpha = alpha
        ctx.fillRect(x - p.s / 2, y - p.s / 2, p.s, p.s)
      }
      ctx.globalAlpha = 1
    }

    let rafId = 0
    let last = 0
    let onScreen = false
    const loop = (t: number) => {
      const dt = Math.min((t - last) / 1000, 0.05)
      last = t
      draw(dt)
      rafId = requestAnimationFrame(loop)
    }
    const start = () => {
      if (rafId || reduce) return
      last = performance.now()
      rafId = requestAnimationFrame(loop)
    }
    const stop = () => {
      cancelAnimationFrame(rafId)
      rafId = 0
    }
    const sync = () => {
      if (onScreen && document.visibilityState === 'visible') start()
      else stop()
    }

    resize()
    if (reduce) draw(0) // single static frame

    const ro = new ResizeObserver(() => {
      resize()
      if (reduce) draw(0)
    })
    ro.observe(wrap)
    // don't burn cycles when the section is offscreen or the tab is hidden
    const io = new IntersectionObserver(
      ([e]) => {
        onScreen = e.isIntersecting
        sync()
      },
      { threshold: 0 },
    )
    io.observe(wrap)
    document.addEventListener('visibilitychange', sync)

    return () => {
      stop()
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', sync)
    }
  }, [intensity])

  const g = intensity
  return (
    <div
      ref={wrapRef}
      aria-hidden
      className={`pointer-events-none absolute overflow-hidden ${className}`}
      style={{ ['--hx' as string]: '50%', ['--hy' as string]: '50%' }}
    >
      {/* outer bloom — positioned on the icon via --hx/--hy */}
      <div
        className="absolute inset-0"
        style={{
          opacity: g,
          filter: 'blur(46px)',
          background:
            'radial-gradient(ellipse 40% 60% at var(--hx) var(--hy), rgba(139,92,246,0.52), rgba(46,16,101,0.22) 50%, transparent 76%)',
        }}
      />
      {/* particles streaming into the hole */}
      <canvas ref={canvasRef} className="absolute inset-0" />
      {/* hot core — the light the dots are swallowed by, painted over them.
          Horizontal radius is a fixed px (not % of width) so it stays tucked
          behind the icon at any viewport, like it already does on mobile —
          otherwise it scales with the width and spills past the icon on desktop. */}
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.92 * g,
          filter: 'blur(24px)',
          background:
            'radial-gradient(ellipse 80px 44% at var(--hx) var(--hy), rgba(167,139,250,0.6), rgba(139,92,246,0.28) 45%, transparent 74%)',
        }}
      />
    </div>
  )
}
