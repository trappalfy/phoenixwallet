import type { ReactNode } from 'react'
import { useNav } from '../../router/useNav'
import IconButton from '../primitives/IconButton'
import { ChevronLeft } from '../icons'

/**
 * Title row for stacked screens. Every screen needs a working back path (§13),
 * so the control is part of the frame rather than each screen's business.
 * Height matches the shell header at 48px, so flows that hide the header do not
 * shift their content.
 */
export default function BackBar({
  title,
  trailing,
  onBack,
}: {
  title: string
  trailing?: ReactNode
  onBack?: () => void
}) {
  const nav = useNav()
  const back = onBack ?? nav.back

  return (
    <div className="flex h-header shrink-0 items-center gap-1 px-2">
      <IconButton label="Back" onClick={back}>
        <ChevronLeft size={18} />
      </IconButton>
      <h1 className="min-w-0 flex-1 truncate text-15 text-text">{title}</h1>
      {trailing}
    </div>
  )
}
