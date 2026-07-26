import { useState } from 'react'
import { useHoldSweep } from '../../lib/motion'

/**
 * Press and hold to confirm (§9.4). The gradient fills over 600 ms and only then
 * fires — a deliberate speed bump on the one action that moves value.
 *
 * The tween owns the timing (§10), so the bar and the confirm can never
 * disagree about when the six hundred milliseconds are up, and releasing early
 * rewinds from wherever the sweep got to instead of snapping back.
 *
 * Keyboard works the same way: keydown starts the fill, keyup cancels, so the
 * control is not a trap for anyone who cannot use a pointer (§11).
 */
export default function HoldToConfirm({
  label,
  holdingLabel = 'Keep holding…',
  onConfirm,
  disabled,
}: {
  label: string
  holdingLabel?: string
  onConfirm: () => void
  disabled?: boolean
}) {
  const [holding, setHolding] = useState(false)

  const sweep = useHoldSweep(() => {
    setHolding(false)
    onConfirm()
  })

  const start = () => {
    if (disabled || holding) return
    setHolding(true)
    sweep.start()
  }

  const cancel = () => {
    if (!holding) return
    setHolding(false)
    sweep.cancel()
  }

  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={`${label} — press and hold`}
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          start()
        }
      }}
      onKeyUp={cancel}
      onBlur={cancel}
      className="relative w-full overflow-hidden rounded-pill border border-hairline bg-surface-2 disabled:pointer-events-none disabled:opacity-40"
    >
      <span
        ref={sweep.fill}
        aria-hidden
        className="absolute inset-y-0 left-0 w-full origin-left scale-x-0 bg-grad-ember"
      />
      <span
        className={`relative flex min-h-10 items-center justify-center px-4 py-2.5 text-15 font-medium transition-colors duration-state ${
          holding ? 'text-ink' : 'text-text'
        }`}
      >
        {holding ? holdingLabel : label}
      </span>
    </button>
  )
}
