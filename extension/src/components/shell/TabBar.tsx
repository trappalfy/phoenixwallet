import { useWallet } from '../../state/WalletProvider'
import { useNav } from '../../router/useNav'
import { tabFor } from '../../router/routes'
import type { Route, TabId } from '../../router/routes'
import { Home, Swap, Activity, Settings } from '../icons'

const TABS: readonly { id: TabId; label: string; route: Route; Icon: typeof Home }[] = [
  { id: 'home', label: 'Home', route: { name: 'home', tab: 'tokens' }, Icon: Home },
  { id: 'swap', label: 'Swap', route: { name: 'swap' }, Icon: Swap },
  // Its own destination, not an alias for Home: this used to point at the
  // same route as the Home tab, so pressing it just landed back on Tokens.
  { id: 'activity', label: 'Activity', route: { name: 'home', tab: 'activity' }, Icon: Activity },
  { id: 'settings', label: 'Settings', route: { name: 'settings' }, Icon: Settings },
]

/** 56px, four items (§8). Selecting a tab resets the stack — a tab is a root. */
export default function TabBar() {
  const { route } = useWallet()
  const nav = useNav()
  const active = tabFor(route)

  return (
    <nav
      aria-label="Primary"
      className="flex h-tabbar shrink-0 items-stretch border-t border-hairline bg-ink"
    >
      {TABS.map(({ id, label, route: target, Icon }) => {
        const on = id === active
        return (
          <button
            key={id}
            type="button"
            aria-current={on ? 'page' : undefined}
            onClick={() => nav.reset(target)}
            className={[
              'flex flex-1 flex-col items-center justify-center gap-1 transition-colors duration-state ease-out',
              on ? 'text-accent' : 'text-text-mute hover:text-text-dim',
            ].join(' ')}
          >
            <Icon size={20} />
            <span className="text-11">{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
