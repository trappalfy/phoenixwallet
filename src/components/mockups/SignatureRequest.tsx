export default function SignatureRequest() {
  return (
    <div>
      <div className="flex items-center gap-2.5">
        <span className="h-7 w-7 rounded-pill border border-subtle bg-elevated" />
        <div>
          <p className="text-[13px] text-ink">app.somedex.xyz</p>
          <p className="font-mono text-[10px] text-haze">wants you to sign</p>
        </div>
      </div>

      <div className="mt-4 rounded-input border border-subtle bg-surface/60 p-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-haze">Action</p>
        <p className="mt-1 font-mono text-[14px] text-ink">Approve USDC · spender 0x1f…9c4</p>

        <div className="mt-3 flex items-center gap-2 rounded-input border border-accent-500/40 bg-accent-500/10 px-2.5 py-2">
          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-accent-500" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 3 2 20h20L12 3Z" />
            <path d="M12 10v4M12 17h.01" />
          </svg>
          <span className="font-mono text-[11px] text-accent-500">Unlimited approval</span>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <span className="flex-1 rounded-pill border border-subtle py-2 text-center text-[13px] text-ink">
          Reject
        </span>
        <span className="flex-1 rounded-pill bg-accent-500 py-2 text-center text-[13px] text-base">
          Sign
        </span>
      </div>
    </div>
  )
}
