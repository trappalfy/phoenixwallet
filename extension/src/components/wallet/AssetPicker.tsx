import { useState } from 'react'
import type { Token } from '../../mock/tokens'
import { usdValue } from '../../mock/tokens'
import type { CurrencyCode } from '../../mock/db'
import { formatCrypto, formatFiat } from '../../lib/format'
import Sheet from '../primitives/Sheet'
import Field from '../primitives/Field'
import TokenGlyph from '../icons/TokenGlyph'
import { Check } from '../icons'

export default function AssetPicker({
  open,
  onClose,
  tokens,
  selected,
  currency,
  onSelect,
  title = 'Select asset',
}: {
  open: boolean
  onClose: () => void
  tokens: readonly Token[]
  selected: string
  currency: CurrencyCode
  onSelect: (symbol: string) => void
  title?: string
}) {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const matches = tokens.filter(
    (t) => t.symbol.toLowerCase().includes(q) || t.name.toLowerCase().includes(q),
  )

  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <Field
        label="Search"
        placeholder="Name or symbol"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="mt-3 space-y-0.5">
        {matches.map((token) => (
          <button
            key={token.id}
            type="button"
            onClick={() => {
              onSelect(token.symbol)
              onClose()
            }}
            className="flex h-row w-full items-center gap-3 rounded-control px-2 text-left transition-colors duration-state ease-out hover:bg-surface-3"
          >
            <TokenGlyph glyph={token.glyph} tint={token.tint} size={30} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-15 text-text">{token.symbol}</span>
              <span className="block truncate text-11 text-text-mute">{token.name}</span>
            </span>
            <span className="shrink-0 text-right">
              <span className="block font-mono text-12 tabular-nums text-text">
                {formatCrypto(token.balance)}
              </span>
              <span className="block font-mono text-11 tabular-nums text-text-mute">
                {formatFiat(usdValue(token), currency)}
              </span>
            </span>
            {token.symbol === selected && <Check size={16} className="shrink-0 text-ember" />}
          </button>
        ))}
        {matches.length === 0 && (
          <p className="py-6 text-center text-13 text-text-dim">No asset by that name.</p>
        )}
      </div>
    </Sheet>
  )
}
