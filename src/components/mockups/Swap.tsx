import { NetworkMark } from '../../lib/icons'

function TokenPill({ id, sym }: { id?: string; sym: string }) {
  return (
    <span className="flex items-center gap-1.5 rounded-pill border border-hairline px-2 py-1">
      {id ? (
        <NetworkMark id={id} className="h-4 w-4 text-bone/80" />
      ) : (
        <span className="h-4 w-4 rounded-full border border-hairline bg-ash" />
      )}
      <span className="font-mono text-[12px] text-bone">{sym}</span>
    </span>
  )
}

const ROUTE = [
  ['Route', 'Uniswap v3 · Curve'],
  ['Network fee', '$1.82'],
  ['Slippage', '0.10%'],
]

export default function Swap() {
  return (
    <div>
      <div className="rounded-input border border-hairline bg-soot/60 p-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-smoke">You pay</p>
        <div className="mt-1 flex items-center justify-between">
          <span className="font-mono text-[22px] text-bone">1.50</span>
          <TokenPill id="ethereum" sym="ETH" />
        </div>
      </div>
      <div className="my-1.5 flex justify-center">
        <span className="grid h-7 w-7 place-items-center rounded-pill border border-hairline bg-soot font-mono text-ember">
          ↓
        </span>
      </div>
      <div className="rounded-input border border-hairline bg-soot/60 p-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-smoke">You receive</p>
        <div className="mt-1 flex items-center justify-between">
          <span className="font-mono text-[22px] text-bone">4,821.90</span>
          <TokenPill sym="USDC" />
        </div>
      </div>
      <div className="mt-4 space-y-2 rounded-input border border-hairline bg-soot/40 p-3 font-mono text-[11px]">
        {ROUTE.map(([k, v]) => (
          <div key={k} className="flex justify-between">
            <span className="text-smoke">{k}</span>
            <span className="text-bone">{v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
