import BackBar from '../../components/shell/BackBar'
import ReviewCard from '../../components/wallet/ReviewCard'
import HoldToConfirm from '../../components/wallet/HoldToConfirm'
import TokenGlyph from '../../components/icons/TokenGlyph'
import { useWallet } from '../../state/WalletProvider'
import { useNav } from '../../router/useNav'
import { getChain } from '../../mock/chains'
import { FX, PAYMENT_METHODS } from '../../mock/db'
import { formatCrypto, formatFiat } from '../../lib/format'
import * as api from '../../mock/api'

export default function BuyReview() {
  const { state, dispatch } = useWallet()
  const nav = useNav()

  const draft = state.drafts.buy
  const chain = getChain(state.activeChainId)
  const { currency } = state.prefs
  const rate = FX[currency].rate

  const buyable = api.getBuyable(state.activeAccountId, state.activeChainId)
  const asset = buyable.find((t) => t.symbol === draft.symbol) ?? buyable[0]
  const method = PAYMENT_METHODS.find((m) => m.id === draft.methodId) ?? PAYMENT_METHODS[0]

  const spentUsd = Number(draft.fiatAmount || 0) / rate
  const feeUsd = spentUsd * (method.feePercent / 100)
  const assetAmount = asset.price > 0 ? Math.max(0, spentUsd - feeUsd) / asset.price : 0

  const confirm = () => {
    const entry = api.buyTokens({
      accountId: state.activeAccountId,
      chainId: state.activeChainId,
      symbol: asset.symbol,
      amount: assetAmount,
      spentUsd,
      method: method.label,
    })
    dispatch({ type: 'data/refresh' })
    nav.replace({ name: 'txStatus', activityId: entry.id })
  }

  return (
    <div className="flex h-full flex-col">
      <BackBar title="Review purchase" />
      <div className="scroll-region flex-1 px-gutter pb-4">
        <div className="flex items-center gap-3 rounded-card border border-hairline bg-surface-1 p-3">
          <TokenGlyph glyph={asset.glyph} tint={asset.tint} size={32} />
          <span className="min-w-0 flex-1">
            <span className="block truncate font-mono text-15 tabular-nums text-text">
              {formatCrypto(assetAmount, asset.symbol)}
            </span>
            <span className="block font-mono text-11 tabular-nums text-text-mute">
              {formatFiat(spentUsd, currency)}
            </span>
          </span>
          <span className="shrink-0 font-mono text-11 uppercase tracking-label text-text-mute">
            Buy
          </span>
        </div>

        <ReviewCard
          className="mt-3"
          rows={[
            { label: 'Pay with', value: method.label },
            { label: 'Provider fee', value: formatFiat(feeUsd, currency) },
            { label: 'Total charged', value: formatFiat(spentUsd, currency) },
            { label: 'Delivery', value: method.eta },
            { label: 'Network', tone: 'strong', value: chain.name },
          ]}
        />
      </div>

      <div className="shrink-0 px-gutter pb-5 pt-2">
        <HoldToConfirm label="Buy" onConfirm={confirm} />
        <p className="pt-2 text-center text-11 text-text-mute">Hold to confirm</p>
      </div>
    </div>
  )
}
