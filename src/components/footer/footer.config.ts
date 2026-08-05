// Footer content (FOOTER-SPEC §1). Edit copy here, never in JSX.
// Placeholders marked TODO are safe to swap for real data.
export const FOOTER = {
  brandName: 'PERIGEE', // drawn as scanlines in the wordmark
  brandMark: null as string | null, // '/brand/perigee-wordmark.svg' when available → scanned instead of the font
  legal: '©Perigee Wallet® 2026',

  eyebrow: 'YOUR KEYS. YOUR CHAIN. YOUR CALL.',
  headline: ['Ready to hold', 'something real?'] as const,

  cta: { label: 'GET STARTED', href: '#top' }, // scrolls back to the hero

  email: 'hello@perigeewallet.space',

  socials: [
    // order = column 1 top→bottom, then column 2
    { label: 'X', href: 'https://x.com/PerigeeWallet', soon: false },
    { label: 'Discord', href: null, soon: true },
    { label: 'Github', href: null, soon: true },
    { label: 'Telegram', href: null, soon: true },
  ],

  timezone: 'Europe/Warsaw',
  timezoneLabel: 'CET',
} as const
