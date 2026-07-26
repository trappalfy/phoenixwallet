import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'ghost' | 'quiet' | 'danger'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  /** Full-width — the default for a 360px screen's bottom action. */
  block?: boolean
  /** Trailing hint for a deliberately-disabled control, e.g. `Soon`. */
  hint?: string
  children: ReactNode
}

// The ember gradient on `primary` is one of the four places §5.2 permits it.
// Everything else is ink and surface-* with hairline edges.
//
// A disabled primary drops the gradient entirely rather than fading it: the
// gradient is an information channel, and a dimmed one still reads as "this is
// the action" while also looking like mud.
const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-grad-ember text-ink font-medium disabled:bg-none disabled:bg-surface-2 disabled:text-text-mute',
  ghost: 'border border-hairline bg-surface-1 text-text hover:bg-surface-2 disabled:opacity-40',
  quiet: 'text-text-dim hover:text-text disabled:opacity-40',
  danger: 'border border-loss/40 bg-surface-1 text-loss hover:bg-surface-2 disabled:opacity-40',
}

export default function Button({
  variant = 'primary',
  block = false,
  hint,
  className = '',
  disabled,
  children,
  ...rest
}: Props) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={[
        // 40px floor keeps every control at or above the §5.4 tap target.
        'inline-flex min-h-10 items-center justify-center gap-2 rounded-pill px-4 text-15',
        'transition-[transform,background-color,opacity] duration-press ease-out',
        'active:scale-[0.97] disabled:pointer-events-none',
        VARIANTS[variant],
        block ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
      {hint && (
        <span className="rounded-chip bg-ink/25 px-1.5 py-0.5 font-mono text-11 uppercase leading-none tracking-label">
          {hint}
        </span>
      )}
    </button>
  )
}
