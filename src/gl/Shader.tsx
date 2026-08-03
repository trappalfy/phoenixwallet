import { useEffect, useRef } from 'react'
import { createGLScene } from './webgl'
import { buildFrag } from './frag'

type Props = {
  // live 0..1 hero scroll progress; read each frame so identity stays stable
  scrollRef?: { current: number }
  // resting-frame CSS gradient shown for reduced-motion / no-WebGL
  fallbackClassName?: string
}

// Resting frame: a horizontal nebula band on --bg-base. Matches the shader at rest.
const FALLBACK_BG =
  'radial-gradient(150% 20% at 50% 50%, rgba(196,181,253,0.16), rgba(139,92,246,0.16) 28%, rgba(46,16,101,0.12) 52%, transparent 72%), #0a0818'

export default function Shader({ scrollRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fallbackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const fallback = fallbackRef.current
    if (!canvas || !fallback) return

    const showFallback = () => {
      fallback.style.opacity = '1'
    }

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      showFallback()
      return
    }

    // ponytail: device tier picked once at mount; reload re-picks across the
    // 768 breakpoint (no live shader recompile — not worth it for a bg).
    const mobile = window.matchMedia('(max-width: 767px)').matches
    const dprCap = mobile ? 1.0 : 1.75
    const octaves = mobile ? 3 : 4

    const scene = createGLScene(canvas, buildFrag(octaves))
    if (!scene) {
      showFallback()
      return
    }
    scene.resize(dprCap)

    let raf = 0
    let running = false
    let onscreen = true
    let visible = !document.hidden

    let last = performance.now()
    let elapsed = 0
    let mx = 0
    let my = 0
    let tmx = 0
    let tmy = 0

    const frame = (now: number) => {
      elapsed += (now - last) / 1000
      last = now
      mx += (tmx - mx) * 0.06
      my += (tmy - my) * 0.06
      const intro = Math.min(1, elapsed / 1.2)
      const scroll = scrollRef ? Math.min(1, Math.max(0, scrollRef.current)) : 0
      scene.render({ time: elapsed, mouse: [mx, my], scroll, intro })
      raf = requestAnimationFrame(frame)
    }

    const start = () => {
      if (running) return
      running = true
      last = performance.now() // don't count paused time — no time jump on resume
      raf = requestAnimationFrame(frame)
    }
    const stop = () => {
      if (!running) return
      running = false
      cancelAnimationFrame(raf)
    }
    const updateRun = () => (onscreen && visible ? start() : stop())

    const onMove = (e: PointerEvent) => {
      tmx = (e.clientX / window.innerWidth) * 2 - 1
      tmy = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    const onResize = () => scene.resize(dprCap)
    const onVis = () => {
      visible = !document.hidden
      updateRun()
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', onVis)

    const io = new IntersectionObserver(
      ([entry]) => {
        onscreen = entry.isIntersecting
        updateRun()
      },
      { threshold: 0 },
    )
    io.observe(canvas)

    start()

    return () => {
      stop()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVis)
      io.disconnect()
      scene.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <div
        ref={fallbackRef}
        className="absolute inset-0 opacity-0 transition-opacity duration-500"
        style={{ background: FALLBACK_BG }}
      />
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  )
}
