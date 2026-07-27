import Sheet from '../primitives/Sheet'
import type { CurrencyCode, PaymentMethod } from '../../mock/db'
import { formatFiat } from '../../lib/format'
import { Bank, Card, Check, Wallet } from '../icons'

const KIND_ICON = { card: Card, wallet: Wallet, bank: Bank } as const

export default function PaymentMethodSheet({
  open,
  onClose,
  methods,
  selected,
  currency,
  onSelect,
}: {
  open: boolean
  onClose: () => void
  methods: readonly PaymentMethod[]
  selected: string
  currency: CurrencyCode
  onSelect: (id: string) => void
}) {
  return (
    <Sheet open={open} onClose={onClose} title="Pay with">
      <div className="space-y-0.5">
        {methods.map((method) => {
          const Icon = KIND_ICON[method.kind]
          return (
            <button
              key={method.id}
              type="button"
              onClick={() => {
                onSelect(method.id)
                onClose()
              }}
              className="flex h-row w-full items-center gap-3 rounded-control px-2 text-left transition-colors duration-state ease-out hover:bg-surface-3"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-pill border border-hairline bg-surface-2 text-text-dim">
                <Icon size={17} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-15 text-text">{method.label}</span>
                <span className="block truncate text-11 text-text-mute">
                  {method.eta} · Up to {formatFiat(method.limit, currency)}
                </span>
              </span>
              <span className="shrink-0 font-mono text-11 tabular-nums text-text-mute">
                {method.feePercent}%
              </span>
              {method.id === selected && <Check size={16} className="shrink-0 text-ember" />}
            </button>
          )
        })}
      </div>
    </Sheet>
  )
}
