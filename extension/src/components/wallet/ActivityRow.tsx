import type { Activity } from '../../mock/activity'
import { formatCrypto, relativeTime, formatCounterparty } from '../../lib/format'
import { Send, Receive, Swap, Check, Plus, Clock, Alert, Buy } from '../icons'

const KIND_ICON = {
  send: Send,
  receive: Receive,
  swap: Swap,
  approve: Check,
  mint: Plus,
  buy: Buy,
} as const

const KIND_LABEL = {
  send: 'Sent',
  receive: 'Received',
  swap: 'Swapped',
  approve: 'Approved',
  mint: 'Minted',
  buy: 'Bought',
} as const

export default function ActivityRow({
  entry,
  onClick,
}: {
  entry: Activity
  onClick?: () => void
}) {
  const Icon = KIND_ICON[entry.kind]
  const failed = entry.status === 'failed'
  const pending = entry.status === 'pending'

  // Only a settled movement of value gets a gain/loss colour. A failed transfer
  // moved nothing, and colouring it red would double up with the status chip.
  const amountTone =
    failed || entry.amount === 0 ? 'text-text-mute' : entry.amount > 0 ? 'text-gain' : 'text-text'

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-row w-full items-center gap-3 rounded-control px-2 text-left transition-colors duration-state ease-out hover:bg-surface-1"
    >
      <span
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-pill border border-hairline ${
          failed ? 'text-loss' : pending ? 'text-ember-hot' : 'text-text-dim'
        }`}
      >
        <Icon size={16} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-15 text-text">{KIND_LABEL[entry.kind]}</span>
          {pending && <Clock size={13} className="shrink-0 text-ember-hot" />}
          {failed && <Alert size={13} className="shrink-0 text-loss" />}
        </span>
        <span className="block truncate font-mono text-11 text-text-mute">
          {formatCounterparty(entry.counterparty)}
        </span>
      </span>

      <span className="shrink-0 text-right">
        {/* Swaps carry both symbols — bare numbers ("0.5 → 1,498.05") say nothing —
            and drop a size to buy the width that costs. */}
        <span
          className={`block font-mono tabular-nums ${amountTone} ${
            entry.kind === 'swap' && entry.toSymbol ? 'text-11' : 'text-13'
          }`}
        >
          {entry.kind === 'swap' && entry.toSymbol
            ? `${formatCrypto(Math.abs(entry.amount), entry.symbol)} → ${formatCrypto(entry.toAmount ?? 0, entry.toSymbol)}`
            : entry.amount === 0
              ? entry.symbol
              : `${entry.amount > 0 ? '+' : '−'}${formatCrypto(Math.abs(entry.amount), entry.symbol)}`}
        </span>
        <span className="block font-mono text-11 text-text-mute">{relativeTime(entry.at)}</span>
      </span>
    </button>
  )
}
