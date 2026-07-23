# Build brief — non-custodial crypto wallet landing page

> Paste this whole file into Claude Code as the initial prompt.
> Replace `Ember` with the real product name before sending. Everything marked `[PLACEHOLDER]` is invented and should be swapped for real data or removed.

---

## 1. What we're building

A **single-page marketing landing** for **Ember**, a non-custodial crypto wallet shipping as a browser extension + iOS/Android app.

**This is a static marketing site only.** No wallet functionality, no web3 libraries, no wallet connection, no backend, no auth. Every CTA opens a waitlist modal with a fake success state. Product screenshots are hand-built CSS/SVG mockups, not real UI.

**The page has one job:** convince a crypto-native visitor that this wallet never touches their keys, and get them onto the waitlist.

**Audience:** people who already own crypto and have already been burned by a custodial platform. They are skeptical, they read the security page first, and they hate marketing language. Write for them.

---

## 2. Stack

- **Vite + React 18 + TypeScript**
- **Tailwind CSS** — design tokens defined in `tailwind.config.ts`, not scattered arbitrary values
- **GSAP 3.13+** with `ScrollTrigger` and `SplitText` (all GSAP plugins are free as of 3.13; if `SplitText` is unavailable in the installed version, wrap lines manually with a small utility instead)
- **Lenis** (`npm i lenis`) for smooth scroll, wired to `ScrollTrigger.update`
- **OGL** (~12kb) or raw WebGL2 for the hero shader — **do not pull in three.js** for a fullscreen quad
- No component library, no Framer Motion, no icon packs. Icons are inline SVG, 1.5px stroke, currentColor.

---

## 3. Design tokens

Dark monolith throughout — no light sections, no theme toggle. The only color on the page is fire.

```
--void    #07060A   page background
--soot    #0F0D12   card / surface
--ash     #1A171D   raised surface, borders
--core    #FFE9C4   white-hot center of the glow (use sparingly, it's the brightest thing on the page)
--flare   #FFA53D   secondary orange, hover states, gradient midpoint
--ember   #FF5A1F   primary — CTA fills, active states, the thread
--coal    #7A1E00   deep outer glow, decorative only, NEVER text
--bone    #F2EEE8   primary text
--smoke   #9A928C   secondary text
--hairline rgba(242,238,232,0.08)   borders
```

Rule: `--coal` and `--ember` never carry body copy. Headlines are `--bone`; orange appears in the glow, the CTA fill, the thread, and single-word highlights only.

**Type** — load from Fontshare/Google, self-host with `font-display: swap`:
- Display: **Cabinet Grotesk** 500/700 — headlines only, tracking `-0.035em` at display sizes
- Body: **Switzer** 400/500 — everything else
- Mono: **JetBrains Mono** 400 — addresses, numbers, network names, labels, the "can't do" list

Type scale: hero display `clamp(3rem, 8.5vw, 8rem)` / line-height `0.92`. Section headings `clamp(2rem, 4vw, 3.5rem)`. Body `17px/1.6`. Labels `12px` mono, uppercase, `0.14em` tracking.

**Surfaces:** cards are `--soot` with a `--hairline` border and no shadow. Depth comes from glow, not drop shadows. Radii: 999px buttons, 20px cards, 12px inputs. A full-page SVG `feTurbulence` grain overlay at 3–4% opacity sits above everything at `pointer-events: none`.

---

## 4. Signature element — the thread

**This is the one thing the page is remembered by. Spend the design budget here.**

A single molten filament of light. It's born in the hero as a wide, turbulent horizontal band (the shader), then narrows into a 1px `--ember` line that runs vertically down the page through every section, flaring brighter at each section anchor as it's scrolled past.

In the security section, the thread visibly enters the device mockup **and terminates inside it** — it does not continue out the other side to a server. That's the whole product thesis rendered as a graphic: the key goes in and never comes back out.

Implementation: one SVG path, fixed-positioned, `stroke-dasharray` driven by scroll progress. Flares are `feGaussianBlur` circles whose opacity is tweened by per-section ScrollTriggers.

---

## 5. Page structure — 6 screens

### Nav (fixed, transparent → `--void` at 88% opacity + backdrop-blur after 40px scroll)
Wordmark left. Center links: `Product` · `Security` · `Networks` · `Docs`. Right: `Log in` text link + pill button `Get Ember` with a circular arrow badge. Height 68px, `--hairline` bottom border appears on scroll.

### 1 — Hero (100vh, shader background)
Structure mirrors the reference: eyebrow pill, small light line, huge display line, sub, CTAs, network row pinned to the bottom.

- Eyebrow pill: `✦ Extension + iOS + Android — waitlist open` (translucent, `--hairline` border)
- Line 1, display 500, ~38% of line 2's size: `Hold your own keys.`
- Line 2, display 700, full bleed: `Nothing leaves the device.`
- Sub, `--smoke`, max-width 52ch: `Ember generates and signs on your machine. The seed phrase never touches our servers, because there are no servers. 40+ networks, one wallet, zero accounts.`
- CTAs: `Add to Chrome` (solid `--ember`, `--void` text) + `Read the security model` (ghost, `--hairline` border). Both open the waitlist modal.
- Bottom row, `--smoke` at 40% opacity, label above in mono: `SUPPORTED NETWORKS` — Ethereum, Solana, Bitcoin, Base, Arbitrum, Optimism, Polygon, Sui as monochrome inline SVG marks. Hover → 100% opacity + slight scale.

### 2 — Bento grid, 4 cards, asymmetric (2 wide + 2 narrow)
Section label: `WHAT YOU ACTUALLY GET`

1. **Keys stay on device** — Generated in your device's secure enclave, encrypted at rest, never transmitted. Not to us, not to a backup, not to a cloud.
2. **One wallet, 40+ networks** — EVM chains, Solana, Bitcoin and Cosmos in a single account list. No switching profiles.
3. **Swaps that show their work** — Routes across 20+ DEXs with the fee, the slippage and the route displayed before you confirm.
4. **Read the transaction before you sign** — Every call simulated in plain English. Unlimited approvals get flagged in red.

Each card: pointer-tracked radial `--ember` glow following the cursor (CSS vars `--mx`/`--my` updated on `pointermove`), border brightens to 20% opacity, max 4° tilt. One inline SVG icon per card, `--flare`.

### 3 — Pinned product showcase
Pin for ~280vh. A device frame (browser extension popover on desktop, phone on mobile) stays centered while three UI states cross-fade as you scroll: **Portfolio → Swap → Signature request**. Copy block on the left swaps in sync.

Build the three UI states as CSS/SVG mockups: token rows with mono balances, a swap card with route breakdown, a signing sheet with a red "unlimited approval" warning chip. Keep them low-detail and dark — they read as texture, not as a screenshot to be studied.

On `<768px`: drop the pin entirely, stack the three states as normal scroll-reveal blocks.

### 4 — Security ("The part that matters")
The thread terminates here. Two columns:

Left — four short proof points with mono labels: `AUDITED` `[PLACEHOLDER: 3 independent audits, firms named + linked]` · `OPEN SOURCE` `[PLACEHOLDER: repo link]` · `NO ACCOUNTS` No email, no KYC, no analytics tied to an address · `HARDWARE` Ledger and Trezor supported from day one.

Right — an inverted list on `--soot`, mono, each line prefixed with a struck-through dash. Heading: `Things Ember can't do`
- Recover your seed phrase
- Freeze or reverse your funds
- See your balances
- Sell your data
- Be subpoenaed for your keys

Footnote, `--smoke`, small: `This is a feature list, not a disclaimer. If you lose your seed phrase, your funds are gone. That is the trade.`

### 5 — Numbers + network marquee
Four counters that tick up on entry, mono, display-size: `$0 [PLACEHOLDER] custodied` · `40+ networks` · `3 audits` · `100% open source`. Below, a two-row infinite marquee of network wordmarks scrolling in opposite directions, edges masked with a `--void` gradient.

### 6 — Final CTA + footer
Centered. The shader returns here at ~35% intensity as a bottom-edge glow. Headline: `Take your keys back.` Email input + `Join the waitlist` button inline — validates format, fakes a 700ms submit, resolves to `You're on the list.` with the input replaced by a mono confirmation row. No network request.

Footer: wordmark, three link columns (Product / Resources / Legal — all `#` stubs), copyright, small print `Ember is non-custodial software. You are responsible for your own keys.`

---

## 6. Hero shader spec

A fullscreen fragment shader on a single triangle. The look: a horizontal molten filament — white-hot core, orange bloom, deep red halo dissolving into black — undulating slowly, broken into bright and dim stretches along its length so it reads as **molten metal, not a neon tube**.

Starting point:

```glsl
precision highp float;
uniform float uTime;    // seconds
uniform vec2  uRes;
uniform vec2  uMouse;   // -1..1, lerped
uniform float uScroll;  // 0..1 hero scroll progress
uniform float uIntro;   // 0..1, ramped on page load

// hash21 / valueNoise / fbm (4 octaves) — standard implementations

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;

  float t = uTime * 0.08;

  // domain-warped centreline
  float warp = fbm(vec2(p.x * 1.6 + t, t * 0.7)) - 0.5;
  float thick = 0.02 + 0.05 * fbm(vec2(p.x * 2.5 - t * 1.3, 4.0));
  float d = abs(p.y - warp * 0.28 - uMouse.y * 0.02);

  float core = smoothstep(thick * 0.35, 0.0, d);
  float glow = smoothstep(thick * 6.0,  0.0, d);
  float halo = smoothstep(thick * 18.0, 0.0, d);

  vec3 col = CORE * core
           + EMBER * pow(glow, 1.6) * 0.9
           + COAL  * pow(halo, 2.2) * 0.55;

  // molten, not neon: vary brightness along x
  col *= 0.72 + 0.5 * fbm(vec2(p.x * 5.0 - t * 2.0, 1.7));

  col *= uIntro;
  col *= 1.0 - uScroll * 0.65;
  col += (hash21(gl_FragCoord.xy + uTime) - 0.5) * 0.015; // dither, kills banding

  gl_FragColor = vec4(col, 1.0);
}
```

Tune the constants until it looks right — the numbers above are a starting point, not a target.

Requirements:
- Cap DPR at 1.75; on `<768px` cap at 1.0 and drop fbm to 3 octaves
- `IntersectionObserver` + `visibilitychange` → stop the rAF loop when offscreen or backgrounded
- If WebGL is unavailable **or** `prefers-reduced-motion: reduce`, render a static CSS radial-gradient fallback that matches the shader's resting frame
- Canvas is `position: fixed`, `z-index: 0`, `pointer-events: none`; content sits above it

---

## 7. Motion spec

**Load sequence** (once, ~1.6s total, `power3.out`):
`uIntro` 0→1 over 1.2s → nav fades in → eyebrow pill scales from 0.92 → headline lines revealed by clip-path `inset(0 0 100% 0)` + `y: 110%`, stagger 0.09 → sub + CTAs → network row stagger 0.04.

**Scroll:**
- Lenis: `duration: 1.1`, `easing: t => 1 - Math.pow(1 - t, 3)`; `lenis.on('scroll', ScrollTrigger.update)` and drive it from `gsap.ticker`
- Hero headline parallax: `y: +90, opacity: 0.25` across the hero's scroll range
- Section reveals: `ScrollTrigger.batch`, `y: 28 → 0`, `opacity: 0 → 1`, stagger 0.06, `start: 'top 82%'`, no scrub
- Thread: `stroke-dashoffset` scrubbed to overall page progress; flares tween per section
- Marquee: `gsap.to` with `modifiers: { x: gsap.utils.unitize(x => parseFloat(x) % width) }`, pause on hover
- Counters: `snap: { textContent: 1 }`, triggered once on entry

**Micro-interactions:**
- Magnetic primary buttons — translate toward cursor up to 8px, elastic release
- Nav links: `--ember` underline wiping in from the left, 220ms
- Card cursor-glow (section 2)
- Focus-visible: 2px `--ember` ring, 3px offset — never remove outlines

**`prefers-reduced-motion: reduce`:** every element jumps to its final state, all ScrollTriggers killed, marquee static, shader on the fallback frame. Test this path — it must not leave anything invisible.

---

## 8. Non-negotiables

- **Responsive** at 390 / 768 / 1280 / 1728. Nothing horizontally scrolls. Hero headline never breaks mid-word.
- **Performance:** LCP < 2.0s, CLS < 0.02, JS bundle < 190kb gzipped excluding fonts, 60fps scroll on a mid-range Android.
- **Accessibility:** semantic landmarks, one `h1`, keyboard-navigable modal with focus trap and Esc-to-close, body text ≥ 4.5:1 contrast, `aria-label` on icon-only controls, decorative canvas `aria-hidden`.
- **Structure:** one component per file under `src/components/`, shader isolated in `src/gl/`, all copy extracted to `src/content/copy.ts` so it can be edited without touching JSX, GSAP contexts cleaned up in `useLayoutEffect` returns.

---

## 9. Do not

- Do not use purple, violet, blue or cyan anywhere. The references are blue; **we are not**. The only hues on this page are the ember ramp.
- Do not use three.js.
- Do not show logos of real companies as social proof. Network marks only, labelled as supported networks.
- Do not write "revolutionize", "seamlessly", "empower", "unlock", "the future of", "trusted by thousands". Short declarative sentences. No exclamation marks.
- Do not use emoji as icons.
- Do not apply `backdrop-blur` to more than one surface (the nav). No glassmorphism cards.
- Do not number sections `01 / 02 / 03` — nothing on this page is a sequence.
- Do not add default Tailwind shadows (`shadow-xl`, `shadow-2xl`). Depth is glow only.
- Do not install any web3, wallet, or crypto package.
- Do not scatter animation everywhere. The shader and the thread carry the motion; everything else is a quiet fade-up.

---

## 10. Build order

1. Scaffold Vite + TS + Tailwind, wire tokens into `tailwind.config.ts`, self-host fonts, set up the grain overlay and base layout.
2. Build the shader canvas alone on an otherwise blank page. Iterate until it looks molten. Profile it before moving on — if it's not 60fps here it never will be.
3. Nav + hero + load timeline.
4. Sections 2–6 as static markup with final copy.
5. Lenis + all ScrollTriggers + the thread.
6. Responsive pass, reduced-motion pass, keyboard/a11y pass.
7. Screenshot at all four breakpoints, self-critique, cut one effect that isn't earning its place.

Work through the stages in order and pause after stage 2 and stage 4 so I can look before you continue.
