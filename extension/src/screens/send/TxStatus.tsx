import { useEffect, useState } from 'react'
import PhoenixMark from '../../components/brand/PhoenixMark'
import Button from '../../components/primitives/Button'
import ReviewCard from '../../components/wallet/ReviewCard'
import ExplorerSheet from '../../components/wallet/ExplorerSheet'
import { useWallet } from '../../state/WalletProvider'
import { useNav } from '../../router/useNav'
import { getChain } from '../../mock/chains'
import { formatCounterparty, formatCrypto, truncateHash } from '../../lib/format'
import { useHeatRail } from '../../lib/motion'
import * as api from '../../mock/api'

/** How long the pending state is held before it settles. */
const SETTLE_MS = 1800

export default function TxStatus({ activityId }: { activityId: string }) {
  const { state, dispatch } = useWallet()
  const nav = useNav()
  const [settled, setSettled] = useState(false)
  const [explorerOpen, setExplorerOpen] = useState(false)
  const rail = useHeatRail(!settled)

  const entry = state.activity.find((a) => a.id === activityId)

  useEffect(() => {
    const id = window.setTimeout(() => {
      api.settleActivity(activityId, 'confirmed')
      dispatch({ type: 'data/refresh' })
      setSettled(true)
    }, SETTLE_MS)
    return () => window.clearTimeout(id)
  }, [activityId, dispatch])

  if (!entry) {
    // Only reachable if the entry was filtered out by a chain switch mid-flight.
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-gutter text-center">
        <p className="text-13 text-text-dim">That transaction is not on this network.</p>
        <Button variant="ghost" onClick={() => nav.reset({ name: 'home' })}>
          Done
        </Button>
      </div>
    )
  }

  const chain = getChain(entry.chainId)
  const isSwap = entry.kind === 'swap'
  const isBuy = entry.kind === 'buy'

  return (
    <div
      ref={rail}
      className="relative flex h-full flex-col overflow-hidden px-gutter pb-5 pt-6"
    >
      {/* Heat rail loops while pending, then stops (§10). */}
      <div className="absolute inset-x-0 top-0 h-0.5 overflow-hidden">
        {!settled && <div data-heat-rail className="h-full w-1/3 bg-grad-accent" />}
      </div>

      <div className="flex flex-1 flex-col items-center justify-center text-center">
        {/* Not the ignite: §5.5 keeps that to Unlock and Ready. The mark simply
            comes up to full strength when the transaction settles. */}
        <div className={`transition-opacity duration-state ${settled ? 'opacity-100' : 'opacity-70'}`}>
          <PhoenixMark size={56} active={settled} className="text-text-dim" />
        </div>
        <h1 className="mt-5 font-display text-22 font-bold tracking-display text-text">
          {settled
            ? isSwap
              ? 'Swapped'
              : isBuy
                ? 'Bought'
                : 'Sent'
            : isSwap
              ? 'Swapping…'
              : isBuy
                ? 'Buying…'
                : 'Sending…'}
        </h1>
        <p className="mt-1 font-mono text-13 tabular-nums text-text-dim">
          {isSwap && entry.toSymbol
            ? `${formatCrypto(Math.abs(entry.amount), entry.symbol)} → ${formatCrypto(entry.toAmount ?? 0, entry.toSymbol)}`
            : formatCrypto(Math.abs(entry.amount), entry.symbol)}
        </p>
      </div>

      <ReviewCard
        rows={[
          {
            label: isSwap ? 'Route' : isBuy ? 'Paid with' : 'To',
            value: formatCounterparty(entry.counterparty),
          },
          { label: 'Network', value: chain.name },
          { label: 'Network fee', value: formatCrypto(entry.fee, entry.feeSymbol) },
          { label: 'Transaction', tone: 'strong', value: truncateHash(entry.hash) },
        ]}
      />

      <div className="space-y-2 pt-3">
        <Button block variant="ghost" onClick={() => setExplorerOpen(true)}>
          View on {chain.explorer}
        </Button>
        <Button
          block
          disabled={!settled}
          onClick={() => {
            dispatch({ type: 'draft/sendReset' })
            nav.reset({ name: 'home' })
          }}
        >
          Done
        </Button>
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
