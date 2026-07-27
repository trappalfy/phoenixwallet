import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> & {
  /** Required: an icon-only control has no other accessible name (§11). */
  label: string
  children: ReactNode
  tone?: 'default' | 'active'
}

export default function IconButton({
  label,
  tone = 'default',
  className = '',
  children,
  ...rest
}: Props) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={[
        'grid h-10 w-10 place-items-center rounded-pill',
        'transition-[transform,background-color,color] duration-press ease-out',
        'active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40',
        tone === 'active' ? 'text-ember' : 'text-text-dim hover:bg-surface-2 hover:text-text',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </button>
  )
}
