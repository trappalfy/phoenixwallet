import type { Token } from '../../mock/tokens'
import { usdValue } from '../../mock/tokens'
import { getChain } from '../../mock/chains'
import type { CurrencyCode } from '../../mock/db'
import { formatCrypto, formatFiat, formatPercent } from '../../lib/format'
import TokenGlyph from '../icons/TokenGlyph'

export default function TokenRow({
  token,
  currency,
  onClick,
}: {
  token: Token
  currency: CurrencyCode
  onClick?: () => void
}) {
  const up = token.change24h >= 0
  const chain = getChain(token.chainId)

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-row w-full items-center gap-3 rounded-control px-2 text-left transition-colors duration-state ease-out hover:bg-surface-1"
    >
      <TokenGlyph glyph={token.glyph} tint={token.tint} size={32} />

      {/* min-w-0 lets the truncation happen here rather than pushing the value
          column off the row — a 12-character symbol must not break the layout (§11). */}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-15 text-text">{token.symbol}</span>
        <span className="block truncate text-12 text-text-mute">{chain.name}</span>
      </span>

      <span className="shrink-0 text-right">
        <span className="block font-mono text-13 tabular-nums text-text">
          {formatCrypto(token.balance)}
        </span>
        <span className="flex items-center justify-end gap-1.5">
          <span className="font-mono text-11 tabular-nums text-text-mute">
            {formatFiat(usdValue(token), currency)}
          </span>
          <span className={`font-mono text-11 tabular-nums ${up ? 'text-gain' : 'text-loss'}`}>
            {formatPercent(token.change24h)}
          </span>
        </span>
      </span>
    </button>
  )
}
