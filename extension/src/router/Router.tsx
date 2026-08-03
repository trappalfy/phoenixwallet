import { useWallet } from '../state/WalletProvider'
import { useRouteTransition } from '../lib/motion'
import type { Route } from './routes'
import Welcome from '../screens/onboarding/Welcome'
import SetPassword from '../screens/onboarding/SetPassword'
import SeedReveal from '../screens/onboarding/SeedReveal'
import SeedConfirm from '../screens/onboarding/SeedConfirm'
import Ready from '../screens/onboarding/Ready'
import Unlock from '../screens/Unlock'
import Home from '../screens/Home'
import SendTo from '../screens/send/SendTo'
import SendAmount from '../screens/send/SendAmount'
import SendReview from '../screens/send/SendReview'
import TxStatus from '../screens/send/TxStatus'
import Receive from '../screens/Receive'
import SwapScreen from '../screens/swap/Swap'
import SwapReview from '../screens/swap/SwapReview'
import BuyScreen from '../screens/buy/Buy'
import BuyReview from '../screens/buy/BuyReview'
import NftDetail from '../screens/NftDetail'
import ActivityDetail from '../screens/ActivityDetail'
import AccountList from '../screens/accounts/AccountList'
import AddAccount from '../screens/accounts/AddAccount'
import RenameAccount from '../screens/accounts/RenameAccount'
import Settings from '../screens/settings/Settings'
import Security from '../screens/settings/Security'
import Networks from '../screens/settings/Networks'
import Currency from '../screens/settings/Currency'
import ConnectedSites from '../screens/settings/ConnectedSites'
import About from '../screens/settings/About'

// Name → screen. Every route in the union has one; see the default branch.
function screenFor(route: Route) {
  switch (route.name) {
    case 'welcome':
      return <Welcome />
    case 'setPassword':
      return <SetPassword />
    case 'seedReveal':
      return <SeedReveal />
    case 'seedConfirm':
      return <SeedConfirm />
    case 'ready':
      return <Ready />
    case 'unlock':
      return <Unlock />
    case 'home':
      return <Home tab={route.tab} />
    case 'sendTo':
      return <SendTo />
    case 'sendAmount':
      return <SendAmount />
    case 'sendReview':
      return <SendReview />
    case 'txStatus':
      return <TxStatus activityId={route.activityId} />
    case 'receive':
      return <Receive />
    case 'swap':
      return <SwapScreen />
    case 'swapReview':
      return <SwapReview />
    case 'buy':
      return <BuyScreen />
    case 'buyReview':
      return <BuyReview />
    case 'nftDetail':
      return <NftDetail nftId={route.nftId} />
    case 'activityDetail':
      return <ActivityDetail activityId={route.activityId} />
    case 'accountList':
      return <AccountList />
    case 'addAccount':
      return <AddAccount />
    case 'renameAccount':
      return <RenameAccount accountId={route.accountId} />
    case 'settings':
      return <Settings />
    case 'security':
      return <Security />
    case 'networks':
      return <Networks />
    case 'currency':
      return <Currency />
    case 'connectedSites':
      return <ConnectedSites />
    case 'about':
      return <About />
    default: {
      // Unreachable: every route above is handled. The annotation is what makes
      // that true — adding a route without a screen fails to compile here rather
      // than rendering a blank frame at runtime.
      const unhandled: never = route
      void unhandled
      return null
    }
  }
}

export default function Router() {
  const { route, state } = useWallet()

  // Keyed on the stack depth as well as the name so pushing the same screen
  // twice (Send → Send from a different entry point) still animates.
  const key = `${route.name}-${state.nav.stack.length}`
  const scope = useRouteTransition(state.nav.direction, key)

  return (
    <div key={key} ref={scope} className="h-full">
      {screenFor(route)}
    </div>
  )
}
