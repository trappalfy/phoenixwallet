export default function SignatureRequest() {
  return (
    <div>
      <div className="flex items-center gap-2.5">
        <span className="h-7 w-7 rounded-pill border border-hairline bg-ash" />
        <div>
          <p className="text-[13px] text-bone">app.somedex.xyz</p>
          <p className="font-mono text-[10px] text-smoke">wants you to sign</p>
        </div>
      </div>

      <div className="mt-4 rounded-input border border-hairline bg-soot/60 p-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-smoke">Action</p>
        <p className="mt-1 font-mono text-[14px] text-bone">Approve USDC · spender 0x1f…9c4</p>

        <div className="mt-3 flex items-center gap-2 rounded-input border border-ember/40 bg-ember/10 px-2.5 py-2">
          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-ember" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 3 2 20h20L12 3Z" />
            <path d="M12 10v4M12 17h.01" />
          </svg>
          <span className="font-mono text-[11px] text-ember">Unlimited approval</span>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <span className="flex-1 rounded-pill border border-hairline py-2 text-center text-[13px] text-bone">
          Reject
        </span>
        <span className="flex-1 rounded-pill bg-ember py-2 text-center text-[13px] text-void">
          Sign
        </span>
      </div>
    </div>
  )
}
