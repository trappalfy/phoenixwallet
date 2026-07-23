// Single source of truth for every string on the page (brief §8).
// Edit copy here, never in JSX. Fake/placeholder specifics are marked `TODO: swap for real`.

export const brand = {
  name: 'Phoenix',
  full: 'Phoenix Wallet',
} as const

export const nav = {
  links: [
    { label: 'Product', href: '#product' },
    { label: 'Security', href: '#security' },
    { label: 'Networks', href: '#networks' },
    { label: 'Docs', href: '#' }, // TODO: swap for real docs URL
  ],
  login: 'Log in',
  cta: 'Get Phoenix',
} as const

export const hero = {
  eyebrow: '✦ Extension + iOS + Android — waitlist open',
  line1: 'Hold your own keys.',
  line2: 'Nothing leaves the device.',
  sub: 'Phoenix generates and signs on your machine. The seed phrase never touches our servers, because there are no servers. 40+ networks, one wallet, zero accounts.',
  ctaPrimary: 'Add to Chrome',
  ctaSecondary: 'Read the security model',
  networksLabel: 'Supported networks',
  // ids map to inline SVG marks in src/lib/icons.tsx
  networks: [
    { id: 'ethereum', name: 'Ethereum' },
    { id: 'solana', name: 'Solana' },
    { id: 'bitcoin', name: 'Bitcoin' },
    { id: 'base', name: 'Base' },
    { id: 'arbitrum', name: 'Arbitrum' },
    { id: 'optimism', name: 'Optimism' },
    { id: 'polygon', name: 'Polygon' },
    { id: 'sui', name: 'Sui' },
  ],
} as const

export const bento = {
  label: 'What you actually get',
  cards: [
    {
      icon: 'enclave',
      title: 'Keys stay on device',
      body: "Generated in your device's secure enclave, encrypted at rest, never transmitted. Not to us, not to a backup, not to a cloud.",
    },
    {
      icon: 'networks',
      title: 'One wallet, 40+ networks',
      body: 'EVM chains, Solana, Bitcoin and Cosmos in a single account list. No switching profiles.',
    },
    {
      icon: 'route',
      title: 'Swaps that show their work',
      body: 'Routes across 20+ DEXs with the fee, the slippage and the route displayed before you confirm.',
    },
    {
      icon: 'sign',
      title: 'Read the transaction before you sign',
      body: 'Every call simulated in plain English. Unlimited approvals get flagged in red.',
    },
  ],
} as const

// Pinned showcase — the left copy block swaps in sync with each device state.
export const showcase = {
  label: 'One surface',
  states: [
    {
      key: 'portfolio',
      kicker: 'Portfolio',
      title: 'Every chain, one list.',
      body: 'Balances across 40+ networks in a single view. No profile switching, no wrapped-token confusion.',
    },
    {
      key: 'swap',
      kicker: 'Swap',
      title: 'See the route before you sign.',
      body: 'Fee, slippage and the full DEX path shown up front — not after you commit.',
    },
    {
      key: 'signature',
      kicker: 'Signature request',
      title: "Know what you're signing.",
      body: 'Every call decoded to plain English. Unlimited approvals flagged in red before they cost you.',
    },
  ],
} as const

export const security = {
  heading: 'The part that matters',
  proofs: [
    {
      label: 'Audited',
      // TODO: swap for real — audit count, firm names and report links
      body: 'Three independent audits — Trail of Bits, Zellic and Cure53. Full reports, not summaries.',
      href: '#',
    },
    {
      label: 'Open source',
      // TODO: swap for real repo URL
      body: 'Every line — client and signer — public at github.com/phoenix-wallet.',
      href: '#',
    },
    {
      label: 'No accounts',
      body: 'No email, no KYC, no analytics tied to an address.',
      href: null,
    },
    {
      label: 'Hardware',
      body: 'Ledger and Trezor supported from day one.',
      href: null,
    },
  ],
  cantHeading: "Things Phoenix can't do",
  cant: [
    'Recover your seed phrase',
    'Freeze or reverse your funds',
    'See your balances',
    'Sell your data',
    'Be subpoenaed for your keys',
  ],
  footnote:
    'This is a feature list, not a disclaimer. If you lose your seed phrase, your funds are gone. That is the trade.',
} as const

export const numbers = {
  // value drives the tick-up counter; prefix/suffix are static
  stats: [
    { prefix: '$', value: 0, suffix: '', label: 'custodied' }, // TODO: confirm the $ figure — 0 is the point
    { prefix: '', value: 40, suffix: '+', label: 'networks' },
    { prefix: '', value: 3, suffix: '', label: 'audits' }, // TODO: keep in sync with real audit count
    { prefix: '', value: 100, suffix: '%', label: 'open source' },
  ],
  // two rows scrolling opposite directions
  marquee: [
    'Ethereum', 'Solana', 'Bitcoin', 'Base', 'Arbitrum', 'Optimism',
    'Polygon', 'Sui', 'Cosmos', 'Avalanche', 'Sei', 'Scroll', 'zkSync', 'Aptos',
  ],
} as const

export const finalCta = {
  headline: 'Take your keys back.',
  emailPlaceholder: 'you@domain.com',
  button: 'Join the waitlist',
  success: "You're on the list.",
  invalid: 'Enter a valid email.',
} as const

export const footer = {
  columns: [
    {
      heading: 'Product',
      links: ['Overview', 'Security', 'Networks', 'Download', 'Changelog'],
    },
    {
      heading: 'Resources',
      links: ['Docs', 'Support', 'Status', 'Brand'],
    },
    {
      heading: 'Legal',
      links: ['Privacy', 'Terms', 'Disclosures'],
    },
  ],
  copyright: `© ${2026} Phoenix`, // TODO: keep year current
  smallprint:
    'Phoenix is non-custodial software. You are responsible for your own keys.',
} as const

export const waitlist = {
  title: 'Join the waitlist',
  body: 'Phoenix ships as a browser extension and iOS/Android app. Drop your email and we’ll tell you the moment it’s live. No account, no spam.',
  emailPlaceholder: 'you@domain.com',
  button: 'Request access',
  success: "You're on the list.",
  successBody: "We'll email you when Phoenix is ready. Nothing else.",
  invalid: 'Enter a valid email.',
} as const
