import type { ReactNode } from 'react'

// Hand-drawn UI icons (§3): 1.5px stroke, currentColor, fill none, 24² viewBox,
// no filled shapes — the brand mark is the only fill in the app. Chain glyphs are
// not here; they live with their chain in mock/chains.ts.

export type IconProps = {
  /** Rendered size in px. The set is drawn for 20 and 24. */
  size?: number
  className?: string
}

function icon(name: string, children: ReactNode) {
  const Component = ({ size = 20, className }: IconProps) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  )
  Component.displayName = name
  return Component
}

/* --- navigation ---------------------------------------------------------- */
export const ChevronLeft = icon('ChevronLeft', <path d="m14.5 5-6 7 6 7" />)
export const ChevronRight = icon('ChevronRight', <path d="m9.5 5 6 7-6 7" />)
export const ChevronDown = icon('ChevronDown', <path d="m5 9.5 7 6 7-6" />)
export const ChevronUp = icon('ChevronUp', <path d="m5 14.5 7-6 7 6" />)
export const Close = icon('Close', <path d="M6 6l12 12M18 6 6 18" />)
export const ExternalLink = icon(
  'ExternalLink',
  <>
    <path d="M14 4h6v6" />
    <path d="M20 4 11 13" />
    <path d="M18 14.5V19a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19V7.5A1.5 1.5 0 0 1 5 6h4.5" />
  </>,
)

/* --- wallet actions ------------------------------------------------------ */
export const Send = icon(
  'Send',
  <>
    <path d="M7.5 16.5 16.5 7.5" />
    <path d="M9 7.5h7.5V15" />
  </>,
)
export const Receive = icon(
  'Receive',
  <>
    <path d="M16.5 7.5 7.5 16.5" />
    <path d="M15 16.5H7.5V9" />
  </>,
)
export const Swap = icon(
  'Swap',
  <>
    <path d="M7 4.5v15" />
    <path d="m3.5 8 3.5-3.5L10.5 8" />
    <path d="M17 19.5v-15" />
    <path d="m13.5 16 3.5 3.5L20.5 16" />
  </>,
)
export const Buy = icon(
  'Buy',
  <>
    <rect x="3" y="6" width="18" height="12" rx="2" />
    <path d="M3 10h18" />
  </>,
)
// No `Max` glyph: lettering drawn in strokes reads as the word "MA", not an
// icon. `Max` is a text control inside the amount field (§9.4).

/* --- data and status ----------------------------------------------------- */
export const Copy = icon(
  'Copy',
  <>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M15 6.5A2.5 2.5 0 0 0 12.5 4H6.5A2.5 2.5 0 0 0 4 6.5v6A2.5 2.5 0 0 0 6.5 15" />
  </>,
)
export const Check = icon('Check', <path d="m5 12.5 4.5 4.5L19 7" />)
export const Alert = icon(
  'Alert',
  <>
    <path d="M12 4.5 21 19.5H3Z" />
    <path d="M12 10v4" />
    <path d="M12 16.8v.2" />
  </>,
)
export const Info = icon(
  'Info',
  <>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 11.5V16" />
    <path d="M12 8.2v.2" />
  </>,
)
export const Clock = icon(
  'Clock',
  <>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </>,
)
export const Search = icon(
  'Search',
  <>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5" />
  </>,
)
export const Qr = icon(
  'Qr',
  <>
    <rect x="4" y="4" width="6" height="6" rx="1" />
    <rect x="14" y="4" width="6" height="6" rx="1" />
    <rect x="4" y="14" width="6" height="6" rx="1" />
    <path d="M14 14h2.5v2.5H14zM20 14v6h-6" />
  </>,
)

/* --- security ------------------------------------------------------------ */
export const Lock = icon(
  'Lock',
  <>
    <rect x="4.5" y="10" width="15" height="10" rx="2" />
    <path d="M8 10V7.5a4 4 0 0 1 8 0V10" />
  </>,
)
export const Eye = icon(
  'Eye',
  <>
    <path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="2.75" />
  </>,
)
export const EyeOff = icon(
  'EyeOff',
  <>
    <path d="M9.9 5.2A9.7 9.7 0 0 1 12 5c6 0 9.5 7 9.5 7a17 17 0 0 1-2.7 3.6" />
    <path d="M6.3 7.4A16.6 16.6 0 0 0 2.5 12S6 19 12 19a9.4 9.4 0 0 0 3.9-.85" />
    <path d="M10.2 10.2a2.75 2.75 0 0 0 3.7 3.7" />
    <path d="M3.5 3.5 20.5 20.5" />
  </>,
)
export const Shield = icon(
  'Shield',
  <>
    <path d="M12 3.5 5 6.2v5.3c0 4.3 3 7 7 9.2 4-2.2 7-4.9 7-9.2V6.2Z" />
    <path d="m9.2 12 2 2 3.6-4" />
  </>,
)
// Teeth, not just a ring and a shaft — without them this is indistinguishable
// from Search at 20px.
export const Key = icon(
  'Key',
  <>
    <circle cx="7.5" cy="7.5" r="3.5" />
    <path d="m10 10 9 9" />
    <path d="m14.5 14.5 2.5-2.5" />
    <path d="m17 17 2.5-2.5" />
  </>,
)

/* --- shell and settings -------------------------------------------------- */
export const Home = icon(
  'Home',
  <>
    <path d="M4 10.5 12 4l8 6.5" />
    <path d="M6 10v9.5h12V10" />
  </>,
)
export const Activity = icon('Activity', <path d="M3 12.5h4l3-7 4 14 3-7h4" />)
// Sliders rather than a gear: at 20px with a 1.5px stroke a gear's teeth close
// up into a sun, which is what the first draft looked like.
export const Settings = icon(
  'Settings',
  <>
    <path d="M4 7.5h11M19 7.5h1" />
    <path d="M4 16.5h4M12 16.5h8" />
    <circle cx="17" cy="7.5" r="2" />
    <circle cx="10" cy="16.5" r="2" />
  </>,
)
export const Globe = icon(
  'Globe',
  <>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17" />
    <path d="M12 3.5c2.2 2.4 3.3 5.3 3.3 8.5S14.2 18.1 12 20.5c-2.2-2.4-3.3-5.3-3.3-8.5S9.8 5.9 12 3.5Z" />
  </>,
)
export const Plus = icon('Plus', <path d="M12 5v14M5 12h14" />)
export const Pencil = icon(
  'Pencil',
  <>
    <path d="M4.5 19.5h4L20 8a2.5 2.5 0 0 0-3.5-3.5L5 16Z" />
    <path d="m15 6 3 3" />
  </>,
)
export const Trash = icon(
  'Trash',
  <>
    <path d="M4.5 6.5h15" />
    <path d="M9 6.5V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v1.5" />
    <path d="M6.5 6.5 7.5 20a1.5 1.5 0 0 0 1.5 1.4h6a1.5 1.5 0 0 0 1.5-1.4l1-13.5" />
  </>,
)
export const Download = icon(
  'Download',
  <>
    <path d="M12 4v11" />
    <path d="m7.5 11 4.5 4.5L16.5 11" />
    <path d="M4.5 19.5h15" />
  </>,
)
export const Share = icon(
  'Share',
  <>
    <path d="M12 15V4" />
    <path d="m7.5 8.5 4.5-4.5L16.5 8.5" />
    <path d="M5 13.5v5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5v-5" />
  </>,
)
export const Wallet = icon(
  'Wallet',
  <>
    <path d="M3.5 8A2.5 2.5 0 0 1 6 5.5h11A2.5 2.5 0 0 1 19.5 8" />
    <rect x="3.5" y="8" width="17" height="11" rx="2.5" />
    <path d="M16 13.5h1.5" />
  </>,
)
export const Card = icon(
  'Card',
  <>
    <rect x="3.5" y="6" width="17" height="12" rx="2" />
    <path d="M3.5 10.5h17" />
    <path d="M6.5 14.5h4" />
  </>,
)
export const Bank = icon(
  'Bank',
  <>
    <path d="M4 10.5 12 4l8 6.5" />
    <path d="M5 10.5v8M9.5 10.5v8M14.5 10.5v8M19 10.5v8" />
    <path d="M3.5 18.5h17" />
  </>,
)
