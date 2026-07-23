import { useRef, type PointerEvent } from 'react'
import { BentoIcon } from '../lib/icons'

type Props = {
  icon: string
  title: string
  body: string
  className?: string
}

// Card with a cursor-tracked --ember glow and a max-4° tilt (brief §5).
// Direct style mutation on pointermove — no React state, stays cheap.
export default function BentoCard({ icon, title, body, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = e.clientX - r.left
    const y = e.clientY - r.top
    el.style.setProperty('--mx', `${x}px`)
    el.style.setProperty('--my', `${y}px`)
    const rx = (0.5 - y / r.height) * 4
    const ry = (x / r.width - 0.5) * 4
    el.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`
  }

  const setGlow = (v: string) => ref.current?.style.setProperty('--glow', v)
  const onLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.transform = ''
    setGlow('0')
  }

  return (
    <div
      ref={ref}
      data-reveal
      onPointerMove={onMove}
      onPointerEnter={() => setGlow('1')}
      onPointerLeave={onLeave}
      className={`group relative overflow-hidden rounded-card border border-hairline bg-soot p-7 transition-[border-color,transform] duration-200 ease-out hover:border-bone/20 ${className}`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[var(--glow,0)] transition-opacity duration-300"
        style={{
          background:
            'radial-gradient(260px circle at var(--mx,50%) var(--my,50%), rgba(255,90,31,0.16), transparent 70%)',
        }}
      />
      <div className="relative">
        <BentoIcon name={icon} className="h-7 w-7 text-flare" />
        <h3 className="mt-5 font-display text-[22px] font-medium tracking-[-0.02em] text-bone">
          {title}
        </h3>
        <p className="mt-3 text-body text-smoke">{body}</p>
      </div>
    </div>
  )
}
