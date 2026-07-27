import type { ReactNode } from 'react'

/**
 * The 3 × 4 mono grid used by reveal, confirm and import (§9.1). Position numbers
 * are part of the data, not decoration: the confirm step has to name which slot
 * is wrong, and users read phrases back by position.
 */
export default function SeedGrid({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`grid grid-cols-3 gap-1.5 ${className}`.trim()}>{children}</div>
}

export function SeedCell({
  index,
  children,
  tone = 'default',
}: {
  index: number
  children: ReactNode
  tone?: 'default' | 'empty' | 'active' | 'error' | 'filled'
}) {
  const border =
    tone === 'error'
      ? 'border-loss'
      : tone === 'filled'
        ? 'border-ember/40'
        : // The slot awaiting input has to stand out from the ones queued behind it.
          tone === 'active'
          ? 'border-dashed border-ember/60'
          : tone === 'empty'
            ? 'border-dashed border-text-mute/40'
            : 'border-hairline'

  return (
    <div
      className={`flex min-h-10 items-center gap-1.5 rounded-control border bg-surface-2 px-2 py-1.5 ${border}`}
    >
      <span className="w-3.5 shrink-0 text-right font-mono text-11 tabular-nums text-text-mute">
        {index + 1}
      </span>
      <span className="min-w-0 flex-1 truncate font-mono text-13 text-text">{children}</span>
    </div>
  )
}
