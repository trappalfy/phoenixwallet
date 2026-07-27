import { useNav } from '../../router/useNav'
import type { Route } from '../../router/routes'
import { Send, Receive, Swap, Buy } from '../icons'

type Item = {
  label: string
  Icon: typeof Send
  route?: Route
  /** Deliberately unavailable, labelled rather than silently dead (§6). */
  soon?: true
}

const ITEMS: readonly Item[] = [
  { label: 'Send', Icon: Send, route: { name: 'sendTo' } },
  { label: 'Receive', Icon: Receive, route: { name: 'receive' } },
  { label: 'Swap', Icon: Swap, route: { name: 'swap' } },
  { label: 'Buy', Icon: Buy, route: { name: 'buy' } },
]

export default function ActionRow() {
  const nav = useNav()

  return (
    <div className="grid grid-cols-4 gap-2 px-gutter pt-4">
      {ITEMS.map(({ label, Icon, route, soon }) => (
        <button
          key={label}
          type="button"
          disabled={soon}
          onClick={() => route && nav.push(route)}
          className="relative flex flex-col items-center gap-1.5 rounded-card border border-hairline bg-surface-1 py-2.5 transition-[transform,background-color] duration-press ease-out hover:bg-surface-2 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40"
        >
          <span className="text-ember">
            <Icon size={20} />
          </span>
          <span className="text-12 text-text">{label}</span>
          {/* Corner chip rather than a third line: a stacked label would make this
              cell taller than its three siblings, and 9px is off the §5.3 scale. */}
          {soon && (
            <span className="absolute right-1 top-1 rounded-chip bg-surface-3 px-1 font-mono text-11 uppercase leading-tight tracking-label text-text-mute">
              Soon
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
