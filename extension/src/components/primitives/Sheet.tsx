import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import IconButton from './IconButton'
import { useSheetIn } from '../../lib/motion'
import { Close } from '../icons'

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

type Props = {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

/**
 * Bottom sheet. role="dialog", focus trapped while open and restored to the
 * trigger on close, Esc closes (§11). The panel is the scroll region; the popup
 * shell behind it never scrolls (§2.5).
 */
export default function Sheet({ open, onClose, title, children }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)
  const scope = useSheetIn(open)

  useEffect(() => {
    if (!open) return
    const trigger = document.activeElement as HTMLElement | null
    const focusId = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus()
    }, 20)

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      const items = Array.from(panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])
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

    document.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(focusId)
      document.removeEventListener('keydown', onKey)
      trigger?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div ref={scope} className="absolute inset-0 z-40 flex flex-col justify-end">
      <div
        data-sheet-backdrop
        className="absolute inset-0 bg-ink/70"
        onMouseDown={onClose}
        aria-hidden
      />
      <div
        ref={panelRef}
        data-sheet-panel
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative max-h-[80%] rounded-t-sheet border-t border-hairline bg-surface-2 shadow-elev"
      >
        <div className="flex items-center justify-between gap-2 px-gutter pb-2 pt-4">
          <h2 className="font-display text-17 font-bold tracking-display text-text">{title}</h2>
          <IconButton label="Close" onClick={onClose}>
            <Close />
          </IconButton>
        </div>
        <div className="scroll-region max-h-[calc(80vh-64px)] px-gutter pb-4">{children}</div>
      </div>
    </div>
  )
}
