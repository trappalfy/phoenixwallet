// Typed route union with its params (§8). Adding a route here forces the switch
// in Router.tsx to handle it, so an unreachable screen is a compile error rather
// than a dead end found in review.

export type Route =
  // onboarding — create only. There is no import route: a screen asking for a
  // twelve-word recovery phrase is the exact shape of a wallet-phishing
  // extension, and this build has no keyring for a real phrase to unlock.
  | { name: 'welcome' }
  | { name: 'setPassword' }
  | { name: 'seedReveal' }
  | { name: 'seedConfirm' }
  | { name: 'ready' }
  // gate
  | { name: 'unlock' }
  // main
  | { name: 'home'; tab?: 'tokens' | 'nfts' | 'activity' }
  | { name: 'receive' }
  // send flow
  | { name: 'sendTo' }
  | { name: 'sendAmount' }
  | { name: 'sendReview' }
  | { name: 'txStatus'; activityId: string }
  // swap flow
  | { name: 'swap' }
  | { name: 'swapReview' }
  // buy flow
  | { name: 'buy' }
  | { name: 'buyReview' }
  // detail
  | { name: 'nftDetail'; nftId: string }
  | { name: 'activityDetail'; activityId: string }
  // accounts
  | { name: 'accountList' }
  | { name: 'addAccount' }
  | { name: 'renameAccount'; accountId: string }
  // settings
  | { name: 'settings' }
  | { name: 'security' }
  | { name: 'networks' }
  | { name: 'currency' }
  | { name: 'connectedSites' }
  | { name: 'about' }

export type RouteName = Route['name']

/**
 * Rendered without the tab bar, edge to edge (§8): onboarding, the lock gate and
 * every value-moving flow, which should not offer a sideways exit mid-transaction.
 */
const FULL_BLEED = new Set<RouteName>([
  'welcome',
  'setPassword',
  'seedReveal',
  'seedConfirm',
  'ready',
  'unlock',
  'sendTo',
  'sendAmount',
  'sendReview',
  'txStatus',
  'receive',
  'swapReview',
  'buy',
  'buyReview',
])

export const isFullBleed = (route: Route) => FULL_BLEED.has(route.name)

/** Onboarding and unlock also hide the header. */
const NO_HEADER = new Set<RouteName>([
  'welcome',
  'setPassword',
  'seedReveal',
  'seedConfirm',
  'ready',
  'unlock',
])

export const hasHeader = (route: Route) => !NO_HEADER.has(route.name)

export type TabId = 'home' | 'swap' | 'activity' | 'settings'

/** Which tab reads as active for a given route. */
export function tabFor(route: Route): TabId | null {
  switch (route.name) {
    case 'home':
      // Home's own Activity sub-tab is what the bottom bar's Activity tab
      // actually opens (§13's "every tab marks itself current"), so the bar
      // has to follow *which* part of Home is showing, not just that it is.
      return route.tab === 'activity' ? 'activity' : 'home'
    case 'nftDetail':
      return 'home'
    case 'swap':
      return 'swap'
    case 'activityDetail':
      return 'activity'
    case 'settings':
    case 'security':
    case 'networks':
    case 'currency':
    case 'connectedSites':
    case 'about':
    case 'accountList':
    case 'addAccount':
    case 'renameAccount':
      return 'settings'
    default:
      return null
  }
}
