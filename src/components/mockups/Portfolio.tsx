import { NetworkMark } from '../../lib/icons'

const ROWS = [
  { id: 'ethereum', name: 'Ethereum', amt: '3.2140 ETH', fiat: '$10,420.18' },
  { id: 'solana', name: 'Solana', amt: '128.50 SOL', fiat: '$21,038.02' },
  { id: 'bitcoin', name: 'Bitcoin', amt: '0.2076 BTC', fiat: '$14,180.94' },
  { id: 'base', name: 'Base', amt: '1.0402 ETH', fiat: '$2,571.41' },
]

export default function Portfolio() {
  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-haze">
            Total balance
          </p>
          <p className="mt-1 font-mono text-[26px] leading-none text-ink">$48,210.55</p>
        </div>
        <span className="rounded-pill border border-subtle px-2.5 py-1 font-mono text-[11px] text-accent-400">
          +2.4%
        </span>
      </div>
      <div className="mt-5 space-y-1.5">
        {ROWS.map((r) => (
          <div
            key={r.name}
            className="flex items-center gap-3 rounded-input border border-subtle bg-surface/60 px-3 py-2.5"
          >
            <NetworkMark id={r.id} className="h-6 w-6 text-ink/80" />
            <div className="flex-1">
              <p className="text-[13px] text-ink">{r.name}</p>
              <p className="font-mono text-[11px] text-haze">{r.amt}</p>
            </div>
            <p className="font-mono text-[12px] text-ink">{r.fiat}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
