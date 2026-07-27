import { useState } from 'react'
import BackBar from '../components/shell/BackBar'
import Button from '../components/primitives/Button'
import Pill from '../components/primitives/Pill'
import ReviewCard from '../components/wallet/ReviewCard'
import EmptyState from '../components/wallet/EmptyState'
import ExplorerSheet from '../components/wallet/ExplorerSheet'
import { useWallet } from '../state/WalletProvider'
import { useNav } from '../router/useNav'
import { getChain } from '../mock/chains'
import { addressFor } from '../mock/db'
import { formatCounterparty, formatCrypto, formatFiat, formatTimestamp } from '../lib/format'
import { copyText } from '../lib/clipboard'
import { Alert, Check, Clock, Copy } from '../components/icons'

const KIND_TITLE = {
  send: 'Sent',
  receive: 'Received',
  swap: 'Swapped',
  approve: 'Approved',
  mint: 'Minted',
  buy: 'Bought',
} as const

export default function ActivityDetail({ activityId }: { activityId: string }) {
  const { state, dispatch, account, tokens } = useWallet()
  const nav = useNav()
  const [copied, setCopied] = useState(false)
  const [explorerOpen, setExplorerOpen] = useState(false)

  const entry = state.activity.find((a) => a.id === activityId)

  if (!entry) {
    return (
      <div className="flex h-full flex-col">
        <BackBar title="Transaction" />
        <EmptyState
          title="Not on this network"
          body="This transaction belongs to another account or network. Switch back to see it."
          action={
            <Button variant="ghost" onClick={() => nav.reset({ name: 'home' })}>
              Back to wallet
            </Button>
          }
        />
      </div>
    )
  }

  const chain = getChain(entry.chainId)
  const mine = addressFor(account, entry.chainId)
  const outgoing = entry.amount < 0
  const { currency } = state.prefs

  // Price is only known for assets the account currently holds; a collectible or
  // a token that has since been sent has none, and inventing one would be worse
  // than leaving the fiat line out. An approval moves nothing, so it has no
  // value either — "$0.00" there would suggest a transfer of zero rather than no
  // transfer at all.
  const price = tokens.find((t) => t.symbol === entry.symbol)?.price
  const fiat =
    price === undefined || entry.amount === 0
      ? null
      : formatFiat(Math.abs(entry.amount) * price, currency)

  const status =
    entry.status === 'confirmed'
      ? { tone: 'gain' as const, Icon: Check, label: 'Confirmed' }
      : entry.status === 'pending'
        ? { tone: 'pending' as const, Icon: Clock, label: 'Pending' }
        : { tone: 'loss' as const, Icon: Alert, label: 'Failed' }

  /**
   * Who the two rows describe, named for what actually happened. An approval has
   * no sender and no recipient — it grants a spender permission — and a mint
   * comes from a collection, not from an address. Labelling all five kinds
   * "From / To" would be uniform and, for three of them, false.
   */
  const parties: readonly { label: string; value: string }[] =
    entry.kind === 'approve'
      ? [
          { label: 'Spender', value: entry.counterparty },
          { label: 'Account', value: mine },
        ]
      : entry.kind === 'swap'
        ? [
            { label: 'Route', value: entry.counterparty },
            { label: 'Account', value: mine },
          ]
        : entry.kind === 'buy'
        ? [
            { label: 'Paid with', value: entry.counterparty },
            { label: 'To', value: mine },
          ]
        : entry.kind === 'mint'
          ? [
              { label: 'Collection', value: entry.counterparty },
              { label: 'To', value: mine },
            ]
          : [
              { label: 'From', value: outgoing ? mine : entry.counterparty },
              { label: 'To', value: outgoing ? entry.counterparty : mine },
            ]

  const onCopyHash = async () => {
    const ok = await copyText(entry.hash)
    dispatch({
      type: 'toast/show',
      toast: ok
        ? { tone: 'success', message: 'Transaction hash copied' }
        : { tone: 'error', message: 'Could not reach the clipboard.' },
    })
    if (ok) {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    }
    window.setTimeout(() => dispatch({ type: 'toast/hide' }), 2200)
  }

  return (
    <div className="flex h-full flex-col">
      <BackBar title="Transaction" />

      <div className="scroll-region flex-1 px-gutter pb-4">
        <div className="flex flex-col items-center pt-2 text-center">
          <Pill tone={status.tone}>
            <status.Icon size={12} />
            {status.label}
          </Pill>
          <h1 className="pt-2 font-display text-17 font-bold tracking-display text-text">
            {KIND_TITLE[entry.kind]}
          </h1>
          <p className="pt-1 font-display text-22 font-bold tracking-figure text-text tnum">
            {entry.kind === 'swap' && entry.toSymbol
              ? `${formatCrypto(Math.abs(entry.amount), entry.symbol)} → ${formatCrypto(entry.toAmount ?? 0, entry.toSymbol)}`
              : entry.amount === 0
                ? entry.symbol
                : `${outgoing ? '−' : '+'}${formatCrypto(Math.abs(entry.amount), entry.symbol)}`}
          </p>
          {fiat && <p className="font-mono text-11 tabular-nums text-text-mute">{fiat}</p>}
        </div>

        {entry.status === 'failed' && entry.reason && (
          <div className="mt-3 flex gap-2.5 rounded-control border border-loss/30 bg-loss/[0.07] p-3">
            <span className="mt-0.5 shrink-0 text-loss">
              <Alert size={16} />
            </span>
            <p className="text-12 text-text-dim">{entry.reason}</p>
          </div>
        )}

        <ReviewCard
          className="mt-3"
          rows={[
            ...parties.map((p) => ({ label: p.label, value: formatCounterparty(p.value) })),
            { label: 'Network', value: chain.name },
            {
              label: 'Network fee',
              value: entry.fee === 0 ? 'None' : formatCrypto(entry.fee, entry.feeSymbol),
            },
            { label: 'When', value: formatTimestamp(entry.at) },
          ]}
        />

        <p className="pb-1 pt-4 font-mono text-11 uppercase tracking-label text-text-mute">
          Transaction hash
        </p>
        <button
          type="button"
          onClick={onCopyHash}
          aria-label={`Copy transaction hash ${entry.hash}`}
          className="flex w-full items-start gap-2 rounded-control border border-hairline bg-surface-1 p-3 text-left transition-colors duration-state ease-out hover:bg-surface-2"
        >
          {/* Full, not truncated: a hash is checked character by character, and
              this is the one place with room to show all of it. */}
          <span className="min-w-0 flex-1 break-all font-mono text-12 text-text-dim">
            {entry.hash}
          </span>
          <span className={`shrink-0 pt-0.5 ${copied ? 'text-gain' : 'text-text-mute'}`}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </span>
        </button>
      </div>

      <div className="shrink-0 px-gutter pb-5 pt-2">
        <Button block variant="ghost" onClick={() => setExplorerOpen(true)}>
          View on {chain.explorer}
        </Button>
        {/* Only offered when the asset is still one this account holds — a sent
            collectible is gone, and its name is not a token symbol. */}
        {entry.kind === 'send' &&
          entry.status === 'confirmed' &&
          tokens.some((t) => t.symbol === entry.symbol) && (
            <div className="pt-2 text-center">
              <Button
                variant="quiet"
                onClick={() => {
                  dispatch({
                    type: 'draft/send',
                    patch: { to: entry.counterparty, symbol: entry.symbol, amount: '', nftId: '' },
                  })
                  nav.push({ name: 'sendAmount' })
                }}
              >
                Send again to {formatCounterparty(entry.counterparty)}
              </Button>
            </div>
          )}
      </div>

      <ExplorerSheet
        open={explorerOpen}
        onClose={() => setExplorerOpen(false)}
        entry={entry}
        chain={chain}
      />
    </div>
  )
}
