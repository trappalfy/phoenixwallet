import { useId } from 'react'

// Two interlocking four-point shards — a flash and a bird in flight. The
// silhouette is traced from assets/brand/star-white-transparent.png by
// scripts/trace-mark.mjs (Douglas-Peucker tolerance 2.0), so it is a
// reproducible derivation of the source art, not a hand-typed approximation.
// Re-run that script if the logo changes. The PNG is never rendered inside React.
const SHARD =
  'M23.95 3.94L20.11 6.47L11.02 11.95L10.27 12.61L9.61 13.59L9.66 14.11L10.45 14.11L15.38 12.09' +
  'L18.56 16.55L18.7 16.83L18.61 17.2L17.95 17.2L12.42 16.13L11.58 16.17L11.25 16.41L8.3 20.81' +
  'L7.45 21.84L7.22 21.84L7.03 21.61L6.38 17.16L6.05 16.45L5.25 16.36L0.05 18.14L1.45 17.11' +
  'L9 12.38L10.27 11.25L10.73 10.5L10.73 10.13L10.59 9.98L9.84 10.03L4.97 12.09L1.59 7.41' +
  'L1.5 6.94L1.64 6.8L2.67 6.89L7.92 7.97L8.86 7.92L9.23 7.59L12.84 2.34L13.13 2.16L13.45 2.44' +
  'L13.64 4.78L13.97 6.33L14.3 6.8L14.77 6.98L15.38 6.94Z'

type Props = {
  /** Rendered size in px. Tested at 24 and 64. */
  size?: number
  /**
   * Fills the mark with the accent gradient instead of currentColor. This is the
   * mark's active state — one of exactly four places §5.2 permits the gradient.
   */
  active?: boolean
  className?: string
  /** Supply when the mark is the only label for its control; omit when decorative. */
  title?: string
}

export default function PhoenixMark({ size = 24, active = false, className, title }: Props) {
  // Instance-scoped so several marks can sit on one screen without id collisions.
  const gradientId = useId()

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {active && (
        <defs>
          {/* 135°, matching --grad-accent, so mark and UI share one light direction. */}
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="55%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#C4B5FD" />
          </linearGradient>
        </defs>
      )}
      <path d={SHARD} fill={active ? `url(#${gradientId})` : 'currentColor'} />
    </svg>
  )
}
