import { useWallet } from '../../state/WalletProvider'
import { formatFiat, formatPercent } from '../../lib/format'
import { useCountUp } from '../../lib/motion'
import AddressLine from './AddressLine'

/**
 * The total-balance figure is one of the four places §5.2 allows the accent
 * gradient. It is painted through the text rather than behind it — a gradient
 * card with a big number in it is exactly the tell §5.6 warns against.
 *
 * Phase 7 adds the count-up from §10; the figure is deliberately static here.
 */
export default function BalanceHero() {
  const { state, totals, address } = useWallet()
  const { currency } = state.prefs
  const up = totals.change24h >= 0
  const figure = useCountUp(totals.value, (n) => formatFiat(n, currency), { deps: [currency] })

  return (
    <section className="px-gutter pt-3">
      <p className="font-mono text-11 uppercase tracking-label text-text-mute">Total balance</p>

      <div className="mt-1 flex items-baseline gap-2.5">
        {/* The 135° of --grad-accent is tuned for square-ish shapes. Clipped to a
            wide, short line of text it only ever shows the deep-violet end, so the
            figure reads as plain violet and the gradient stops carrying information.
            Same stops, flattened angle, so the full ramp lands across the number. */}
        {/* Counted up on mount and on every change (§10). The text is written by
            the tween, so React must not also render it — hence no children. */}
        <span
          ref={figure}
          aria-label={formatFiat(totals.value, currency)}
          className="bg-clip-text font-display text-34 font-bold tracking-figure text-transparent tnum"
          style={{ backgroundImage: 'linear-gradient(100deg, #7C3AED 0%, #8B5CF6 45%, #C4B5FD 100%)' }}
        />
        {/* An empty portfolio has no 24h change. Showing a green ▲ 0.00% next to
            $0.00 reads as a gain on nothing. */}
        {totals.value > 0 && (
          <span className={`font-mono text-12 tabular-nums ${up ? 'text-gain' : 'text-loss'}`}>
            {up ? '▲' : '▼'} {formatPercent(totals.change24h).replace(/^[+−]/, '')}
          </span>
        )}
      </div>

      <div className="mt-0.5">
        <AddressLine address={address} />
      </div>
    </section>
  )
}
