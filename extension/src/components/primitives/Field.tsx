import { useId } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> & {
  label: string
  /** Anything verified character by character is mono (§5.3). */
  mono?: boolean
  /** States what happened and what to do — no apologies, no "Oops" (§6). */
  error?: string
  hint?: ReactNode
  /** Trailing control inside the field, e.g. a Max button or a reveal toggle. */
  trailing?: ReactNode
}

export default function Field({ label, mono, error, hint, trailing, ...rest }: Props) {
  const id = useId()
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <div>
      <label htmlFor={id} className="block text-12 text-text-dim">
        {label}
      </label>
      <div
        className={[
          'mt-1.5 flex items-center gap-2 rounded-control border bg-surface-2 px-3',
          'transition-colors duration-state ease-out focus-within:border-accent/50',
          error ? 'border-loss' : 'border-hairline',
        ].join(' ')}
      >
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={[
            'min-h-10 w-full bg-transparent py-2 text-15 text-text outline-none',
            'placeholder:text-text-mute',
            mono ? 'font-mono tabular-nums' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          {...rest}
        />
        {trailing}
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-12 text-loss">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-12 text-text-mute">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
