import type { ReactNode } from 'react'

/** Label/value pairs for the review screens. Values are mono — they get checked. */
export default function ReviewCard({
  rows,
  className = '',
}: {
  rows: readonly { label: string; value: ReactNode; tone?: 'default' | 'strong' }[]
  className?: string
}) {
  return (
    <div className={`rounded-card border border-hairline bg-surface-1 ${className}`.trim()}>
      {rows.map((row, i) => (
        <div
          key={row.label}
          className={`flex items-start justify-between gap-3 px-3 py-2.5 ${
            i > 0 ? 'border-t border-hairline' : ''
          }`}
        >
          <span className="shrink-0 text-12 text-text-dim">{row.label}</span>
          <span
            className={`min-w-0 break-words text-right font-mono text-13 tabular-nums ${
              row.tone === 'strong' ? 'text-text' : 'text-text-dim'
            }`}
          >
            {row.value}
          </span>
        </div>
      ))}
    </div>
  )
}
