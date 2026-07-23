import { useEffect, useRef, useState } from 'react'
import { waitlist } from '../content/copy'
import { useFakeSubmit } from '../hooks/useFakeSubmit'

type Props = { open: boolean; onClose: () => void }

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])'

function trapTab(e: KeyboardEvent, root: HTMLElement | null) {
  if (!root) return
  const items = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE))
  if (!items.length) return
  const first = items[0]
  const last = items[items.length - 1]
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault()
    first.focus()
  }
}

// Keyboard-navigable modal: focus trap, Esc to close, focus restored to trigger.
// No backdrop-blur — that belongs to the nav only (brief §9).
export default function WaitlistModal({ open, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const [email, setEmail] = useState('')
  const { status, submit, reset } = useFakeSubmit()

  useEffect(() => {
    if (!open) return
    const trigger = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    const focusId = window.setTimeout(() => emailRef.current?.focus(), 20)

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'Tab') trapTab(e, dialogRef.current)
    }
    document.addEventListener('keydown', onKey)

    return () => {
      window.clearTimeout(focusId)
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      reset()
      setEmail('')
      trigger?.focus?.()
    }
  }, [open, onClose, reset])

  if (!open) return null
  const done = status === 'done'

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center bg-void/80 p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="waitlist-title"
        className="relative w-full max-w-md rounded-card border border-hairline bg-soot p-8"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-pill text-smoke transition-colors hover:text-bone"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>

        {done ? (
          <div>
            <p className="font-mono text-label uppercase text-flare">✦ confirmed</p>
            <h2 id="waitlist-title" className="mt-3 font-display text-[28px] font-bold tracking-display text-bone">
              {waitlist.success}
            </h2>
            <p className="mt-3 text-body text-smoke">{waitlist.successBody}</p>
            <div className="mt-6 flex items-center gap-2 rounded-input border border-hairline bg-ash/60 px-4 py-3 font-mono text-[13px] text-bone">
              <span className="text-ember">→</span>
              <span className="truncate">{email}</span>
            </div>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              submit(email)
            }}
            noValidate
          >
            <h2 id="waitlist-title" className="font-display text-[28px] font-bold tracking-display text-bone">
              {waitlist.title}
            </h2>
            <p className="mt-3 text-body text-smoke">{waitlist.body}</p>
            <label htmlFor="waitlist-email" className="sr-only">
              Email address
            </label>
            <input
              ref={emailRef}
              id="waitlist-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder={waitlist.emailPlaceholder}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (status === 'error') reset()
              }}
              aria-invalid={status === 'error'}
              className="mt-6 w-full rounded-input border border-hairline bg-ash/60 px-4 py-3.5 font-mono text-[14px] text-bone placeholder:text-smoke/60 focus:border-ember/50"
            />
            {status === 'error' && (
              <p role="alert" className="mt-2 font-mono text-[12px] text-ember">
                {waitlist.invalid}
              </p>
            )}
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="mt-4 w-full rounded-pill bg-ember py-3.5 text-[15px] font-medium text-void transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {status === 'submitting' ? 'Adding you…' : waitlist.button}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
