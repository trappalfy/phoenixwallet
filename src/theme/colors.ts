// Single source of truth for every color literal on the site (rebrand plan §1).
// tailwind.config.ts reads the CSS custom properties this backs (src/index.css
// :root); anything that can't read CSS — GLSL template strings, inline canvas
// fillStyle/gradients — imports COLORS or COLORS_VEC3 from here instead. If a
// hex value needs to change, it changes in exactly one place: index.css, and
// this file's comments (kept in sync by hand, there being no build step that
// shares values between CSS and GLSL).

export const COLORS = {
  bgBase: '#0A0818',
  bgSurface: '#121029',
  bgElevated: '#1A1738',

  accent300: '#C4B5FD',
  accent400: '#A78BFA',
  accent500: '#8B5CF6',
  accent600: '#7C3AED',
  accent800: '#2E1065',

  blue400: '#60A5FA',
  blue500: '#3B82F6',
  blue600: '#2563EB',

  cyan400: '#22D3EE',

  textPrimary: '#ECEAFF',
  textSecondary: '#A9A3C9',
} as const

// Normalized (0..1) triples for GLSL `vec3` constants — both shaders write
// sRGB directly (no gamma/tonemap pass), so this is a straight /255, not a
// linear-light conversion.
export const COLORS_VEC3 = {
  bgBase: [0.039216, 0.031373, 0.094118],
  bgSurface: [0.070588, 0.062745, 0.160784],
  bgElevated: [0.101961, 0.090196, 0.219608],

  accent300: [0.768627, 0.709804, 0.992157],
  accent400: [0.654902, 0.545098, 0.980392],
  accent500: [0.545098, 0.360784, 0.964706],
  accent600: [0.486275, 0.227451, 0.929412],
  accent800: [0.180392, 0.062745, 0.396078],

  blue400: [0.376471, 0.647059, 0.980392],
  blue500: [0.231373, 0.509804, 0.964706],
  blue600: [0.145098, 0.388235, 0.921569],

  cyan400: [0.133333, 0.827451, 0.933333],
} as const

export function vec3(name: keyof typeof COLORS_VEC3): string {
  const [r, g, b] = COLORS_VEC3[name]
  return `vec3(${r}, ${g}, ${b})`
}
