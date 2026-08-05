import { token } from '../content/copy'
import { useCopy } from '../hooks/useCopy'

/** `7xKX…9fRt` — enough to check against a scanner, short enough for 360px. */
function short(address: string) {
  return `${address.slice(0, 4)}…${address.slice(-4)}`
}

/**
 * Fixed bar above the nav, `--bar-h` tall (src/index.css). Two states, both
 * driven by `token.contractAddress`:
 *
 *  - null → one line of text. No address, nothing copyable, no scanner links.
 *    See the comment on the constant for why a placeholder is not an option.
 *  - set  → ticker, the address, a copy button, and links to verify the mint.
 *
 * Same shape as Nav.tsx's StoreCta, which switches on `product.chromeStoreUrl`.
 */
export default function TokenBar() {
  const { copied, copy } = useCopy()
  const address = token.contractAddress

  return (
    <div className="fixed inset-x-0 top-0 z-[60] h-[var(--bar-h)] border-b border-subtle bg-surface/95 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-[1200px] items-center justify-center gap-3 px-4">
        {address ? (
          <>
            <span className="shrink-0 font-mono text-[11px] uppercase tracking-label text-haze">
              {token.symbol ? `$${token.symbol}` : token.label}
            </span>

            {/* The clipboard gets `address`, never the shortened render below. */}
            <button
              type="button"
              onClick={() => copy(address)}
              aria-label={`Copy the ${token.chain} contract address, ${address}`}
              className="flex min-w-0 items-center gap-2 rounded-pill border border-subtle bg-ink/[0.04] px-3 py-1 transition-colors hover:border-accent-500/40"
            >
              <span className="font-mono text-[12px] text-ink sm:hidden">{short(address)}</span>
              <span className="hidden truncate font-mono text-[12px] text-ink sm:inline">
                {address}
              </span>
              <span aria-live="polite" className="shrink-0 text-[11px] text-accent-400">
                {copied ? token.copied : token.copy}
              </span>
            </button>

            {/* Solscan survives the narrow breakpoint and the chart does not:
                checking that the mint is ours is the move that stops someone
                buying an impostor token, and it matters most on the phone where
                the address is shortened and cannot be eyeballed in full. */}
            <div className="flex shrink-0 items-center gap-3">
              <a
                href={`${token.explorerBase}${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-haze transition-colors hover:text-ink"
              >
                {token.explorerLabel}
              </a>
              <a
                href={`${token.dexBase}${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden text-[11px] text-haze transition-colors hover:text-ink sm:inline"
              >
                {token.dexLabel}
              </a>
            </div>
          </>
        ) : (
          <>
            {/* Killed under prefers-reduced-motion by the .animate-pulse rule in
                src/index.css, alongside the shader's own looping classes. */}
            <span aria-hidden className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-pill bg-accent-400" />
            <span className="truncate text-[13px] text-haze sm:hidden">{token.pendingShort}</span>
            <span className="hidden truncate text-[13px] text-haze sm:inline">{token.pending}</span>
          </>
        )}
      </div>
    </div>
  )
}
