import BackBar from '../../components/shell/BackBar'
import ReviewCard from '../../components/wallet/ReviewCard'
import HoldToConfirm from '../../components/wallet/HoldToConfirm'
import AccountFace from '../../components/wallet/AccountFace'
import NothingToSpend from '../../components/wallet/NothingToSpend'
import { useWallet } from '../../state/WalletProvider'
import { useNav } from '../../router/useNav'
import { getChain } from '../../mock/chains'
import { feeFor } from '../../components/wallet/FeeSelector'
import { formatCounterparty, formatCrypto, formatFiat } from '../../lib/format'
import { nftArtStyle } from '../../lib/nftArt'
import * as api from '../../mock/api'

const BASE_FEE = 0.00184

export default function SendReview() {
  const { state, dispatch, tokens, account } = useWallet()
  const nav = useNav()

  const draft = state.drafts.send
  const chain = getChain(state.activeChainId)
  const nft = draft.nftId ? api.getNft(draft.nftId) : undefined
  const token = tokens.find((t) => t.symbol === draft.symbol) ?? tokens[0]
  const amount = Number(draft.amount || 0)
  const fee = feeFor(draft.feeTier, BASE_FEE, draft.customFee)
  const { currency } = state.prefs

  // The fee is always in the chain's native asset, whether or not this account
  // happens to hold any of it.
  const feeSymbol = chain.symbol

  const confirm = () => {
    const entry = api.sendTransaction({
      accountId: state.activeAccountId,
      chainId: state.activeChainId,
      symbol: nft ? nft.name : token.symbol,
      amount: nft ? 1 : amount,
      nftId: nft?.id,
      to: draft.to,
      fee,
    })
    dispatch({ type: 'data/refresh' })
    nav.replace({ name: 'txStatus', activityId: entry.id })
  }

  // Only the token path needs a balance behind it; a collectible carries its own.
  if (!nft && !token) return <NothingToSpend title="Review" chainName={chain.name} />

  return (
    <div className="flex h-full flex-col">
      <BackBar title="Review" />
      <div className="scroll-region flex-1 px-gutter pb-4">
        <div className="flex items-center gap-3 rounded-card border border-hairline bg-surface-1 p-3">
          <AccountFace account={account} size={32} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-13 text-text">{account.name}</span>
            <span className="block font-mono text-11 text-text-mute">sending on {chain.name}</span>
          </span>
        </div>

        <p className="py-2 text-center font-mono text-11 text-text-mute">↓</p>

        <div className="rounded-card border border-hairline bg-surface-1 p-3">
          <span className="block break-all font-mono text-13 text-text">
            {formatCounterparty(draft.to)}
          </span>
        </div>

        {nft ? (
          <div className="mt-4 flex items-center gap-3 rounded-card border border-hairline bg-surface-1 p-3">
            <span
              className="h-12 w-12 shrink-0 rounded-control"
              style={nftArtStyle(nft.art)}
              aria-hidden
            />
            <span className="min-w-0">
              <span className="block truncate text-15 text-text">{nft.name}</span>
              <span className="block truncate text-11 text-text-mute">
                {nft.collection} · #{nft.tokenId}
              </span>
            </span>
          </div>
        ) : (
          <div className="pt-4">
            <p className="font-mono text-11 uppercase tracking-label text-text-mute">Amount</p>
            <p className="pt-0.5 font-display text-22 font-bold tracking-figure text-text tnum">
              {formatCrypto(amount, token.symbol)}
            </p>
            <p className="font-mono text-11 tabular-nums text-text-mute">
              {formatFiat(amount * token.price, currency)}
            </p>
          </div>
        )}

        <ReviewCard
          className="mt-3"
          rows={[
            { label: 'Network', value: chain.name },
            { label: 'Network fee', value: formatCrypto(fee, feeSymbol) },
            {
              label: 'Total',
              tone: 'strong',
              value: nft
                ? `${nft.name} + ${formatCrypto(fee, feeSymbol)}`
                : token.symbol === feeSymbol
                  ? formatCrypto(amount + fee, feeSymbol)
                  : `${formatCrypto(amount, token.symbol)} + ${formatCrypto(fee, feeSymbol)}`,
            },
          ]}
        />
      </div>

      <div className="shrink-0 px-gutter pb-5 pt-2">
        <HoldToConfirm label="Send" onConfirm={confirm} />
        <p className="pt-2 text-center text-11 text-text-mute">Hold to confirm</p>
      </div>
    </div>
  )
}
