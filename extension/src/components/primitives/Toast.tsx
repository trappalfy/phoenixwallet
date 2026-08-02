import { useToastIn } from '../../lib/motion'
import { Check, Alert, Info } from '../icons'

export type ToastTone = 'success' | 'error' | 'info'

export type ToastState = { message: string; tone: ToastTone } | null

const ICONS = { success: Check, error: Alert, info: Info }
const TONES: Record<ToastTone, string> = {
  success: 'text-gain',
  error: 'text-loss',
  info: 'text-accent',
}

/**
 * Sits above the tab bar, announced politely so it never interrupts a screen
 * reader mid-sentence (§11). Dismissal is the caller's job — the reducer owns
 * toast state, so this stays a pure presenter.
 */
export default function Toast({ state }: { state: ToastState }) {
  return (
    <div aria-live="polite" className="pointer-events-none absolute inset-x-0 bottom-0 z-30 px-gutter pb-3">
      {state && <ToastBody state={state} />}
    </div>
  )
}

function ToastBody({ state }: { state: NonNullable<ToastState> }) {
  const Icon = ICONS[state.tone]
  // Slides in over 180ms (§10). Keyed on the message so a second toast replays
  // rather than swapping its text in place.
  const scope = useToastIn(state.message)

  return (
    <div
      ref={scope}
      className="flex items-center gap-2 rounded-control border border-hairline bg-surface-3 px-3 py-2.5 shadow-elev"
    >
      <span className={TONES[state.tone]}>
        <Icon size={16} />
      </span>
      <span className="text-13 text-text">{state.message}</span>
    </div>
  )
}
