import { useState } from 'react'
import Button from '../../components/primitives/Button'
import Divider from '../../components/primitives/Divider'
import AmountInput from '../../components/wallet/AmountInput'
import AssetPicker from '../../components/wallet/AssetPicker'
import SwapRoute from '../../components/wallet/SwapRoute'
import NothingToSpend from '../../components/wallet/NothingToSpend'
import { useWallet } from '../../state/WalletProvider'
import { useNav } from '../../router/useNav'
import { getChain } from '../../mock/chains'
import { formatCrypto, formatFiat } from '../../lib/format'
import TokenGlyph from '../../components/icons/TokenGlyph'
import { Swap as SwapIcon, ChevronDown, ChevronUp } from '../../components/icons'

const SLIPPAGES = [0.1, 0.5, 1] as const
/** TODO(backend): a real quote endpoint replaces price-ratio maths. */
const NETWORK_FEE = 0.0031

export default function Swap() {
  const { state, dispatch, tokens } = useWallet()
  const nav = useNav()
  const [picking, setPicking] = useState<'from' | 'to' | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const draft = state.drafts.swap
  const chain = getChain(state.activeChainId)

  // Swapping needs at least two assets to be a swap at all.
  if (tokens.length < 2) return <NothingToSpend title="Swap" chainName={chain.name} />

  const from = tokens.find((t) => t.symbol === draft.fromSymbol) ?? tokens[0]
  const to = tokens.find((t) => t.symbol === draft.toSymbol) ?? tokens[1] ?? tokens[0]
  const native = tokens[0]
  const { currency } = state.prefs

  const fromAmount = Number(draft.fromAmount || 0)
  const rate = to.price > 0 ? from.price / to.price : 0
  const toAmount = fromAmount * rate
  const minReceived = toAmount * (1 - draft.slippage / 100)

  const sameToken = from.symbol === to.symbol
  const zeroAmount = fromAmount <= 0
  const insufficient = fromAmount > from.balance
  const disabled = sameToken || zeroAmount || insufficient

  const swapSides = () =>
    dispatch({
      type: 'draft/swap',
      patch: { fromSymbol: to.symbol, toSymbol: from.symbol, fromAmount: '' },
    })

  return (
    <div className="flex h-full flex-col">
      <div className="scroll-region flex-1 px-gutter pb-4 pt-3">
        <AmountInput
          token={from}
          value={draft.fromAmount}
          onChange={(fromAmount) => dispatch({ type: 'draft/swap', patch: { fromAmount } })}
          onPickAsset={() => setPicking('from')}
          currency={currency}
          error={
            insufficient
              ? `Not enough ${from.symbol}. You have ${formatCrypto(from.balance)}.`
              : undefined
          }
        />

        <div className="relative h-3">
          <button
            type="button"
            onClick={swapSides}
            aria-label="Swap the two assets"
            className="absolute left-1/2 top-1/2 grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-pill border border-hairline bg-surface-2 text-text-dim transition-[transform,color] duration-press ease-out hover:text-text active:scale-90"
          >
            <SwapIcon size={16} />
          </button>
        </div>

        {/* The receiving panel is derived, never typed into — editing both sides
            invites a rounding fight the user always loses. */}
        <div className="rounded-card border border-hairline bg-surface-1 p-3">
          <div className="flex items-center gap-2">
            <span className="min-w-0 flex-1 truncate font-display text-22 font-bold tracking-figure text-text tnum">
              {toAmount > 0 ? formatCrypto(toAmount) : '0'}
            </span>
            <button
              type="button"
              onClick={() => setPicking('to')}
              className="flex shrink-0 items-center gap-1.5 rounded-pill border border-hairline bg-surface-2 py-1 pl-1 pr-2 transition-colors duration-state ease-out hover:bg-surface-3"
            >
              <TokenGlyph glyph={to.glyph} tint={to.tint} size={24} />
              <span className="text-13 text-text">{to.symbol}</span>
              <ChevronDown size={13} className="text-text-mute" />
            </button>
          </div>
          <div className="mt-1.5 flex items-center justify-between gap-2">
            <span className="font-mono text-11 tabular-nums text-text-mute">
              ≈ {formatFiat(toAmount * to.price, currency)}
            </span>
            <span className="font-mono text-11 tabular-nums text-text-mute">
              Balance {formatCrypto(to.balance)}
            </span>
          </div>
        </div>

        {sameToken && (
          <p role="alert" className="pt-2 text-12 text-loss">
            Pick two different assets to swap between.
          </p>
        )}

        <p className="pt-3 font-mono text-12 tabular-nums text-text-dim">
          1 {from.symbol} = {formatCrypto(rate, to.symbol)}
        </p>

        <button
          type="button"
          onClick={() => setDetailsOpen((v) => !v)}
          aria-expanded={detailsOpen}
          className="mt-2 flex min-h-10 w-full items-center justify-between text-12 text-text-dim transition-colors duration-state ease-out hover:text-text"
        >
          Details
          {detailsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {detailsOpen && (
          <div className="rounded-card border border-hairline bg-surface-1 p-3">
            <p className="pb-1.5 text-12 text-text-dim">Max slippage</p>
            <div className="flex gap-1.5">
              {SLIPPAGES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => dispatch({ type: 'draft/swap', patch: { slippage: s } })}
                  className={`flex-1 rounded-chip border px-2 py-1 font-mono text-11 tabular-nums transition-colors duration-state ease-out ${
                    draft.slippage === s
                      ? 'border-ember/50 bg-surface-3 text-text'
                      : 'border-hairline text-text-dim hover:bg-surface-2'
                  }`}
                >
                  {s}%
                </button>
              ))}
              <input
                inputMode="decimal"
                aria-label="Custom slippage percent"
                placeholder="Custom"
                onChange={(e) => {
                  const v = Number(e.target.value.replace(/[^0-9.]/g, ''))
                  if (v > 0 && v <= 50) dispatch({ type: 'draft/swap', patch: { slippage: v } })
                }}
                className="w-[68px] rounded-chip border border-hairline bg-surface-2 px-2 py-1 text-center font-mono text-11 text-text outline-none placeholder:text-text-mute tnum"
              />
            </div>

            <Divider className="my-3" />

            <dl className="space-y-1.5 font-mono text-11 tabular-nums">
              <div className="flex justify-between gap-2">
                <dt className="text-text-dim">Network fee</dt>
                <dd className="text-text">{formatCrypto(NETWORK_FEE, native.symbol)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-text-dim">Minimum received</dt>
                <dd className="text-text">{formatCrypto(minReceived, to.symbol)}</dd>
              </div>
            </dl>

            <div className="pt-3">
              <p className="pb-1.5 text-12 text-text-dim">Route</p>
              <SwapRoute from={from} to={to} />
            </div>
          </div>
        )}
      </div>

      <div className="shrink-0 px-gutter pb-3 pt-2">
        <Button block disabled={disabled} onClick={() => nav.push({ name: 'swapReview' })}>
          Review swap
        </Button>
      </div>

      <AssetPicker
        open={picking !== null}
        onClose={() => setPicking(null)}
        tokens={tokens}
        selected={picking === 'to' ? to.symbol : from.symbol}
        currency={currency}
        title={picking === 'to' ? 'Receive' : 'Pay with'}
        onSelect={(symbol) =>
          dispatch({
            type: 'draft/swap',
            patch: picking === 'to' ? { toSymbol: symbol } : { fromSymbol: symbol },
          })
        }
      />
    </div>
  )
}
