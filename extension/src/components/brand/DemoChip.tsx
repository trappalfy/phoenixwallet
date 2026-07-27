import { IS_DEMO } from '../../config'

/**
 * §2.3 — a UI that looks like a funded wallet but isn't must say so. Rendering is
 * gated on IS_DEMO, so removing the chip everywhere is a one-line change in
 * config.ts rather than a hunt through the header.
 */
export default function DemoChip() {
  if (!IS_DEMO) return null
  return (
    <span
      title="Demo build — mock data, no funds, no signing"
      className="rounded-chip border border-hairline bg-surface-3 px-1.5 py-0.5 font-mono text-11 uppercase leading-none tracking-label text-ember-hot"
    >
      Demo
    </span>
  )
}
