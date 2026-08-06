// Single source of truth for every string on the page (brief §8).
// Edit copy here, never in JSX. Fake/placeholder specifics are marked `TODO: swap for real`.

export const brand = {
  name: 'Perigee',
  full: 'Perigee Wallet',
} as const

export const nav = {
  links: [
    { label: 'Product', href: '#product' },
    { label: 'Security', href: '#security' },
    { label: 'Networks', href: '#networks' },
    { label: 'Docs', href: '#' }, // TODO: swap for real docs URL
  ],
  login: 'Log in',
  cta: 'Add to Chrome',
} as const

// Install paths. A site cannot install an extension itself — Chrome removed
// inline installation in v71 — so there are exactly two routes: the Web Store
// listing, or download the zip and load it unpacked (see /install).
export const product = {
  /**
   * Approved and live. Setting this flips the nav CTA from the waitlist modal
   * to a real Web Store link (see Nav.tsx's StoreCta). Kept as `string | null`
   * because the fallback is still wired and worth keeping: pull the listing and
   * this goes back to null rather than shipping a dead button.
   *
   * Stored without the `?authuser=` and `?hl=` parameters the dashboard hands
   * you — the first is tied to one Google account's session, the second pins
   * every visitor to one interface language.
   */
  chromeStoreUrl:
    'https://chromewebstore.google.com/detail/perigee-wallet/lkhpcjjibfmepfpeodiidmolhigmifah' as
      | string
      | null,
  // Byte-identical to extension/store/build/perigee-wallet-0.1.0.zip — the same
  // artifact goes to the Chrome Web Store and to anyone downloading it here.
  downloadUrl: '/downloads/perigee-wallet-0.1.0.zip',
  downloadVersion: '0.1.0',
  downloadSha256: 'af273de7198764a7b3264b6d1d61f69dd10199e375b894d95d2fdea82c5cbef3',
  unsupportedLabel: 'Chrome & Edge only',
} as const

// The Solana community token. Everything <TokenBar/> renders comes from here.
export const token = {
  chain: 'Solana',

  /**
   * Ticker, once it is chosen. Rendered as `$SYMBOL` ahead of the address; the
   * bar falls back to the neutral `label` below while this is null, so shipping
   * does not have to wait on naming.
   */
  symbol: null as string | null,

  /**
   * null until the mint exists — and it has to stay null until then.
   *
   * Never put a placeholder here. Not a shortened one, not an obviously-fake
   * one, not a real address borrowed for testing. A meme launch attracts
   * impostor mints, and any base58-shaped string sitting in this bar is
   * something a visitor copies and sends money to. It can also be screenshotted
   * and passed around as our official address, which we would then be unable to
   * take back.
   *
   * While this is null the bar renders one line of text: nothing to copy, and no
   * scanner links, because those are built from the address itself and cannot
   * exist without it.
   *
   * Same switch as `product.chromeStoreUrl` above — set it and the component
   * changes state. One line.
   */
  contractAddress: null as string | null,

  // Short enough on its own that pending/pendingShort no longer need to differ.
  pending: 'The contract address appears here',
  pendingShort: 'The contract address appears here',
  label: 'Contract',
  copy: 'Copy',
  copied: 'Copied',

  // Bases, not full URLs: both are completed with the address, so before launch
  // they are absent by construction rather than by remembering to hide them.
  explorerBase: 'https://solscan.io/token/',
  explorerLabel: 'Solscan',
  dexBase: 'https://dexscreener.com/solana/',
  dexLabel: 'DEXScreener',
} as const

export const hero = {
  eyebrow: '✦ Extension + iOS + Android — waitlist open',
  line1: 'Hold your own keys.',
  line2: 'Nothing leaves the device.',
  sub: 'Perigee generates and signs on your machine. The seed phrase never touches our servers, because there are no servers. 40+ networks, one wallet, zero accounts.',
  ctaPrimary: 'Get Perigee',
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
      // TODO: wire href to the published audit report(s)
      body: "Reviewed by independent security firms — and the reports are public. Don't trust the badge, read them.",
      href: '#',
    },
    {
      label: 'Open source',
      // TODO: swap for real repo URL
      body: 'Nothing hidden, nothing to take on faith — the whole wallet is open source.',
      href: '#',
    },
    {
      label: 'No accounts',
      body: 'No email, no KYC, no analytics tied to an address.',
      href: null,
    },
    {
      label: 'Hardware',
      body: 'Pair a Ledger or Trezor and the key never leaves it — Perigee only talks to the device.',
      href: null,
    },
  ],
  cantHeading: "Things Perigee can't do",
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
  copyright: `© ${2026} Perigee`, // TODO: keep year current
  smallprint:
    'Perigee is non-custodial software. You are responsible for your own keys.',
} as const

// /install — the six-step "load unpacked" walkthrough. `code` renders as
// copyable text, never as a link: Chrome blocks navigation to chrome:// URLs
// from a web page, so an <a href="chrome://extensions"> silently does nothing.
export const install = {
  eyebrow: '✦ No store required',
  line1: 'Add Perigee',
  line2: 'to your browser.',
  sub: 'Two minutes, no account. Works on Chrome, Edge and Brave — or install it in one click from the Chrome Web Store, linked in the header.',
  download: 'Download Perigee',
  secondary: 'Read the security model',
  updateNote:
    'Loaded this way, Perigee does not update itself — grab a newer package here when one ships.',
  unsupported:
    'Perigee is a Chromium extension. Open this page in Chrome, Edge, Brave or Opera on a desktop to install it.',
  steps: [
    {
      icon: 'download',
      title: 'Download the extension',
      body: "Grab the Perigee package and unzip it somewhere you'll remember. It's a standard unpacked Chrome extension — no installer, no account.",
    },
    {
      icon: 'puzzle',
      title: 'Open your extensions page',
      body: 'In Chrome go to',
      code: 'chrome://extensions',
      bodyAfter:
        '(Edge: edge://extensions, Brave: brave://extensions). This is where browsers let you add local extensions.',
    },
    {
      icon: 'toggle',
      title: 'Turn on Developer mode',
      body: 'Flip the "Developer mode" switch in the top-right corner. It unlocks the "Load unpacked" button, which installs an extension from a folder instead of the store.',
    },
    {
      icon: 'folder',
      title: 'Load unpacked → pick the folder',
      body: 'Click "Load unpacked" and select the unzipped folder. Perigee appears in your toolbar — pin it so it is one click away.',
    },
    {
      icon: 'enclave',
      title: 'Create your wallet',
      body: 'Open Perigee, set a password, and write down your 12-word recovery phrase. Keys are generated and encrypted on your device — never sent anywhere.',
    },
    {
      icon: 'networks',
      title: 'Explore every network',
      body: 'Send, receive, swap and buy across eight networks, all self-custody. Your keys stay on your device the whole time.',
    },
  ],
  safetyTitle: 'A word on safety',
  safetyBody:
    'Perigee is self-custody: your recovery phrase is the only way back in, and no one — not us — can recover it for you. Store it offline, never paste it into a website, and only approve transactions you understand.',
} as const

export const waitlist = {
  title: 'Join the waitlist',
  body: 'Perigee ships as a browser extension and iOS/Android app. Drop your email and we’ll tell you the moment it’s live. No account, no spam.',
  emailPlaceholder: 'you@domain.com',
  button: 'Request access',
  success: "You're on the list.",
  successBody: "We'll email you when Perigee is ready. Nothing else.",
  invalid: 'Enter a valid email.',
} as const
