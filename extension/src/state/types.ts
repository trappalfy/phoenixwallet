import type { Route } from '../router/routes'
import type { ChainId } from '../mock/chains'
import type { Account, AutoLockMinutes, ConnectedSite, CurrencyCode } from '../mock/db'
import type { Token } from '../mock/tokens'
import type { Nft } from '../mock/nfts'
import type { Activity } from '../mock/activity'
import type { ToastState } from '../components/primitives/Toast'

export type SendDraftState = {
  to: string
  symbol: string
  amount: string
  /** Set when sending a collectible instead of a token; skips the amount step. */
  nftId: string
  feeTier: 'standard' | 'fast' | 'custom'
  customFee: string
}

export type BuyDraftState = {
  symbol: string
  /** What the buyer types, in the display currency. */
  fiatAmount: string
  methodId: string
}

export type SwapDraftState = {
  fromSymbol: string
  toSymbol: string
  fromAmount: string
  slippage: number
}

/** A network the user added by hand on Settings → Networks (§9.7). */
export type CustomNetwork = {
  id: string
  name: string
  symbol: string
  chainRef: string
}

/** Shape fixed by §8, with the additions §9.7's settings screens need. */
export type WalletState = {
  status: 'onboarding' | 'locked' | 'unlocked'
  accounts: readonly Account[]
  activeAccountId: string
  activeChainId: ChainId
  /**
   * Cache of the mock store for the *active account*, refreshed after any
   * mutation and rebuilt when the account or chain changes.
   */
  tokensByChain: Record<ChainId, readonly Token[]>
  nfts: readonly Nft[]
  activity: readonly Activity[]
  /**
   * This wallet's twelve words. Generated for a wallet created in this session,
   * or the sample wallet's phrase once one is restored. Held in state so reveal,
   * confirm and Settings → Security all show the same phrase.
   */
  phrase: readonly string[]
  /** Editable on Settings → Connected sites, so it is state rather than a constant. */
  connectedSites: readonly ConnectedSite[]
  customNetworks: readonly CustomNetwork[]
  prefs: {
    hideSmallBalances: boolean
    currency: CurrencyCode
    showTestnets: boolean
    autoLockMinutes: AutoLockMinutes
    /** Network list order, by id. Reordered on Settings → Networks. */
    chainOrder: readonly ChainId[]
  }
  drafts: {
    send: SendDraftState
    swap: SwapDraftState
    buy: BuyDraftState
  }
  toast: ToastState
  nav: {
    /** Last entry is the current screen; never empty. */
    stack: Route[]
    /** Drives the push/back transition direction (§8). */
    direction: 'forward' | 'back'
  }
}

export type Action =
  | { type: 'nav/push'; route: Route }
  | { type: 'nav/replace'; route: Route }
  | { type: 'nav/back' }
  | { type: 'nav/reset'; route: Route }
  | { type: 'wallet/unlock' }
  | { type: 'wallet/lock' }
  | { type: 'wallet/finishOnboarding' }
  | { type: 'account/select'; accountId: string }
  | { type: 'account/rename'; accountId: string; name: string }
  | { type: 'account/add'; name: string }
  | { type: 'account/setAvatar'; accountId: string; nftId: string | null }
  | { type: 'chain/select'; chainId: ChainId }
  | { type: 'chain/move'; chainId: ChainId; by: -1 | 1 }
  | { type: 'network/add'; network: CustomNetwork }
  | { type: 'network/remove'; id: string }
  | { type: 'sites/disconnect'; id: string }
  | { type: 'prefs/set'; patch: Partial<WalletState['prefs']> }
  | { type: 'draft/send'; patch: Partial<SendDraftState> }
  | { type: 'draft/sendReset' }
  | { type: 'draft/swap'; patch: Partial<SwapDraftState> }
  | { type: 'draft/buy'; patch: Partial<BuyDraftState> }
  | { type: 'toast/show'; toast: NonNullable<ToastState> }
  | { type: 'toast/hide' }
  /** Re-read the mock store after a mutation so balances and activity update. */
  | { type: 'data/refresh' }
