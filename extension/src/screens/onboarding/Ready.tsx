import PhoenixMark from '../../components/brand/PhoenixMark'
import Button from '../../components/primitives/Button'
import { useWallet } from '../../state/WalletProvider'
import { useIgnite } from '../../lib/motion'

/**
 * The ignite (§5.5). It happens here and on Unlock, nowhere else — the popup
 * opens dozens of times a day and a wallet that performs on every open becomes
 * annoying by the third launch.
 */
export default function Ready() {
  const { state, dispatch } = useWallet()
  const ignite = useIgnite()

  const accounts = state.accounts.length
  // More than one account can only mean a phrase was restored — creating a
  // wallet always leaves exactly one.
  const restored = accounts > 1

  return (
    <div ref={ignite} className="relative flex h-full flex-col overflow-hidden px-gutter pb-5 pt-16">
      {/* heat rail across the top edge */}
      <div className="absolute inset-x-0 top-0 h-0.5 overflow-hidden">
        <div data-ignite-rail className="h-full w-1/2 bg-grad-ember" />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div data-ignite-mark>
          <PhoenixMark size={72} active />
        </div>
        <h1 className="mt-6 font-display text-22 font-bold tracking-display text-text">
          {restored ? 'Your wallet is back' : 'Your wallet is ready'}
        </h1>
        {/* Says what actually happened. A new wallet is empty and should admit
            it; a restored one reports what came back. */}
        <p className="mt-2 max-w-[28ch] text-13 text-text-dim">
          {restored
            ? `${accounts} accounts came back across eight networks, with their balances and history.`
            : 'One account, empty for now, across eight networks. Receive something to get started.'}
        </p>
        <p className="mt-2 max-w-[28ch] text-13 text-text-mute">
          Your recovery phrase is the only way back in — keep it offline.
        </p>
      </div>

      <Button block onClick={() => dispatch({ type: 'wallet/finishOnboarding' })}>
        Open wallet
      </Button>
    </div>
  )
}
