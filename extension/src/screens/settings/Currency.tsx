import BackBar from '../../components/shell/BackBar'
import { useWallet } from '../../state/WalletProvider'
import { FX } from '../../mock/db'
import type { CurrencyCode } from '../../mock/db'
import { formatFiat } from '../../lib/format'
import { Check } from '../../components/icons'

const NAMES: Record<CurrencyCode, string> = {
  USD: 'US dollar',
  EUR: 'Euro',
  GBP: 'British pound',
  PLN: 'Polish złoty',
}

/** Whatever the number formatter puts in front of the digits, and nothing else. */
const currencyMark = (code: CurrencyCode) => formatFiat(0, code).replace(/[\d.,\s ]/g, '')

export default function Currency() {
  const { state, dispatch, totals } = useWallet()
  const active = state.prefs.currency

  return (
    <div className="flex h-full flex-col">
      <BackBar title="Currency" />

      <div className="scroll-region flex-1 px-gutter pb-4">
        <p className="pb-2 text-12 text-text-dim">
          Every value in the wallet is shown in this currency.
        </p>

        <div role="radiogroup" aria-label="Display currency" className="space-y-1">
          {(Object.keys(FX) as CurrencyCode[]).map((code) => {
            const on = code === active
            return (
              <button
                key={code}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => dispatch({ type: 'prefs/set', patch: { currency: code } })}
                className={`flex min-h-[52px] w-full items-center gap-3 rounded-card border px-3 text-left transition-colors duration-state ease-out ${
                  on ? 'border-ember/40 bg-surface-1' : 'border-hairline bg-surface-1/60 hover:bg-surface-2'
                }`}
              >
                {/* Taken from the formatter rather than the FX table: Intl prints
                    "PLN 61,964.80" in en-US, and a złoty sign in the same row
                    would contradict the number beside it. */}
                <span className="w-9 shrink-0 text-center font-mono text-15 text-text-dim">
                  {currencyMark(code)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-15 text-text">{code}</span>
                  <span className="block truncate text-11 text-text-mute">{NAMES[code]}</span>
                </span>
                {/* The portfolio in that currency, so the choice is concrete
                    before it is made rather than after. */}
                <span className="shrink-0 font-mono text-12 tabular-nums text-text-dim">
                  {formatFiat(totals.value, code)}
                </span>
                {on && <Check size={16} className="shrink-0 text-ember" />}
              </button>
            )
          })}
        </div>

        {/* TODO(backend): live FX rates keyed off the same codes. */}
        <p className="pt-4 text-11 text-text-mute">
          Rates refresh with the price feed.
        </p>
      </div>
    </div>
  )
}
