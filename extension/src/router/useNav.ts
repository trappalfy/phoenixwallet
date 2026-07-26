import { useMemo } from 'react'
import { useWallet } from '../state/WalletProvider'
import type { Route } from './routes'

/** push / replace / back / reset over the history stack in reducer state (§8). */
export function useNav() {
  const { dispatch, state } = useWallet()

  return useMemo(
    () => ({
      push: (route: Route) => dispatch({ type: 'nav/push', route }),
      replace: (route: Route) => dispatch({ type: 'nav/replace', route }),
      back: () => dispatch({ type: 'nav/back' }),
      reset: (route: Route) => dispatch({ type: 'nav/reset', route }),
      /** False on a root screen, so a back control can hide rather than dead-end. */
      canGoBack: state.nav.stack.length > 1,
      depth: state.nav.stack.length,
    }),
    [dispatch, state.nav.stack.length],
  )
}
