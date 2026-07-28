import type { ReactNode, SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const VOID = '#07060A' // for negative-space cuts; these marks only sit on --void

// Diagonal up-right arrow (composed into the pill's circular badge in Nav).
export function Arrow(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden {...props}>
      <path
        d="M4 12 12 4M6 4h6v6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Simplified monochrome network marks — read as texture in the hero row, not
// logos to study (brief §5). currentColor, one shape family each.
const NETWORK_MARKS: Record<string, ReactNode> = {
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
    <>
      <circle cx="12" cy="12" r="9.2" fill="currentColor" />
      <rect x="12.4" y="9.6" width="6" height="4.8" fill={VOID} />
    </>
  ),
  arbitrum: (
    <>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 6.4 16.2 16.2 13 16.2 12 13.8Z" fill="currentColor" />
      <path d="M12 6.4 7.8 16.2 11 16.2 12 13.8Z" fill="currentColor" opacity="0.65" />
    </>
  ),
  optimism: (
    <>
      <circle cx="12" cy="12" r="9" fill="currentColor" />
      <circle cx="12" cy="12" r="4.4" fill={VOID} />
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
  sui: (
    <path
      d="M12 3s-6.5 7.5-6.5 12a6.5 6.5 0 0 0 13 0C18.5 10.5 12 3 12 3Z"
      fill="currentColor"
    />
  ),
}

export function NetworkMark({ id, ...props }: IconProps & { id: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      {NETWORK_MARKS[id] ?? null}
    </svg>
  )
}

// Bento card icons — 1.5px stroke, currentColor (brief §2, §5).
const BENTO_ICONS: Record<string, ReactNode> = {
  enclave: (
    <>
      <path d="M12 3 5 6v5c0 4 3 6.6 7 8 4-1.4 7-4 7-8V6l-7-3Z" />
      <circle cx="12" cy="10.5" r="1.6" />
      <path d="M12 12.1v2.6" />
    </>
  ),
  networks: (
    <>
      <circle cx="12" cy="12" r="2.2" />
      <circle cx="5" cy="6" r="1.5" />
      <circle cx="19" cy="6" r="1.5" />
      <circle cx="5" cy="18" r="1.5" />
      <circle cx="19" cy="18" r="1.5" />
      <path d="m6.3 7 4 3.4M17.7 7l-4 3.4M6.3 17l4-3.4M17.7 17l-4-3.4" />
    </>
  ),
  route: (
    <>
      <path d="M4 12h5c3 0 3-5 6-5h5M9 12c3 0 3 5 6 5h5" />
      <circle cx="4" cy="12" r="1.6" />
      <circle cx="20" cy="7" r="1.6" />
      <circle cx="20" cy="17" r="1.6" />
    </>
  ),
  sign: (
    <>
      <path d="M7 3h7l4 4v14H7z" />
      <path d="M14 3v4h4" />
      <path d="m9.5 14 2 2 3.4-4" />
    </>
  ),
  // /install step marks — same family, reused through <BentoIcon>.
  download: (
    <>
      <path d="M12 4v10" />
      <path d="m7.5 10.5 4.5 4 4.5-4" />
      <path d="M5 18.5h14" />
    </>
  ),
  // Puzzle piece — the universal "extensions" mark. Two outward knobs; plain
  // corners, softened by the shared strokeLinejoin="round".
  puzzle: (
    <path d="M4.5 4.5H9.7a2.3 2.3 0 0 1 4.6 0h5.2v5.2a2.3 2.3 0 0 0 0 4.6v5.2H4.5Z" />
  ),
  toggle: (
    <>
      <rect x="3" y="8" width="18" height="8" rx="4" />
      <circle cx="16" cy="12" r="2.1" />
    </>
  ),
  folder: (
    <>
      <path d="M3.5 6.5h5l2 2.4h9.5v9.6a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1z" />
      <path d="M3.5 11.4h17" />
    </>
  ),
}

export function BentoIcon({ name, ...props }: IconProps & { name: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {BENTO_ICONS[name] ?? null}
    </svg>
  )
}
