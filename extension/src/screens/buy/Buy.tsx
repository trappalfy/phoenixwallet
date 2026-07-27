import { useState } from 'react'
import BackBar from '../../components/shell/BackBar'
import Button from '../../components/primitives/Button'
import AssetPicker from '../../components/wallet/AssetPicker'
import PaymentMethodSheet from '../../components/wallet/PaymentMethodSheet'
import TokenGlyph from '../../components/icons/TokenGlyph'
import { useWallet } from '../../state/WalletProvider'
import { useNav } from '../../router/useNav'
import { getChain } from '../../mock/chains'
import { FX, MIN_ORDER_USD, PAYMENT_METHODS } from '../../mock/db'
import { formatCrypto, formatFiat } from '../../lib/format'
import * as api from '../../mock/api'
import { Bank, Card, ChevronDown, Wallet } from '../../components/icons'

/** Round, tappable order sizes, in the display currency (§9.3). */
const CHIPS = [100, 250, 500] as const
const KIND_ICON = { card: Card, wallet: Wallet, bank: Bank } as const

export default function Buy() {
  const { state, dispatch } = useWallet()
  const nav = useNav()
  const [picking, setPicking] = useState(false)
  const [pickingMethod, setPickingMethod] = useState(false)

  const draft = state.drafts.buy
  const chain = getChain(state.activeChainId)
  const { currency } = state.prefs
  const { rate, symbol: currencySymbol } = FX[currency]

  // Buying reaches assets this account may never have held, so the picker is
  // fed by the chain's full catalog rather than the account's holdings.
  const buyable = api.getBuyable(state.activeAccountId, state.activeChainId)
  const asset = buyable.find((t) => t.symbol === draft.symbol) ?? buyable[0]
  const method = PAYMENT_METHODS.find((m) => m.id === draft.methodId) ?? PAYMENT_METHODS[0]
  const MethodIcon = KIND_ICON[method.kind]

  const typed = Number(draft.fiatAmount || 0)
  const spentUsd = typed / rate
  const feeUsd = spentUsd * (method.feePercent / 100)
  const assetAmount = asset.price > 0 ? Math.max(0, spentUsd - feeUsd) / asset.price : 0

  const zeroAmount = typed <= 0
  const belowMin = !zeroAmount && spentUsd < MIN_ORDER_USD
  const overLimit = !zeroAmount && spentUsd > method.limit
  const disabled = zeroAmount || belowMin || overLimit

  const error = belowMin
    ? `Minimum order is ${formatFiat(MIN_ORDER_USD, currency)}.`
    : overLimit
      ? `${method.label} tops out at ${formatFiat(method.limit, currency)} per order.`
      : undefined

  return (
    <div className="flex h-full flex-col">
      <BackBar title="Buy" />
      <div className="scroll-region flex-1 px-gutter pb-4">
        <div
          className={`rounded-card border bg-surface-1 p-4 text-center transition-colors duration-state ease-out ${
            error ? 'border-loss' : 'border-hairline'
          }`}
        >
          <p className="text-12 text-text-dim">You pay</p>
          <div className="flex items-center justify-center gap-1 pt-1">
            <span className="font-display text-17 font-bold text-text-mute">{currencySymbol}</span>
            <input
              inputMode="decimal"
              placeholder="0"
              value={draft.fiatAmount}
              onChange={(e) => {
                const next = e.target.value.replace(/[^0-9.]/g, '')
                if (next.split('.').length > 2) return
                dispatch({ type: 'draft/buy', patch: { fiatAmount: next } })
              }}
              aria-label={`Amount to spend, in ${currency}`}
              aria-invalid={error ? true : undefined}
              className="w-28 max-w-full bg-transparent text-center font-display text-22 font-bold tracking-figure text-text outline-none placeholder:text-text-mute tnum"
            />
          </div>

          <div className="flex justify-center gap-1.5 pt-3">
            {CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => dispatch({ type: 'draft/buy', patch: { fiatAmount: String(chip) } })}
                className={`rounded-chip border px-2.5 py-1 font-mono text-12 tabular-nums transition-colors duration-state ease-out ${
                  draft.fiatAmount === String(chip)
                    ? 'border-ember/50 bg-surface-3 text-text'
                    : 'border-hairline text-text-dim hover:bg-surface-2'
                }`}
              >
                {currencySymbol}
                {chip}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p role="alert" className="pt-1.5 text-center text-12 text-loss">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={() => setPicking(true)}
          className="mt-3 flex w-full items-center gap-3 rounded-card border border-hairline bg-surface-1 p-3 text-left transition-colors duration-state ease-out hover:bg-surface-2"
        >
          <TokenGlyph glyph={asset.glyph} tint={asset.tint} size={32} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-15 text-text">{asset.symbol}</span>
            <span className="block truncate text-11 text-text-mute">{asset.name}</span>
          </span>
          <span className="shrink-0 text-right font-mono text-13 tabular-nums text-text">
            ≈ {formatCrypto(assetAmount, asset.symbol)}
          </span>
          <ChevronDown size={14} className="shrink-0 text-text-mute" />
        </button>

        <button
          type="button"
          onClick={() => setPickingMethod(true)}
          className="mt-2 flex w-full items-center gap-3 rounded-card border border-hairline bg-surface-1 p-3 text-left transition-colors duration-state ease-out hover:bg-surface-2"
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-pill border border-hairline bg-surface-2 text-text-dim">
            <MethodIcon size={16} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-15 text-text">{method.label}</span>
            <span className="block truncate text-11 text-text-mute">{method.eta}</span>
          </span>
          <ChevronDown size={14} className="shrink-0 text-text-mute" />
        </button>

        <dl className="mt-3 space-y-1.5 rounded-card border border-hairline bg-surface-1 p-3 font-mono text-11 tabular-nums">
          <div className="flex justify-between gap-2">
            <dt className="text-text-dim">Provider fee ({method.feePercent}%)</dt>
            <dd className="text-text">{formatFiat(feeUsd, currency)}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-text-dim">Network</dt>
            <dd className="text-text">{chain.name}</dd>
          </div>
        </dl>
      </div>

      <div className="shrink-0 px-gutter pb-3 pt-2">
        <Button
          block
          disabled={disabled}
          onClick={() => {
            dispatch({ type: 'draft/buy', patch: { symbol: asset.symbol } })
            nav.push({ name: 'buyReview' })
          }}
        >
          Review purchase
        </Button>
      </div>

      <AssetPicker
        open={picking}
        onClose={() => setPicking(false)}
        tokens={buyable}
        selected={asset.symbol}
        currency={currency}
        title="Buy"
        onSelect={(symbol) => dispatch({ type: 'draft/buy', patch: { symbol } })}
      />
      <PaymentMethodSheet
        open={pickingMethod}
        onClose={() => setPickingMethod(false)}
        methods={PAYMENT_METHODS}
        selected={method.id}
        currency={currency}
        onSelect={(methodId) => dispatch({ type: 'draft/buy', patch: { methodId } })}
      />
    </div>
  )
}
