import type { CurrencyCode } from '../../mock/db'
import { formatCrypto, formatFiat } from '../../lib/format'

export type FeeTier = 'standard' | 'fast' | 'custom'

/**
 * Fixed multipliers over a base fee. TODO(backend): replace with a real fee
 * oracle — the shape is (tier → native-token amount) plus an ETA string.
 */
const TIERS: readonly { id: FeeTier; label: string; multiplier: number; eta: string }[] = [
  { id: 'standard', label: 'Standard', multiplier: 1, eta: '~30s' },
  { id: 'fast', label: 'Fast', multiplier: 1.8, eta: '~10s' },
  { id: 'custom', label: 'Custom', multiplier: 1, eta: 'You set it' },
]

export function feeFor(tier: FeeTier, base: number, custom: string): number {
  if (tier === 'custom') {
    const parsed = Number(custom)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : base
  }
  return base * (TIERS.find((t) => t.id === tier)?.multiplier ?? 1)
}

export default function FeeSelector({
  tier,
  onTier,
  custom,
  onCustom,
  base,
  nativeSymbol,
  nativePrice,
  currency,
}: {
  tier: FeeTier
  onTier: (t: FeeTier) => void
  custom: string
  onCustom: (v: string) => void
  base: number
  nativeSymbol: string
  nativePrice: number
  currency: CurrencyCode
}) {
  const fee = feeFor(tier, base, custom)
  const active = TIERS.find((t) => t.id === tier)

  return (
    <div>
      <p className="pb-1.5 text-12 text-text-dim">Network fee</p>
      <div className="grid grid-cols-3 gap-1.5">
        {TIERS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onTier(t.id)}
            className={`rounded-control border px-2 py-2 text-center transition-colors duration-state ease-out ${
              t.id === tier
                ? 'border-accent/50 bg-surface-3 text-text'
                : 'border-hairline bg-surface-1 text-text-dim hover:bg-surface-2'
            }`}
          >
            <span className="block text-12">{t.label}</span>
            <span className="block font-mono text-11 text-text-mute">{t.eta}</span>
          </button>
        ))}
      </div>

      {tier === 'custom' && (
        <label className="mt-1.5 flex items-center gap-2 rounded-control border border-hairline bg-surface-2 px-3">
          <input
            inputMode="decimal"
            value={custom}
            onChange={(e) => onCustom(e.target.value.replace(/[^0-9.]/g, ''))}
            placeholder={String(base)}
            aria-label={`Custom fee in ${nativeSymbol}`}
            className="min-h-10 w-full bg-transparent font-mono text-13 text-text outline-none placeholder:text-text-mute tnum"
          />
          <span className="shrink-0 font-mono text-11 text-text-mute">{nativeSymbol}</span>
        </label>
      )}

      <p className="mt-1.5 font-mono text-11 tabular-nums text-text-mute">
        {formatCrypto(fee, nativeSymbol)} · {formatFiat(fee * nativePrice, currency)} · {active?.eta}
      </p>
    </div>
  )
}
