import type { Token } from '../../mock/tokens'
import type { CurrencyCode } from '../../mock/db'
import { formatCrypto, formatFiat } from '../../lib/format'
import TokenGlyph from '../icons/TokenGlyph'
import { ChevronDown } from '../icons'

export default function AmountInput({
  token,
  value,
  onChange,
  onPickAsset,
  currency,
  error,
}: {
  token: Token
  value: string
  onChange: (next: string) => void
  onPickAsset: () => void
  currency: CurrencyCode
  error?: string
}) {
  const amount = Number(value || 0)
  const fiat = Number.isFinite(amount) ? amount * token.price : 0

  return (
    <div>
      <div
        className={`rounded-card border bg-surface-1 p-3 transition-colors duration-state ease-out focus-within:border-accent/50 ${
          error ? 'border-loss' : 'border-hairline'
        }`}
      >
        <div className="flex items-center gap-2">
          <input
            // inputMode numeric rather than type=number: the spinner and locale
            // decimal handling of a number input both get in the way of a mono
            // crypto amount.
            inputMode="decimal"
            placeholder="0"
            value={value}
            onChange={(e) => {
              const next = e.target.value.replace(/[^0-9.]/g, '')
              if (next.split('.').length > 2) return
              onChange(next)
            }}
            aria-label="Amount"
            aria-invalid={error ? true : undefined}
            className="min-w-0 flex-1 bg-transparent font-display text-22 font-bold tracking-figure text-text outline-none placeholder:text-text-mute tnum"
          />
          <button
            type="button"
            onClick={onPickAsset}
            className="flex shrink-0 items-center gap-1.5 rounded-pill border border-hairline bg-surface-2 py-1 pl-1 pr-2 transition-colors duration-state ease-out hover:bg-surface-3"
          >
            <TokenGlyph glyph={token.glyph} tint={token.tint} size={24} />
            <span className="text-13 text-text">{token.symbol}</span>
            <ChevronDown size={13} className="text-text-mute" />
          </button>
        </div>

        <div className="mt-1.5 flex items-center justify-between gap-2">
          <span className="font-mono text-11 tabular-nums text-text-mute">
            ≈ {formatFiat(fiat, currency)}
          </span>
          <span className="flex items-center gap-2">
            <span className="font-mono text-11 tabular-nums text-text-mute">
              Balance {formatCrypto(token.balance)}
            </span>
            <button
              type="button"
              onClick={() => onChange(String(token.balance))}
              className="rounded-chip bg-surface-3 px-1.5 py-0.5 font-mono text-11 uppercase tracking-label text-accent transition-colors duration-state ease-out hover:bg-surface-2"
            >
              Max
            </button>
          </span>
        </div>
      </div>
      {error && (
        <p role="alert" className="mt-1.5 text-12 text-loss">
          {error}
        </p>
      )}
    </div>
  )
}
