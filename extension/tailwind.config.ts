import type { Config } from 'tailwindcss'

// Every design token lives here (spec §5.2–§5.4). The palette is a *replacement*,
// not an extension: there is no `blue-500` to reach for, so a stray cool hue fails
// to compile instead of shipping. Same technique as the landing site's config.
//
// Spacing is Tailwind's default 4px scale, which §5.4 already asks for — screen
// gutter 16px is `px-4`, row height 56px is `h-14`, the 40px tap-target floor is
// `h-10`. No override needed.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',

      ink: 'var(--ink)', // app background
      'surface-1': 'var(--surface-1)', // cards, list rows
      'surface-2': 'var(--surface-2)', // raised sheets, inputs
      'surface-3': 'var(--surface-3)', // pressed states, chips
      hairline: 'var(--hairline)', // 1px dividers and borders

      text: 'var(--text)', // primary text
      'text-dim': 'var(--text-dim)', // secondary text
      // §5.2's original spec value failed the 4.5:1 floor §11 sets on every surface it
      // sits on. §11 says to fix it rather than ship it, so this is lightened to clear
      // 4.5:1 on every surface it sits on: 6.31:1 on ink, 5.92:1 on surface-1, 4.98:1 on
      // surface-3.
      'text-mute': 'var(--text-mute)', // tertiary, placeholders

      'accent-deep': 'var(--accent-deep)', // gradient start
      accent: 'var(--accent)', // primary accent, focus rings
      'accent-hot': 'var(--accent-hot)', // gradient end, highlights

      gain: 'var(--gain)', // positive change
      loss: 'var(--loss)', // negative change — pink-shifted so brand red never reads as a loss
    },

    fontFamily: {
      // Bundled locally in public/fonts (§4 CSP rule: no remote font, ever).
      display: ['"Cabinet Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      sans: ['"Switzer"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
    },

    // §5.3 scale, tuned for 360px width. 22 and 34 are display-only sizes, so they
    // carry the 1.15 display line height; everything else is body at 1.45.
    fontSize: {
      11: ['11px', { lineHeight: '1.45' }],
      12: ['12px', { lineHeight: '1.45' }],
      13: ['13px', { lineHeight: '1.45' }],
      15: ['15px', { lineHeight: '1.45' }],
      17: ['17px', { lineHeight: '1.45' }],
      22: ['22px', { lineHeight: '1.15' }],
      34: ['34px', { lineHeight: '1.15' }],
    },

    extend: {
      letterSpacing: {
        display: '-0.02em', // §5.3 tight tracking on the display face
        // Cabinet Grotesk here is static, not variable, so §5.3's width-condensing
        // via font-variation-settings is unavailable. This is the stand-in.
        figure: '-0.035em',
        label: '0.14em',
      },

      borderRadius: {
        chip: '4px',
        control: '10px', // inputs and list rows
        card: '16px',
        sheet: '24px',
        pill: '999px',
      },

      boxShadow: {
        // §5.4: elevation is hairline borders plus one soft shadow. Exactly one.
        elev: '0 8px 24px rgba(0,0,0,0.45)',
        focus: '0 0 0 1px rgba(139,92,246,.55), 0 0 0 4px rgba(139,92,246,.14)',
      },

      backgroundImage: {
        // §5.2: an information channel, not decoration. Permitted in exactly four
        // places — primary button, active brand mark, total-balance figure, heat rails.
        'grad-accent': 'var(--grad-accent)',
      },

      transitionTimingFunction: {
        out: 'cubic-bezier(.2,.8,.25,1)',
        'in-out': 'cubic-bezier(.6,0,.3,1)',
      },

      transitionDuration: {
        // §10's press scale is the one entry that stays in CSS. It is a
        // transition on `:active`, not an animation: the compositor runs it
        // without JavaScript, it survives a scroll that steals the pointer, and
        // routing it through GSAP would mean pointer handlers on all forty-odd
        // buttons for a 120ms scale. The duration and the value still come from
        // here, so §10 and §5.4 stay the source of truth.
        press: '120ms',
        state: '180ms',
        route: '260ms',
        ignite: '520ms',
      },

      spacing: {
        gutter: '16px', // screen gutter
        row: '56px', // list row height
        header: '48px',
        tabbar: '56px',
      },

      // §10's eleven entries live in src/lib/motion.ts and run on GSAP behind
      // the reduced-motion guard. The keyframes that used to be here are gone
      // with them — two implementations of one transition is one too many.
      //
      // The press scale stays in CSS on purpose; see the note on `duration.press`.
    },
  },
  plugins: [],
} satisfies Config
