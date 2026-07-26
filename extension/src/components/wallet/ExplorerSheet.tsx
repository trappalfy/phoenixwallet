import Sheet from '../primitives/Sheet'
import Pill from '../primitives/Pill'
import ReviewCard from './ReviewCard'
import type { Activity, ActivityStatus } from '../../mock/activity'
import type { Chain, AddressFormat } from '../../mock/chains'
import { formatCrypto, formatTimestamp, truncateHash } from '../../lib/format'
import { Alert, Check, Clock } from '../icons'

const STATUS: Record<ActivityStatus, { tone: 'gain' | 'pending' | 'loss'; label: string }> = {
  confirmed: { tone: 'gain', label: 'Confirmed' },
  pending: { tone: 'pending', label: 'Pending' },
  failed: { tone: 'loss', label: 'Failed' },
}

const BLOCK_LABEL: Record<AddressFormat, string> = {
  evm: 'Block',
  solana: 'Slot',
  bitcoin: 'Block height',
  sui: 'Checkpoint',
}

/** Roughly where each network's counter sits today — never checked against a
 * real explorer, so it only has to be plausible, not current. */
const BLOCK_BASE: Record<AddressFormat, number> = {
  evm: 21_300_000,
  solana: 301_000_000,
  bitcoin: 872_000,
  sui: 41_000_000,
}

/** Deterministic, not random: reopening the sheet must show the same numbers. */
function seedFrom(value: string): number {
  let h = 0
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) >>> 0
  return h
}

/**
 * Stands in for a real block-explorer lookup (§9.7's "View on" action). Every
 * figure below is derived from the transaction's own hash so it never changes
 * between visits, but none of it is fetched from anywhere — §2.1 forbids a
 * network call, and this build makes none.
 *
 * TODO(backend): replace with a live lookup against the chain's explorer API.
 */
export default function ExplorerSheet({
  open,
  onClose,
  entry,
  chain,
}: {
  open: boolean
  onClose: () => void
  entry: Activity
  chain: Chain
}) {
  const seed = seedFrom(entry.hash)
  const isEvm = chain.format === 'evm'
  const block = BLOCK_BASE[chain.format] + (seed % 50_000)
  const confirmations =
    entry.status === 'confirmed' ? 12 + (seed % 400) : entry.status === 'pending' ? 1 + (seed % 3) : 0
  const status = STATUS[entry.status]

  return (
    <Sheet open={open} onClose={onClose} title={`View on ${chain.explorer}`}>
      <div className="flex flex-col items-center pb-3 text-center">
        <Pill tone={status.tone}>
          <StatusIcon status={entry.status} />
          {status.label}
        </Pill>
      </div>

      <ReviewCard
        rows={[
          { label: BLOCK_LABEL[chain.format], value: block.toLocaleString('en-US') },
          {
            label: 'Confirmations',
            value: entry.status === 'failed' ? 'Reverted' : confirmations.toLocaleString('en-US'),
          },
          { label: 'Network fee', value: entry.fee === 0 ? 'None' : formatCrypto(entry.fee, entry.feeSymbol) },
          ...(isEvm
            ? [
                { label: 'Gas used', value: (21_000 + (seed % 130_000)).toLocaleString('en-US') },
                { label: 'Gas price', value: `${5 + (seed % 60)} gwei` },
                { label: 'Nonce', value: String(seed % 200) },
              ]
            : []),
          { label: 'Timestamp', value: formatTimestamp(entry.at) },
          { label: 'Transaction', tone: 'strong' as const, value: truncateHash(entry.hash) },
        ]}
      />

      <p className="pt-3 text-11 leading-relaxed text-text-mute">
        This is a preview built from the transaction itself — this build makes no request to{' '}
        {chain.explorer}.
      </p>
    </Sheet>
  )
}

function StatusIcon({ status }: { status: ActivityStatus }) {
  if (status === 'confirmed') return <Check size={12} />
  if (status === 'pending') return <Clock size={12} />
  return <Alert size={12} />
}
