import { createContext, useContext, useMemo, useReducer } from 'react'
import type { Dispatch, ReactNode } from 'react'
import { initialState, reducer } from './reducer'
import type { Action, WalletState } from './types'
import type { Account } from '../mock/db'
import { addressFor } from '../mock/db'
import type { Token } from '../mock/tokens'
import { usdValue } from '../mock/tokens'
import type { Route } from '../router/routes'

type Ctx = {
  state: WalletState
  dispatch: Dispatch<Action>
  /** Derived, so screens never recompute the same lookups. */
  account: Account
  address: string
  tokens: readonly Token[]
  /** Portfolio value in USD and its value-weighted 24h change. */
  totals: { value: number; change24h: number }
  route: Route
}

const WalletContext = createContext<Ctx | null>(null)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const value = useMemo<Ctx>(() => {
    const account =
      state.accounts.find((a) => a.id === state.activeAccountId) ?? state.accounts[0]
    const tokens = state.tokensByChain[state.activeChainId]
    const value = tokens.reduce((sum, t) => sum + usdValue(t), 0)
    const weighted = tokens.reduce((sum, t) => sum + usdValue(t) * t.change24h, 0)

    return {
      state,
      dispatch,
      account,
      address: addressFor(account, state.activeChainId),
      tokens,
      totals: { value, change24h: value === 0 ? 0 : weighted / value },
      route: state.nav.stack[state.nav.stack.length - 1],
    }
  }, [state])

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet(): Ctx {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWallet must be used inside <WalletProvider>')
  return ctx
}
