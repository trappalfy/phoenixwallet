import type { ReactNode } from 'react'
import type { ChainId } from '../../mock/chains'

// Hand-drawn simplified monograms (§7) — these read as texture at 20px, not as
// logos to study, and no brand asset was downloaded to make them.
const GLYPHS: Record<ChainId, ReactNode> = {
  ethereum: (
    <>
      <path d="M12 2 5 12.2 12 15.9 19 12.2Z" fill="currentColor" opacity="0.9" />
      <path d="M12 22 5 13.5 12 17.2 19 13.5Z" fill="currentColor" opacity="0.55" />
    </>
  ),
  solana: (
    <g fill="currentColor">
      <path d="M6.6 5H20l-2.6 2.8H4z" />
      <path d="M4 10.6h13.4L20 13.4H6.6z" />
      <path d="M6.6 16.2H20l-2.6 2.8H4z" />
    </g>
  ),
  bitcoin: (
    <g fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.6 6.7v10.6" />
      <path d="M9.6 6.7h3.6a2.5 2.5 0 0 1 0 5H9.6" />
      <path d="M9.6 11.7h4.2a2.6 2.6 0 0 1 0 5.2H9.6" />
      <path d="M11.3 5.1v1.6M13 5.1v1.6M11.3 17.3v1.6M13 17.3v1.6" />
    </g>
  ),
  base: (
    <path
      d="M12 2.8a9.2 9.2 0 1 0 0 18.4c4.9 0 8.9-3.7 9.2-8.5h-12v-1.4h12A9.2 9.2 0 0 0 12 2.8Z"
      fill="currentColor"
    />
  ),
  arbitrum: (
    <>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 6.4 16.2 16.2H13L12 13.8Z" fill="currentColor" />
      <path d="M12 6.4 7.8 16.2H11L12 13.8Z" fill="currentColor" opacity="0.65" />
    </>
  ),
  optimism: (
    <>
      <circle cx="12" cy="12" r="9" fill="currentColor" />
      <circle cx="12" cy="12" r="4.4" fill="#0A0506" />
    </>
  ),
  polygon: (
    <path
      d="M12 3 19.8 7.5V16.5L12 21 4.2 16.5V7.5Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  ),
  sui: <path d="M12 3s-6.5 7.5-6.5 12a6.5 6.5 0 0 0 13 0C18.5 10.5 12 3 12 3Z" fill="currentColor" />,
  sepolia: (
    <>
      <path d="M12 2 5 12.2 12 15.9 19 12.2Z" fill="currentColor" opacity="0.55" />
      <path d="M12 22 5 13.5 12 17.2 19 13.5Z" fill="currentColor" opacity="0.32" />
    </>
  ),
  'base-sepolia': (
    <path
      d="M12 2.8a9.2 9.2 0 1 0 0 18.4c4.9 0 8.9-3.7 9.2-8.5h-12v-1.4h12A9.2 9.2 0 0 0 12 2.8Z"
      fill="currentColor"
      opacity="0.6"
    />
  ),
}

export default function ChainGlyph({
  id,
  size = 20,
  className,
}: {
  id: ChainId
  size?: number
  className?: string
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      {GLYPHS[id]}
    </svg>
  )
}
