import type { ReactNode } from 'react'

export type PillTone = 'neutral' | 'gain' | 'loss' | 'accent' | 'pending'

const TONES: Record<PillTone, string> = {
  neutral: 'border-hairline bg-surface-2 text-text-dim',
  gain: 'border-gain/25 bg-gain/10 text-gain',
  loss: 'border-loss/25 bg-loss/10 text-loss',
  accent: 'border-accent/30 bg-accent/10 text-accent',
  pending: 'border-accent-hot/25 bg-accent-hot/10 text-accent-hot',
}

type Props = {
  tone?: PillTone
  /** Numbers are mono so they line up and can be verified character by character (§5.3). */
  mono?: boolean
  children: ReactNode
  className?: string
}

export default function Pill({ tone = 'neutral', mono = false, children, className = '' }: Props) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-pill border px-2 py-0.5 text-11 leading-[1.5]',
        mono ? 'font-mono tabular-nums' : '',
        TONES[tone],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  )
}
