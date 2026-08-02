import { useTabRail } from '../../lib/motion'

export type TabItem<T extends string> = { id: T; label: string }

type Props<T extends string> = {
  items: readonly TabItem<T>[]
  active: T
  onChange: (id: T) => void
  label: string
}

/**
 * Accent underline that tweens to the active tab over 200 ms (§10). The rail is
 * measured from the live DOM rather than assuming equal widths, so a long label
 * cannot desync it.
 */
export default function Tabs<T extends string>({ items, active, onChange, label }: Props<T>) {
  const scope = useTabRail(active)

  return (
    <div ref={scope} className="relative border-b border-hairline">
      <div role="tablist" aria-label={label} className="flex">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            data-tab={item.id}
            aria-selected={item.id === active}
            tabIndex={item.id === active ? 0 : -1}
            onClick={() => onChange(item.id)}
            className={[
              'min-h-10 flex-1 px-2 text-13 transition-colors duration-state ease-out',
              item.id === active ? 'text-text' : 'text-text-mute hover:text-text-dim',
            ].join(' ')}
          >
            {item.label}
          </button>
        ))}
      </div>
      {/* Position is set by the tween, never by React — two owners of `left`
          would fight every time the active tab changed. */}
      <span
        data-tab-rail
        aria-hidden
        className="absolute -bottom-px left-0 h-0.5 w-0 rounded-pill bg-accent"
      />
    </div>
  )
}
