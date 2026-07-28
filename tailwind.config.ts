import type { Config } from 'tailwindcss'

// Tokens live here, not as scattered arbitrary values (brief §3).
// Only fire hues exist — the palette is replaced (not extended) so a stray
// blue/purple/cyan util can't compile. See brief §9.
export default {
  content: ['./index.html', './install.html', './src/**/*.{ts,tsx}'],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      void: '#07060A', // page background
      soot: '#0F0D12', // card / surface
      ash: '#1A171D', // raised surface, borders
      core: '#FFE9C4', // white-hot centre of the glow (use sparingly)
      flare: '#FFA53D', // secondary orange, hover, gradient midpoint
      ember: '#FF5A1F', // primary — CTA fills, active states, the thread
      coal: '#7A1E00', // deep outer glow, decorative only, NEVER text
      bone: '#F2EEE8', // primary text
      smoke: '#9A928C', // secondary text
      hairline: 'rgba(242,238,232,0.08)', // borders
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
