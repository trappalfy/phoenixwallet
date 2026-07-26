import type { ReactNode } from 'react'
import type { TokenGlyph as GlyphId } from '../../mock/tokens'

// A shape family per glyph id rather than one drawing per asset: USDC is the
// same coin on five networks, and forty near-identical hand-drawn circles would
// be forty places to keep in sync. The token's tint carries the identity.
const SHAPES: Record<GlyphId, ReactNode> = {
  diamond: <path d="M12 4 18 12 12 20 6 12Z" />,
  stable: (
    <>
      <circle cx="12" cy="12" r="7" />
      <path d="M12 8v8M9.8 10.2h4.4M9.8 13.8h4.4" />
    </>
  ),
  btc: (
    <>
      <path d="M9.8 7.2v9.6" />
      <path d="M9.8 7.2h3.4a2.3 2.3 0 0 1 0 4.6H9.8" />
      <path d="M9.8 11.8h3.8a2.4 2.4 0 0 1 0 4.8H9.8" />
      <path d="M11.4 5.8v1.4M13 5.8v1.4M11.4 16.8v1.4M13 16.8v1.4" />
    </>
  ),
  bars: (
    <>
      <path d="M6.5 8h11l-2.5 2.5h-11z" />
      <path d="M6.5 13.5h11L15 16H4z" />
    </>
  ),
  cube: (
    <>
      <path d="M12 4.5 19 8.5v7L12 19.5 5 15.5v-7Z" />
      <path d="M12 12 19 8.5M12 12v7.5M12 12 5 8.5" />
    </>
  ),
  ring: (
    <>
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="2.8" />
    </>
  ),
  wave: <path d="M4.5 14.5c2.5-5 5-5 7.5 0s5 5 7.5 0" />,
  bolt: <path d="M13 4 7 13h4l-1 7 6-9h-4Z" />,
  hex: <path d="M12 4.5 18.5 8.2v7.6L12 19.5 5.5 15.8V8.2Z" />,
  drop: <path d="M12 4.5c3 3.8 4.8 6.4 4.8 8.6a4.8 4.8 0 0 1-9.6 0c0-2.2 1.8-4.8 4.8-8.6Z" />,
}

export default function TokenGlyph({
  glyph,
  tint,
  size = 32,
}: {
  glyph: GlyphId
  tint: string
  size?: number
}) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-pill border border-hairline"
      style={{ width: size, height: size, background: `${tint}1F`, color: tint }}
      aria-hidden
    >
      <svg
        width={size * 0.62}
        height={size * 0.62}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {SHAPES[glyph]}
      </svg>
    </span>
  )
}
