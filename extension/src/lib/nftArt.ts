import type { CSSProperties } from 'react'
import type { NftArt } from '../mock/nfts'

/**
 * Artwork generated from the `art` descriptor — layered gradients and geometry,
 * no external images and no placeholder service (§7). Each pattern is a
 * different arrangement of the same three hues, so a collection reads as one
 * series without two items looking identical.
 *
 * Lives here rather than in NftCard because the card, the detail screen and the
 * account avatar all draw the same piece and must draw it identically.
 */
export function nftArtStyle(art: NftArt): CSSProperties {
  const [dark, mid, light] = art.hues
  const a = art.angle

  switch (art.pattern) {
    case 'prism':
      return {
        background: `linear-gradient(${a}deg, ${dark} 0%, ${mid} 55%, ${light} 100%),
          conic-gradient(from ${a}deg at 60% 40%, ${light}00 0deg, ${light}55 90deg, ${dark}00 200deg)`,
        backgroundBlendMode: 'screen',
      }
    case 'strata':
      return {
        background: `repeating-linear-gradient(${a}deg, ${dark} 0 12%, ${mid} 12% 18%, ${dark} 18% 30%),
          linear-gradient(${a + 90}deg, ${dark}, ${light})`,
        backgroundBlendMode: 'overlay',
      }
    case 'arc':
      return {
        background: `radial-gradient(120% 90% at 50% 110%, ${light} 0%, ${mid} 35%, ${dark} 70%),
          linear-gradient(${a}deg, ${dark}, transparent)`,
      }
    case 'orbit':
      return {
        background: `radial-gradient(38% 38% at 62% 34%, ${light} 0%, ${mid} 45%, ${dark}00 70%),
          conic-gradient(from ${a}deg, ${dark}, ${mid}, ${dark})`,
      }
    case 'grid':
      return {
        background: `repeating-linear-gradient(90deg, ${dark} 0 6px, ${mid}44 6px 7px),
          repeating-linear-gradient(0deg, ${dark} 0 6px, ${light}33 6px 7px),
          linear-gradient(${a}deg, ${dark}, ${mid})`,
      }
    case 'bloom':
      return {
        background: `radial-gradient(60% 60% at 30% 70%, ${light}cc 0%, ${mid}88 40%, ${dark} 75%),
          radial-gradient(50% 50% at 75% 25%, ${mid}aa 0%, ${dark} 70%)`,
      }
  }
}
