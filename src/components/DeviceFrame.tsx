import type { ReactNode } from 'react'

// Extension-popover / phone frame. Decorative (aria-hidden) — the copy block
// carries the meaning. Depth is an ember glow, never a grey drop shadow (§9).
export default function DeviceFrame({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div
      aria-hidden
      className="w-full max-w-[380px] rounded-[26px] border border-hairline bg-soot p-2.5 [box-shadow:0_0_90px_-24px_rgba(255,90,31,0.4)]"
    >
      <div className="overflow-hidden rounded-[18px] border border-hairline bg-void/70">
        <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-ember/80" />
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-smoke">
              {title}
            </span>
          </div>
          <span className="font-mono text-[11px] text-smoke/60">phoenix</span>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}
