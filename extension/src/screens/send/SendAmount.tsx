import { useState } from 'react'
import BackBar from '../../components/shell/BackBar'
import Button from '../../components/primitives/Button'
import AmountInput from '../../components/wallet/AmountInput'
import AssetPicker from '../../components/wallet/AssetPicker'
import FeeSelector, { feeFor } from '../../components/wallet/FeeSelector'
import NothingToSpend from '../../components/wallet/NothingToSpend'
import { useWallet } from '../../state/WalletProvider'
import { useNav } from '../../router/useNav'
import { getChain } from '../../mock/chains'
import { formatCounterparty } from '../../lib/format'

/** Base network fee in the chain's native unit. TODO(backend): real estimate. */
const BASE_FEE = 0.00184

export default function SendAmount() {
  const { state, dispatch, tokens } = useWallet()
  const nav = useNav()
  const [pickerOpen, setPickerOpen] = useState(false)

  const draft = state.drafts.send
  const chain = getChain(state.activeChainId)

  // An account added during the session holds nothing, and every line below
  // this one reads tokens[0].
  if (tokens.length === 0) return <NothingToSpend title="Send" chainName={chain.name} />

  const token = tokens.find((t) => t.symbol === draft.symbol) ?? tokens[0]
  const native = tokens[0]
  const amount = Number(draft.amount || 0)
  const fee = feeFor(draft.feeTier, BASE_FEE, draft.customFee)

  // The fee comes out of the native token, which may or may not be the asset
  // being sent — sending your whole ETH balance leaves nothing to pay with.
  const sendingNative = token.symbol === native.symbol
  const needed = sendingNative ? amount + fee : amount
  const shortOnAsset = amount > token.balance
  const shortOnFee = !sendingNative && fee > native.balance
  const shortOnBoth = sendingNative && needed > token.balance && !shortOnAsset

  const error = shortOnAsset
    ? `Not enough ${token.symbol}. You have ${token.balance}.`
    : shortOnBoth
      ? `Not enough ${native.symbol} for the amount plus the network fee. Reduce the amount.`
      : shortOnFee
        ? `Not enough ${native.symbol} for the network fee. Add ${native.symbol}.`
        : undefined

  const canContinue = amount > 0 && !error

  return (
    <div className="flex h-full flex-col">
      <BackBar title="Send" />
      <div className="scroll-region flex-1 px-gutter pb-4">
        <p className="pb-3 font-mono text-11 text-text-mute">
          To {formatCounterparty(draft.to)}
        </p>

        <AmountInput
          token={token}
          value={draft.amount}
          onChange={(amount) => dispatch({ type: 'draft/send', patch: { amount } })}
          onPickAsset={() => setPickerOpen(true)}
          currency={state.prefs.currency}
          error={error}
        />

        <div className="pt-4">
          <FeeSelector
            tier={draft.feeTier}
            onTier={(feeTier) => dispatch({ type: 'draft/send', patch: { feeTier } })}
            custom={draft.customFee}
            onCustom={(customFee) => dispatch({ type: 'draft/send', patch: { customFee } })}
            base={BASE_FEE}
            nativeSymbol={native.symbol}
            nativePrice={native.price}
            currency={state.prefs.currency}
          />
        </div>
      </div>

      <div className="shrink-0 px-gutter pb-5 pt-2">
        <Button block disabled={!canContinue} onClick={() => nav.push({ name: 'sendReview' })}>
          Review
        </Button>
      </div>

      <AssetPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        tokens={tokens}
        selected={token.symbol}
        currency={state.prefs.currency}
        onSelect={(symbol) => dispatch({ type: 'draft/send', patch: { symbol } })}
      />
    </div>
  )
}
