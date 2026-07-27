import { useWallet } from '../../state/WalletProvider'
import AccountSwitcher from '../wallet/AccountSwitcher'
import NetworkSwitcher from '../wallet/NetworkSwitcher'
import DemoChip from '../brand/DemoChip'
import IconButton from '../primitives/IconButton'
import { Lock } from '../icons'

/** 48px, per §8: account switcher left, network switcher middle, DEMO + lock right. */
export default function Header() {
  const { dispatch } = useWallet()

  return (
    <header className="flex h-header shrink-0 items-center gap-1 border-b border-hairline px-2">
      <div className="min-w-0 flex-1">
        <AccountSwitcher />
      </div>
      <div className="min-w-0 flex-1">
        <NetworkSwitcher />
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        <DemoChip />
        <IconButton label="Lock wallet" onClick={() => dispatch({ type: 'wallet/lock' })}>
          <Lock size={18} />
        </IconButton>
      </div>
    </header>
  )
}
