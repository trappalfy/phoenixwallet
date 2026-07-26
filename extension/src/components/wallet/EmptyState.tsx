import type { ReactNode } from 'react'

/** §6 — an empty state is an invitation, not a shrug. Never "Nothing to display". */
export default function EmptyState({
  title,
  body,
  action,
}: {
  title: string
  body: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
      <p className="font-display text-17 font-bold tracking-display text-text">{title}</p>
      <p className="max-w-[28ch] text-13 text-text-dim">{body}</p>
      {action && <div className="pt-1">{action}</div>}
    </div>
  )
}
