import type { Action, WalletState } from './types'
import type { ChainId } from '../mock/chains'
import { CHAINS, getChain } from '../mock/chains'
import {
  ACCOUNTS,
  CONNECTED_SITES,
  FRESH_ACCOUNTS,
  PAYMENT_METHODS,
  RECOVERY_PHRASE,
  newPhrase,
} from '../mock/db'
import * as api from '../mock/api'
import { START_AT } from '../config'
import type { Route } from '../router/routes'

/**
 * The slices that depend on (account, chain). Read together so they can never
 * disagree — §13 asks for header, balance, tokens, NFTs and activity to move as
 * one, and the only way to guarantee that is to refresh them in one place.
 */
function snapshot(accountId: string, chainId: ChainId) {
  return {
    tokensByChain: Object.fromEntries(
      CHAINS.map((c) => [c.id, api.getTokens(accountId, c.id)]),
    ) as WalletState['tokensByChain'],
    nfts: api.getNfts(accountId, chainId),
    activity: api.getActivity(accountId, chainId),
  }
}

const START_ROUTE: Route = { name: START_AT }

/**
 * Which wallet the app opens with. Starting on Welcome means nobody has a wallet
 * yet, so it is the empty one; every other entry point is a returning user, who
 * by definition already has theirs.
 */
const FIRST_RUN = START_AT === 'welcome'
const startAccounts = FIRST_RUN ? FRESH_ACCOUNTS : ACCOUNTS

export const initialState: WalletState = {
  // There is no persistence, so first-run versus returning is a dev switch
  // rather than storage (§8). START_AT in config.ts opens any flow directly.
  status: START_AT === 'welcome' ? 'onboarding' : START_AT === 'unlock' ? 'locked' : 'unlocked',
  accounts: startAccounts,
  activeAccountId: startAccounts[0].id,
  activeChainId: 'ethereum',
  ...snapshot(startAccounts[0].id, 'ethereum'),
  // A wallet created here gets its own twelve words; the seeded one already has
  // its own, and that is the phrase the import screen accepts.
  phrase: FIRST_RUN ? newPhrase() : RECOVERY_PHRASE,
  // A wallet nobody has used yet has connected to nothing.
  connectedSites: FIRST_RUN ? [] : CONNECTED_SITES,
  customNetworks: [],
  prefs: {
    hideSmallBalances: false,
    currency: 'USD',
    showTestnets: false,
    autoLockMinutes: 5,
    chainOrder: CHAINS.map((c) => c.id),
  },
  drafts: {
    send: { to: '', symbol: 'ETH', amount: '', nftId: '', feeTier: 'standard', customFee: '' },
    swap: { fromSymbol: 'ETH', toSymbol: 'USDC', fromAmount: '', slippage: 0.5 },
    buy: { symbol: 'ETH', fiatAmount: '', methodId: PAYMENT_METHODS[0].id },
  },
  toast: null,
  nav: { stack: [START_ROUTE], direction: 'forward' },
}

export function reducer(state: WalletState, action: Action): WalletState {
  switch (action.type) {
    case 'nav/push':
      return { ...state, nav: { stack: [...state.nav.stack, action.route], direction: 'forward' } }

    case 'nav/replace':
      return {
        ...state,
        nav: { stack: [...state.nav.stack.slice(0, -1), action.route], direction: 'forward' },
      }

    case 'nav/back':
      // The stack is never emptied: the root screen has nowhere to go back to.
      if (state.nav.stack.length <= 1) return state
      return { ...state, nav: { stack: state.nav.stack.slice(0, -1), direction: 'back' } }

    case 'nav/reset':
      return { ...state, nav: { stack: [action.route], direction: 'forward' } }

    case 'wallet/unlock':
      return { ...state, status: 'unlocked', nav: { stack: [{ name: 'home' }], direction: 'forward' } }

    case 'wallet/lock':
      return { ...state, status: 'locked', nav: { stack: [{ name: 'unlock' }], direction: 'forward' } }

    case 'wallet/finishOnboarding':
      // Deliberately does not touch the accounts. Creating a wallet leaves the
      // empty one already in state; restoring one has replaced it by now.
      return { ...state, status: 'unlocked', nav: { stack: [{ name: 'home' }], direction: 'forward' } }

    case 'wallet/restore':
      // The phrase belongs to a wallet that has been in use, so everything that
      // wallet accumulated comes back with it: accounts, balances, collectibles,
      // history and the sites it had connected to.
      return {
        ...state,
        accounts: ACCOUNTS,
        activeAccountId: ACCOUNTS[0].id,
        // The restored wallet's phrase replaces whatever this session generated.
        phrase: RECOVERY_PHRASE,
        connectedSites: CONNECTED_SITES,
        ...snapshot(ACCOUNTS[0].id, state.activeChainId),
      }

    case 'account/select':
      return {
        ...state,
        activeAccountId: action.accountId,
        ...snapshot(action.accountId, state.activeChainId),
      }

    case 'account/rename':
      return {
        ...state,
        accounts: state.accounts.map((a) =>
          a.id === action.accountId ? { ...a, name: action.name } : a,
        ),
      }

    case 'account/add': {
      const account = api.createAccount(action.name)
      return {
        ...state,
        accounts: [...state.accounts, account],
        activeAccountId: account.id,
        ...snapshot(account.id, state.activeChainId),
      }
    }

    case 'account/setAvatar':
      return {
        ...state,
        accounts: state.accounts.map((a) =>
          a.id === action.accountId ? { ...a, avatarNftId: action.nftId ?? undefined } : a,
        ),
      }

    case 'chain/select':
      // Switching network must move the header, balance, tokens, NFTs and
      // activity together (§13) — so the cached slices are re-read here.
      return {
        ...state,
        activeChainId: action.chainId,
        ...snapshot(state.activeAccountId, action.chainId),
      }

    case 'chain/move': {
      const order = [...state.prefs.chainOrder]
      const from = order.indexOf(action.chainId)
      if (from < 0) return state

      // Swap with the nearest neighbour of the same kind. Mainnets and testnets
      // are listed separately, so a plain index swap could trade a mainnet with
      // a hidden testnet and look like the button did nothing.
      const testnet = !!getChain(action.chainId).testnet
      let to = from + action.by
      while (to >= 0 && to < order.length && !!getChain(order[to]).testnet !== testnet) {
        to += action.by
      }
      if (to < 0 || to >= order.length) return state

      ;[order[from], order[to]] = [order[to], order[from]]
      return { ...state, prefs: { ...state.prefs, chainOrder: order } }
    }

    case 'network/add':
      return { ...state, customNetworks: [...state.customNetworks, action.network] }

    case 'network/remove':
      return { ...state, customNetworks: state.customNetworks.filter((n) => n.id !== action.id) }

    case 'sites/disconnect':
      return { ...state, connectedSites: state.connectedSites.filter((s) => s.id !== action.id) }

    case 'prefs/set':
      return { ...state, prefs: { ...state.prefs, ...action.patch } }

    case 'draft/send':
      return { ...state, drafts: { ...state.drafts, send: { ...state.drafts.send, ...action.patch } } }

    case 'draft/sendReset':
      return {
        ...state,
        drafts: { ...state.drafts, send: initialState.drafts.send },
      }

    case 'draft/swap':
      return { ...state, drafts: { ...state.drafts, swap: { ...state.drafts.swap, ...action.patch } } }

    case 'draft/buy':
      return { ...state, drafts: { ...state.drafts, buy: { ...state.drafts.buy, ...action.patch } } }

    case 'toast/show':
      return { ...state, toast: action.toast }

    case 'toast/hide':
      return { ...state, toast: null }

    case 'data/refresh':
      return { ...state, ...snapshot(state.activeAccountId, state.activeChainId) }
  }
}
