import type { Config } from 'tailwindcss'

// Tokens live here, not as scattered arbitrary values. Only the Perigee
// ramp exists — the palette is replaced (not extended) so a stray
// red/orange/yellow util can't compile. Values come from CSS custom
// properties in src/index.css :root, which is the single source of truth
// for hex; src/theme/colors.ts mirrors them for code that can't read CSS
// (GLSL, canvas).
export default {
  content: ['./index.html', './install.html', './src/**/*.{ts,tsx}'],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      base: 'var(--bg-base)', // page background; also the dark text on an accent fill
      surface: 'var(--bg-surface)', // card / panel
      elevated: 'var(--bg-elevated)', // raised surface, borders
      ink: 'var(--text-primary)', // primary text
      haze: 'var(--text-secondary)', // secondary text
      subtle: 'var(--border-subtle)', // hairline borders
      accent: {
        300: 'var(--accent-300)', // brightest — text-scale accents, glow cores
        400: 'var(--accent-400)', // secondary accent, icons, hover
        500: 'var(--accent-500)', // primary — CTA fills, focus rings, the brand
        600: 'var(--accent-600)', // pressed states, gradient midpoint
        800: 'var(--accent-800)', // deep outer glow, decorative only, NEVER text
      },
      blue: {
        400: 'var(--blue-400)',
        500: 'var(--blue-500)',
        600: 'var(--blue-600)',
      },
      cyan: {
        400: 'var(--cyan-400)', // hottest point of a glow — used sparingly
      },
    },
    fontFamily: {
      display: ['"Cabinet Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      sans: ['"Switzer"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
    },
    extend: {
      fontSize: {
        hero: ['clamp(3rem, 8.5vw, 8rem)', { lineHeight: '0.92' }],
        section: ['clamp(2rem, 4vw, 3.5rem)', { lineHeight: '1.04' }],
        body: ['17px', { lineHeight: '1.6' }],
        label: ['12px', { lineHeight: '1', letterSpacing: '0.14em' }],
      },
      letterSpacing: {
        display: '-0.035em',
        label: '0.14em',
      },
      borderRadius: {
        pill: '999px',
        card: '20px',
        input: '12px',
      },
      maxWidth: {
        prose: '52ch',
      },
    },
  },
  plugins: [],
} satisfies Config
