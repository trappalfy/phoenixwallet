import BackBar from '../../components/shell/BackBar'
import ReviewCard from '../../components/wallet/ReviewCard'
import HoldToConfirm from '../../components/wallet/HoldToConfirm'
import SwapRoute from '../../components/wallet/SwapRoute'
import NothingToSpend from '../../components/wallet/NothingToSpend'
import TokenGlyph from '../../components/icons/TokenGlyph'
import { useWallet } from '../../state/WalletProvider'
import { useNav } from '../../router/useNav'
import { getChain } from '../../mock/chains'
import { formatCrypto, formatFiat } from '../../lib/format'
import * as api from '../../mock/api'

const NETWORK_FEE = 0.0031

export default function SwapReview() {
  const { state, dispatch, tokens } = useWallet()
  const nav = useNav()

  const draft = state.drafts.swap
  const chain = getChain(state.activeChainId)

  if (tokens.length < 2) return <NothingToSpend title="Review swap" chainName={chain.name} />

  const from = tokens.find((t) => t.symbol === draft.fromSymbol) ?? tokens[0]
  const to = tokens.find((t) => t.symbol === draft.toSymbol) ?? tokens[1] ?? tokens[0]
  const { currency } = state.prefs

  const fromAmount = Number(draft.fromAmount || 0)
  const rate = to.price > 0 ? from.price / to.price : 0
  const toAmount = fromAmount * rate
  const minReceived = toAmount * (1 - draft.slippage / 100)

  const confirm = () => {
    const entry = api.swap({
      accountId: state.activeAccountId,
      chainId: state.activeChainId,
      fromSymbol: from.symbol,
      toSymbol: to.symbol,
      fromAmount,
      toAmount,
      fee: NETWORK_FEE,
    })
    dispatch({ type: 'data/refresh' })
    nav.replace({ name: 'txStatus', activityId: entry.id })
  }

  const leg = (token: typeof from, amount: number, caption: string) => (
    <div className="flex items-center gap-3 rounded-card border border-hairline bg-surface-1 p-3">
      <TokenGlyph glyph={token.glyph} tint={token.tint} size={32} />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-mono text-15 tabular-nums text-text">
          {formatCrypto(amount, token.symbol)}
        </span>
        <span className="block font-mono text-11 tabular-nums text-text-mute">
          {formatFiat(amount * token.price, currency)}
        </span>
      </span>
      <span className="shrink-0 font-mono text-11 uppercase tracking-label text-text-mute">
        {caption}
      </span>
    </div>
  )

  return (
    <div className="flex h-full flex-col">
      <BackBar title="Review swap" />
      <div className="scroll-region flex-1 px-gutter pb-4">
        {leg(from, fromAmount, 'Pay')}
        <p className="py-2 text-center font-mono text-11 text-text-mute">↓</p>
        {leg(to, toAmount, 'Receive')}

        <ReviewCard
          className="mt-3"
          rows={[
            { label: 'Rate', value: `1 ${from.symbol} = ${formatCrypto(rate, to.symbol)}` },
            { label: 'Max slippage', value: `${draft.slippage}%` },
            { label: 'Minimum received', value: formatCrypto(minReceived, to.symbol) },
            { label: 'Network fee', value: formatCrypto(NETWORK_FEE, chain.symbol) },
            { label: 'Network', tone: 'strong', value: chain.name },
          ]}
        />

        <div className="pt-3">
          <p className="pb-1.5 text-12 text-text-dim">Route</p>
          <SwapRoute from={from} to={to} />
        </div>
      </div>

      <div className="shrink-0 px-gutter pb-5 pt-2">
        <HoldToConfirm label="Swap" onConfirm={confirm} />
        <p className="pt-2 text-center text-11 text-text-mute">Hold to confirm</p>
      </div>
    </div>
  )
}
