import type { ReactNode } from 'react'

// Extension-popover / phone frame. Decorative (aria-hidden) — the copy block
// carries the meaning. Depth is an accent glow, never a grey drop shadow.
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
      className="w-full max-w-[380px] rounded-[26px] border border-subtle bg-surface p-2.5 [box-shadow:0_0_90px_-24px_rgba(139,92,246,0.4)]"
    >
      <div className="overflow-hidden rounded-[18px] border border-subtle bg-base/70">
        <div className="flex items-center justify-between border-b border-subtle px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent-500/80" />
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-haze">
              {title}
            </span>
          </div>
          <span className="font-mono text-[11px] text-haze/60">perigee</span>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}
