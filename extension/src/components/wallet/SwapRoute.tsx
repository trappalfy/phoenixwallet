import type { Token } from '../../mock/tokens'

/**
 * The route as a small SVG path with two hops (§9.6). Static — the mock layer
 * has no router. TODO(backend): the real path comes from the quote, so this
 * takes a list of hops rather than a hardcoded middle.
 */
export default function SwapRoute({ from, to }: { from: Token; to: Token }) {
  const mid = from.symbol === 'USDC' || to.symbol === 'USDC' ? 'WETH' : 'USDC'

  return (
    <div>
      <svg viewBox="0 0 300 34" className="h-[34px] w-full" aria-hidden>
        <path
          d="M14 17 H98"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-hairline"
          strokeDasharray="3 3"
        />
        <path
          d="M150 17 H236"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-hairline"
          strokeDasharray="3 3"
        />
        {[14, 124, 286].map((cx) => (
          <circle key={cx} cx={cx} cy="17" r="4" fill="currentColor" className="text-ember" />
        ))}
        <path d="M236 17 H286" stroke="currentColor" strokeWidth="1.5" className="text-hairline" strokeDasharray="3 3" />
      </svg>

      <div className="-mt-1 flex justify-between font-mono text-11 text-text-dim">
        <span>{from.symbol}</span>
        <span>{mid}</span>
        <span>{to.symbol}</span>
      </div>
    </div>
  )
}
