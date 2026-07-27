import type { ReactNode } from 'react'
import { ChevronRight } from '../icons'

/**
 * The three row shapes the settings screens need (§9.7): one that navigates, one
 * that shows a value, one that toggles. They share a height and a hit area so a
 * grouped list reads as one list rather than three stacked controls.
 */

export function SettingsGroup({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <section className="pt-3">
      {label && (
        <h2 className="pb-1 font-mono text-11 uppercase tracking-label text-text-mute">{label}</h2>
      )}
      <div className="overflow-hidden rounded-card border border-hairline bg-surface-1">{children}</div>
    </section>
  )
}

type RowProps = {
  icon?: ReactNode
  label: string
  /** Second line — what the row does, or why it is unavailable. */
  detail?: ReactNode
  /** Right-hand side: the current value, a chip, a control. */
  value?: ReactNode
  first?: boolean
}

function Body({ icon, label, detail, value }: RowProps) {
  return (
    <>
      {icon && <span className="shrink-0 text-text-dim">{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-15 text-text">{label}</span>
        {detail && <span className="block truncate text-11 text-text-mute">{detail}</span>}
      </span>
      {value && <span className="shrink-0 text-13 text-text-dim">{value}</span>}
    </>
  )
}

const ROW = 'flex min-h-[52px] w-full items-center gap-3 px-3 py-2 text-left'

export function SettingsNavRow({
  onClick,
  disabled,
  ...body
}: RowProps & { onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        ROW,
        body.first ? '' : 'border-t border-hairline',
        'transition-colors duration-state ease-out hover:bg-surface-2',
        'disabled:pointer-events-none disabled:opacity-45',
      ].join(' ')}
    >
      <Body {...body} />
      <ChevronRight size={16} className="shrink-0 text-text-mute" />
    </button>
  )
}

export function SettingsValueRow(props: RowProps) {
  return (
    <div className={[ROW, props.first ? '' : 'border-t border-hairline'].join(' ')}>
      <Body {...props} />
    </div>
  )
}

export function SettingsToggleRow({
  checked,
  onChange,
  disabled,
  ...body
}: RowProps & { checked: boolean; onChange: (next: boolean) => void; disabled?: boolean }) {
  return (
    <label
      className={[
        ROW,
        body.first ? '' : 'border-t border-hairline',
        disabled ? 'opacity-45' : 'cursor-pointer',
      ].join(' ')}
    >
      <Body {...body} />
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 shrink-0 accent-ember"
      />
    </label>
  )
}
