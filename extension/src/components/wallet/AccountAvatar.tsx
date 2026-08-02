// Identicon derived from the address, drawn as SVG (§7). Deterministic — the
// same address always produces the same avatar — and confined to accent-family
// hues so three accounts side by side still read as one product.

/** FNV-1a. Not a security primitive; it only needs to be stable and well spread. */
function hash(input: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h >>> 0
}

export default function AccountAvatar({
  address,
  size = 24,
}: {
  address: string
  size?: number
}) {
  const h = hash(address)

  // Unsigned shifts throughout. `hash` returns a full 32-bit value, so a signed
  // `>>` flips negative for any address hashing above 2^31 — which then poisons
  // every `%` below it: negative stripe widths, a negative stripe count that
  // erases the pattern, negative opacity. Silent for some addresses, an invalid
  // SVG attribute for others.
  const bits = (shift: number) => h >>> shift

  // Accent family: 234°–282° spans the mark's blue-violet through to its lavender.
  const HUE_BASE = 234
  const HUE_SPAN = 48
  const hueA = h % HUE_SPAN
  const hueB = (hueA + 18 + (bits(8) % 14)) % HUE_SPAN
  const rotation = bits(16) % 360
  const split = 38 + (bits(5) % 26) // where the two hues meet, 38–63%
  const bar = 3 + (bits(11) % 4) // stripe count, 3–6

  const id = `av-${h.toString(36)}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className="shrink-0 rounded-pill"
      aria-hidden
    >
      <defs>
        <linearGradient id={id} gradientTransform={`rotate(${rotation} 0.5 0.5)`}>
          <stop offset="0%" stopColor={`hsl(${HUE_BASE + hueA} 88% 42%)`} />
          <stop offset={`${split}%`} stopColor={`hsl(${HUE_BASE + hueB} 92% 54%)`} />
          <stop offset="100%" stopColor={`hsl(${HUE_BASE + ((hueB + 10) % HUE_SPAN)} 96% 62%)`} />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <circle cx="16" cy="16" r="16" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-clip)`}>
        <rect width="32" height="32" fill={`url(#${id})`} />
        {Array.from({ length: bar }, (_, i) => (
          <rect
            key={i}
            x={-8 + i * (48 / bar)}
            y="-8"
            width={2 + (bits(i * 3) % 4)}
            height="48"
            fill="#0A0818"
            // Barely-there stripes read as noise, not identity. These carry most
            // of the per-account difference, so they have to actually be visible.
            opacity={0.34 + (bits(i * 2) % 10) / 40}
            transform={`rotate(${rotation % 90} 16 16)`}
          />
        ))}
      </g>
    </svg>
  )
}
