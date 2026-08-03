# Phoenix Wallet — Chrome Extension UI Build Spec

> **Superseded by the Perigee rebrand.** The product built from this spec was renamed Phoenix →
> Perigee and its palette moved from the warm ember ramp to a violet/blue/cyan one. §1 (name),
> §5.1 (logo gradient description) and §5.2 (palette table) no longer match the shipped UI — see
> `tailwind.config.ts` and `src/styles/index.css` for the current tokens. This file is kept as the
> historical build brief; the rest of it (layout, screens, motion, mock-data seam) still describes
> the real implementation.

> **How to use this file:** put it at the repo root as `PROMPT.md`, drop the brand logo at
> `assets/brand/phoenix-logo.png`, then start Claude Code with:
> `Read PROMPT.md in full, then execute Phase 0 and Phase 1. Stop and show me the design tokens and primitives before continuing.`

---

## 1. Mission

Build the complete **visual front end** of Phoenix Wallet, a browser-extension crypto wallet
(Manifest V3, Chrome). This is a **clickable prototype**: every screen, every state, every
transition is real and navigable, but there is **no blockchain, no cryptography, and no network
layer**. All data comes from a local mock store. A backend team will replace the mock layer later,
so the seam between UI and data must be clean and obvious.

Judge success by two things: (a) a reviewer can click through every flow end to end without hitting
a dead end, and (b) the result looks like a shipped product from a design-led company, not a
component-library demo.

## 2. Hard constraints — read before writing code

1. **No real wallet functionality.** Do not generate keys, do not implement BIP-39 derivation, do
   not import any crypto library (`ethers`, `web3`, `@solana/web3.js`, `bip39`, `tweetnacl` — none
   of them). No `fetch` to any host. No RPC endpoints, not even commented out.
2. **The recovery phrase is a fixed dummy constant** in `src/mock/db.ts`, marked with a comment
   stating it is not a valid wallet and holds no funds. The "confirm your phrase" step validates
   against that constant. Password fields accept any input ≥ 8 chars and store nothing anywhere.
3. **Ship a demo marker.** A small `DEMO` chip sits in the header, defined in exactly one place
   (`src/config.ts` → `IS_DEMO`) so it can be removed with a one-line change. A UI that looks like a
   funded wallet but isn't must say so.
4. **Manifest V3 CSP applies.** No remote scripts, no remote fonts, no CDN links, no `eval`, no
   inline `<script>`. Every font and asset is bundled locally. This is a build-breaking rule, not a
   style preference.
5. **Popup only.** One surface: a 360 × 600 px popup. No side panel, no options page, no content
   script, no full-page onboarding tab. Chrome caps popups at 800 × 600, so 600 px is the ceiling —
   the shell never scrolls; only designated content regions scroll internally.
6. **Backend seam.** Every place that will later need a real call gets a
   `// TODO(backend): <what it needs>` comment. No business logic outside `src/mock/`.

## 3. Stack

Exactly these dependencies. Do not add others without saying why first.

| Purpose | Package |
| --- | --- |
| Build | `vite`, `@vitejs/plugin-react` |
| Framework | `react@18`, `react-dom@18`, `typescript` |
| Styles | `tailwindcss`, `postcss`, `autoprefixer` |
| Motion | `gsap@^3.13`, `@gsap/react` |
| QR rendering | `qrcode` |
| Icon generation (dev only) | `sharp` |
| Fonts (bundled) | `@fontsource-variable/bricolage-grotesque`, `@fontsource-variable/instrument-sans`, `@fontsource/ibm-plex-mono` |

**Explicitly forbidden:** any component library (shadcn, MUI, Chakra, Radix, Headless UI), Framer
Motion, any icon package (lucide, heroicons, react-icons), any state library (Redux, Zustand, Jotai),
any router package, `styled-components`, CSS-in-JS.

**Not used in the extension:** `ScrollTrigger`, `Lenis`, `OGL`/WebGL, `SplitText`. A 360 × 600 popup
has no page scroll and remounts on every open — scroll-driven animation and shader backgrounds cost
GPU and first-paint time for nothing. GSAP is here for micro-interactions only.

State is React `useReducer` + Context. Routing is a hand-rolled typed navigation stack (§8).
Icons are hand-written inline SVG, 1.5 px stroke, `stroke="currentColor"`, `fill="none"`,
24 × 24 viewBox, no filled shapes except the brand mark.

## 4. Project structure

```
phoenix-wallet/
├─ assets/brand/phoenix-logo.png        # source logo, provided
├─ public/
│  ├─ manifest.json
│  └─ icons/{16,32,48,128}.png          # generated, do not hand-edit
├─ scripts/generate-icons.mjs           # sharp: logo.png → public/icons/*
├─ index.html                           # popup entry
├─ tailwind.config.ts                   # all design tokens live here
├─ src/
│  ├─ main.tsx
│  ├─ App.tsx                           # shell + router outlet
│  ├─ config.ts                         # IS_DEMO, POPUP_W/H, feature flags
│  ├─ router/{Router.tsx,routes.ts,useNav.ts}
│  ├─ state/{WalletProvider.tsx,reducer.ts,types.ts}
│  ├─ mock/{db.ts,api.ts,chains.ts,tokens.ts,nfts.ts,activity.ts}
│  ├─ components/
│  │  ├─ brand/{PhoenixMark.tsx,DemoChip.tsx}
│  │  ├─ icons/index.tsx                # one export per icon
│  │  ├─ primitives/{Button,IconButton,Sheet,Field,Toast,Skeleton,Tabs,Pill,Divider}.tsx
│  │  └─ wallet/{AccountSwitcher,NetworkSwitcher,BalanceHero,ActionRow,TokenRow,NftCard,ActivityRow,AssetPicker,SeedGrid,AddressLine,AmountInput,FeeSelector,ReviewCard,QrPanel}.tsx
│  ├─ screens/
│  │  ├─ onboarding/{Welcome,CreateOrImport,SetPassword,SeedReveal,SeedConfirm,ImportSeed,Ready}.tsx
│  │  ├─ Unlock.tsx
│  │  ├─ Home.tsx                       # hosts Tokens | NFTs | Activity tabs
│  │  ├─ send/{SendTo,SendAmount,SendReview,TxStatus}.tsx
│  │  ├─ Receive.tsx
│  │  ├─ swap/{Swap,SwapReview}.tsx
│  │  ├─ NftDetail.tsx
│  │  ├─ ActivityDetail.tsx
│  │  ├─ accounts/{AccountList,AddAccount,RenameAccount}.tsx
│  │  └─ settings/{Settings,Security,Networks,Currency,ConnectedSites,About}.tsx
│  ├─ lib/{format.ts,motion.ts,clipboard.ts}
│  └─ styles/index.css
```

## 5. Brand and design system

### 5.1 Source of truth

The logo is a white abstract spark — two interlocking four-point shards, reading as both a flash and
a bird in flight — on a diagonal gradient running from near-black through deep red and orange to
yellow. Everything below is derived from it.

Two deliverables:

- `scripts/generate-icons.mjs`: uses `sharp` to produce `public/icons/16.png`, `32.png`, `48.png`,
  `128.png` from `assets/brand/phoenix-logo.png`. At 16 and 32 px the gradient background is kept
  (the white mark on dark red stays legible in the toolbar); trim transparent padding, keep the
  square canvas, no upscaling above the source resolution. Wire it as `npm run icons` and run it
  once during Phase 0.
- `src/components/brand/PhoenixMark.tsx`: the shard mark **redrawn as inline SVG paths**,
  `fill="currentColor"`, single path where possible, 24 × 24 and 64 × 64 tested. Open the source PNG,
  match the silhouette by eye, and compare side by side before accepting it. This is the in-UI mark;
  the PNG is never rendered inside React.

### 5.2 Palette

Warm-shifted neutrals only — every dark tone carries red in it, derived from the logo's black
corner. No pure grays, no pure `#000`.

| Token | Hex | Use |
| --- | --- | --- |
| `ink` | `#0A0506` | app background |
| `surface-1` | `#140A0B` | cards, list rows |
| `surface-2` | `#1E1011` | raised sheets, inputs |
| `surface-3` | `#2A1719` | pressed states, chips |
| `hairline` | `rgba(255,196,0,0.09)` | 1 px dividers and borders |
| `text` | `#F7EDEA` | primary text |
| `text-dim` | `#B39C97` | secondary text |
| `text-mute` | `#7A6663` | tertiary, placeholders |
| `ember-deep` | `#D00000` | gradient start |
| `ember` | `#FF4D00` | primary accent, focus rings |
| `ember-hot` | `#FFC300` | gradient end, highlights |
| `gain` | `#3ED598` | positive change |
| `loss` | `#FF3B5C` | negative change |

`--grad-ember: linear-gradient(135deg, #D00000 0%, #FF4D00 55%, #FFC300 100%)` — angle copied from
the logo so the UI and the icon share one light direction.

**Gradient discipline (the rule that keeps this from looking generic):** the ember gradient is an
information channel, not decoration. It appears in exactly four places — the primary button, the
active state of the brand mark, the total-balance figure, and the thin progress/heat rails. It never
appears as a background wash, a blurred blob, a card border, or behind text. Everything else is
`ink` and `surface-*` with `hairline` edges.

Loss uses pink-shifted `#FF3B5C` specifically because brand red must never read as "you lost money."

A single grain layer sits above `ink`: an inline SVG `feTurbulence` at `opacity: 0.035`,
`pointer-events: none`, fixed, no animation. It keeps large dark areas from banding.

### 5.3 Typography

| Role | Face | Notes |
| --- | --- | --- |
| Display | Bricolage Grotesque Variable | balances, screen titles, empty-state headlines. Tight tracking (`-0.02em`), weight 600–700, `font-variation-settings` width slightly condensed on the balance figure. |
| UI / body | Instrument Sans Variable | labels, buttons, body copy, list rows |
| Utility / mono | IBM Plex Mono | addresses, tx hashes, seed words, token amounts, gas values, contract IDs |

Anything a user might verify character by character is mono. Anything the user reads as language is
Instrument Sans. Only the display face is allowed above 20 px.

Scale (px, tuned for 360 px width): `11 / 12 / 13 / 15 / 17 / 22 / 34`. Line heights `1.15` for
display, `1.45` for body. Import faces from the local `@fontsource*` packages in `styles/index.css`;
if a package fails to install, self-host the `.woff2` in `public/fonts/` — never link a CDN.

### 5.4 Geometry, elevation, motion tokens

- Radii: `4` (chips) / `10` (inputs, rows) / `16` (cards) / `24` (sheets) / `999` (pills).
- Spacing: 4 px base, screen gutter 16 px, row height 56 px, tap targets ≥ 40 px.
- Elevation is drawn with `hairline` borders and a single soft shadow, never with lighter fills alone.
- Ember focus ring: `0 0 0 1px rgba(255,77,0,.55), 0 0 0 4px rgba(255,77,0,.14)`. Visible on
  keyboard focus for every interactive element.
- Easing tokens: `--ease-out: cubic-bezier(.2,.8,.25,1)`, `--ease-in-out: cubic-bezier(.6,0,.3,1)`.
  Durations: `120ms` (press), `180ms` (fade/state), `260ms` (route push), `520ms` (ignite only).

### 5.5 Signature moment

**The ignite.** When the wallet unlocks and once at the end of onboarding, the brand mark's path
draws in from its center over ~520 ms, a heat rail sweeps the top edge of the header, and the total
balance counts up from 0 to its value with digits in the display face. It happens on those two
screens and nowhere else. Everything after that is quiet: 120–180 ms fades and slides. Do not spread
the ignite across other screens — the popup opens dozens of times a day and a wallet that performs
on every open becomes annoying by the third launch.

### 5.6 Design tells to avoid

Not this: flat black background with one neon accent and purple glow blobs; glassmorphic frosted
cards; `01 / 02 / 03` numbered markers on things that are not sequences; a gradient-filled hero card
with a big number and three stat pills; emoji as icons; centered marketing copy inside product UI;
drop shadows on text. The brief asks for dark and fiery — deliver that through warm neutrals,
restrained gradient use, real mono data type, and the grain layer, not through glow.

## 6. Copy rules

UI language is **English only**, sentence case, no i18n layer, no locale switcher.

- Buttons name the action and keep that name through the flow: `Send` → confirm sheet `Send` → toast
  `Sent`. Never `Submit`.
- Errors state what happened and what to do: `Not enough ETH for network fee. Reduce the amount or
  add ETH.` No apologies, no "Oops".
- Empty states are invitations: `No tokens yet` + `Receive` button, not `Nothing to display`.
- Never expose implementation words: `Recovery phrase`, not `mnemonic seed`; `Network fee`, not
  `gas limit × gwei`; `Connected sites`, not `dApp permissions`.
- Warnings on the recovery-phrase screens are direct and specific: anyone with these 12 words takes
  the funds; Phoenix cannot restore them; write them down offline.

## 7. Chains and mock data

Eight networks, in this order everywhere they are listed:

`Ethereum` · `Solana` · `Bitcoin` · `Base` · `Arbitrum` · `Optimism` · `Polygon` · `Sui`

`src/mock/chains.ts` holds for each: id, display name, symbol, an inline-SVG glyph (hand-drawn
simplified monogram, `currentColor`, no downloaded brand assets), a single brand tint used only for
the 20 px chain chip, address format (`evm` | `solana` | `bitcoin` | `sui`), and explorer label.

Address formats must be shaped correctly per chain, because the UI truncates them and users notice:
EVM `0x` + 40 hex; Solana / Sui base58-looking strings of plausible length; Bitcoin `bc1q…`. Fixed
strings, no generation.

`src/mock/db.ts` seeds:

- **3 accounts** — `Main`, `Trading`, `Cold storage` — each with per-chain addresses and a generated
  identicon-style avatar drawn as SVG from the address hash (deterministic, ember-family hues).
- **Tokens:** 4–7 per network with name, symbol, balance, USD price, 24 h change (mix of gains and
  losses, at least two negatives), and a hand-drawn SVG glyph. Include one zero-balance token so the
  hide-small-balances toggle has something to do.
- **NFTs:** 6 items across Ethereum, Base and Solana, with collection name, token id, and a
  CSS-generated artwork placeholder (layered gradients / geometric shapes drawn in the component —
  no external images, no `picsum`).
- **Activity:** ~14 entries spanning `send`, `receive`, `swap`, `approve`, `mint`, grouped by day,
  with statuses `confirmed`, `pending`, `failed` (at least one of each), fee, hash, and counterparty.
- **Totals:** portfolio value and 24 h change computed from token data, not hardcoded, so the numbers
  stay consistent when someone edits the seed.

`src/mock/api.ts` exposes plain synchronous functions (`getAccounts`, `getTokens(chainId)`,
`sendTransaction(draft)` …). No artificial latency, no simulated failures — this is a clickable
prototype, and fake spinners waste a reviewer's time. `sendTransaction` and `swap` mutate the mock
store in memory so balances and the activity list update, then reset on popup reopen. Every function
carries its `TODO(backend)` note.

## 8. Shell, navigation, state

`App.tsx` renders a fixed 360 × 600 frame: `Header` (48 px) / route content (scrollable, custom thin
ember scrollbar) / `TabBar` (56 px, four items: Home, Swap, Activity, Settings). Onboarding, Unlock,
and all `Send`/`Swap`/`Receive` flows render **full-bleed without the tab bar**.

Header contents: account switcher (avatar + name + caret) on the left, network switcher (chain chip +
name) in the middle, `DemoChip` and a lock button on the right.

Router: `src/router/` with a typed union of route names and params, a history stack in reducer state,
`push` / `replace` / `back` / `reset`, and `Router.tsx` mapping names to screens. Transitions: push
slides in from the right 12 px + fades over 260 ms; back reverses. No `react-router`.

State shape (`state/types.ts`): `{ status: 'onboarding' | 'locked' | 'unlocked', accounts, activeAccountId, activeChainId, tokensByChain, nfts, activity, prefs: { hideSmallBalances, currency }, drafts: { send, swap }, toast, nav }`.

The app opens on `Welcome` the first time and on `Unlock` afterwards; because there is no
persistence, gate this on a module-level flag with a dev shortcut (`config.ts` → `START_AT`) so any
flow can be opened directly during review.

## 9. Screens

Build every screen below. Each needs its default, empty, and error state where applicable, plus
keyboard focus order and a working back path.

### 9.1 Onboarding

1. **Welcome** — mark, product name in the display face, one-line value statement, `Create a new
   wallet` (primary) and `I already have a wallet` (ghost).
2. **CreateOrImport** — two cards explaining the difference in plain language.
3. **SetPassword** — password + confirm, live requirement checklist (8+ chars, one number), a
   strength rail using the ember gradient as a fill, a checkbox acknowledging that Phoenix cannot
   reset it.
4. **SeedReveal** — 12 words in a 3 × 4 mono grid, blurred behind a `Reveal phrase` overlay until
   tapped, `Copy` (with a 20 s clipboard-clear note) and `Download` (disabled, tooltip `Available
   after setup`), plus the warning block from §6.
5. **SeedConfirm** — three of the twelve positions blanked, word chips in shuffled order to place;
   wrong placement shakes the slot 4 px and shows the specific position that is wrong.
6. **ImportSeed** — 12 mono inputs with paste-splitting across fields (pasting a full phrase fills
   all twelve), per-word validation ticks, and a `Private key` tab as a secondary path.
7. **Ready** — the ignite moment, then `Open wallet`.

### 9.2 Unlock

Mark, password field, `Unlock`, `Forgot password?` (opens a sheet explaining recovery-phrase reset).
Wrong password: field border to `loss`, 4 px shake, attempt counter after two failures.

### 9.3 Home

```
┌────────────────────────────────────────┐
│ ◕ Main ▾      ⬡ Ethereum ▾   DEMO  🔒 │  header
├────────────────────────────────────────┤
│  Total balance                         │
│  $12,480.92          ▲ 2.14%           │  display face, gradient figure
│  0x71c…9f4a  ⧉                         │  mono, tap to copy
│                                        │
│  ┌──────┐┌──────┐┌──────┐┌──────┐      │
│  │ Send ││ Recv ││ Swap ││ Buy  │      │  ActionRow, Buy disabled + "Soon"
│  └──────┘└──────┘└──────┘└──────┘      │
├────────────────────────────────────────┤
│  Tokens   NFTs   Activity              │  Tabs, ember underline slides
│  ⬡ ETH   2.4051 ETH        $7,204.10   │
│           Ethereum          ▲ 1.9%     │  scroll region
│  ⬡ USDC  3,120.00 USDC     $3,120.00   │
│  …                                     │
├────────────────────────────────────────┤
│   Home    Swap    Activity   Settings  │  tab bar
└────────────────────────────────────────┘
```

Tokens tab: rows with glyph, symbol, network label, balance in mono, USD value, 24 h change; a
`Hide small balances` toggle in a small filter row; `Manage tokens` link at the bottom of the list.
NFTs tab: 2-column grid of `NftCard`. Activity tab: day-grouped `ActivityRow` list.
Account switcher and network switcher both open bottom sheets with search, the network sheet
including a `Testnets` toggle that reveals two mock testnets.

### 9.4 Send

`SendTo` (recipient input with paste + `Recent` and `My accounts` lists, address validated by shape
against the active chain's format, ENS-style names accepted as plain strings) → `SendAmount` (asset
picker sheet, mono amount input with `Max`, live USD conversion, insufficient-funds error, fee
selector with `Standard` / `Fast` / `Custom` and an estimate line) → `SendReview` (from/to cards,
amount, fee, total, hold-to-confirm primary button that fills with the ember gradient over 600 ms) →
`TxStatus` (pending with a heat rail, then confirmed with the mark pulsing once; `View on explorer`
disabled with `Soon`, `Done` returns Home and the new entry is at the top of Activity).

### 9.5 Receive

Chain selector, QR (rendered via `qrcode` to SVG, white modules on `surface-1` for scannability, the
mark centered in a knocked-out square), full address in mono with the middle wrapped, `Copy address`
and `Share` buttons, and a one-line warning naming the network the address belongs to.

### 9.6 Swap

Two stacked panels with a rotate button between them, per-panel asset picker and balance, rate line
(`1 ETH = 2,998.10 USDC`), a collapsible details block (slippage chips 0.1 / 0.5 / 1.0 / custom,
network fee, minimum received, route drawn as a small SVG path with two hops), `Review swap` →
`SwapReview` → the same `TxStatus` screen with swap copy. Include the same-token and
zero-amount disabled states.

### 9.7 Detail and management screens

- **NftDetail** — artwork, collection, token id, traits grid, `Send` and `Set as avatar`.
- **ActivityDetail** — status header, amount, from/to, network, fee, timestamp, hash in mono with
  copy; failed entries show a plain-language reason line.
- **AccountList / AddAccount / RenameAccount** — list with balances and a checkmark on the active
  account; add offers `Create new`, `Import recovery phrase`, `Import private key`,
  `Connect hardware wallet` (disabled, `Soon`).
- **Settings** — grouped rows: Security (auto-lock timer, change password, reveal recovery phrase
  behind a password gate), Networks (list, reorder, add custom network form), Currency (USD, EUR,
  GBP, PLN — changes every formatted value in the app), Connected sites (two mock entries with
  `Disconnect`), Appearance (dark locked, light listed as `Soon`), About (version, links).

## 10. Motion inventory

Implement exactly these, all through `useGSAP` with `gsap.context()` cleanup, all wrapped in a
`prefersReducedMotion` guard in `lib/motion.ts` that collapses them to instant state changes.

| Where | What | Duration |
| --- | --- | --- |
| Route push / back | 12 px slide + fade | 260 ms |
| Bottom sheets | y 100% → 0, backdrop fade | 240 ms |
| Button press | scale 0.97 | 120 ms |
| Tab underline | x + width tween to active tab | 200 ms |
| Balance / amount figures | digit count-up on mount and on change | 480 ms |
| Hold-to-confirm | gradient fill sweep | 600 ms |
| Tx pending | heat rail looping across the top edge | 1.4 s loop |
| Ignite (unlock, Ready) | mark path draw + header sweep + count-up | 520 ms |
| Errors | 4 px horizontal shake, 3 cycles | 180 ms |
| Copy confirmation | icon swap to check + toast slide | 180 ms |
| List mount | 12 ms stagger, first 8 rows only | 180 ms |

No entrance animation longer than 260 ms on Home — it must feel instant on every popup open.

## 11. Quality floor

- Full keyboard operation: tab order matches visual order, focus rings visible, `Esc` closes sheets,
  `Enter` submits the primary action.
- Every icon-only button has an `aria-label`; sheets are `role="dialog"` with focus trapped and
  restored; toasts are `aria-live="polite"`.
- Text contrast ≥ 4.5:1 against its own surface (check `text-mute` on `surface-1` and fix rather than
  ship it).
- `lib/format.ts` centralizes all formatting: `Intl.NumberFormat` for fiat, fixed significant digits
  for crypto amounts, middle-truncation for addresses (`0x71c4…9f4a`), relative timestamps.
- No layout shift when values change; reserve width for numbers.
- TypeScript `strict: true`, zero `any`, zero unused exports, no console output in committed code.
- Long values are handled: a 12-character token symbol, a $1,204,890.55 balance, and a 30-character
  account name must all render without breaking the row.

## 12. Build phases — stop after each and report

- **Phase 0 — scaffold.** Vite + React + TS + Tailwind, `public/manifest.json`, popup entry sized
  360 × 600, `npm run icons` generating the four PNGs, extension loads unpacked in Chrome and opens
  a placeholder popup with the mark. Report: screenshot, the manifest, and confirmation that no
  remote resource is referenced.
- **Phase 1 — design system.** Tokens in `tailwind.config.ts`, `styles/index.css` with bundled
  fonts and the grain layer, `PhoenixMark`, the icon set, all primitives, and a temporary
  `/kitchen-sink` route rendering every primitive in every state. Report: screenshot of the kitchen
  sink. **Stop here for approval before building screens.**
- **Phase 2 — shell, router, state, mock data.** Header, tab bar, navigation stack, full mock store.
- **Phase 3 — onboarding + unlock.** All seven onboarding screens and their error states.
- **Phase 4 — Home.** Balance hero, action row, three tabs, both switcher sheets.
- **Phase 5 — Send, Receive, Swap** including `TxStatus` and mock-store mutation.
- **Phase 6 — detail, accounts, settings.**
- **Phase 7 — motion pass.** Implement §10, add the reduced-motion guard, remove the kitchen-sink
  route from the router (keep the file).
- **Phase 8 — QA.** Walk §13, fix what fails, then write `README.md` (install, run, load unpacked,
  where the mock layer is, what a backend must implement) and `HANDOFF.md` listing every
  `TODO(backend)` with its file and expected data shape.

## 13. Definition of done

- [ ] Loads as an unpacked extension with no console errors or warnings.
- [ ] Every route in `routes.ts` is reachable by clicking, and every screen has a working back path.
- [ ] Onboarding runs start to finish; the seed-confirm step accepts the correct words and rejects
      wrong ones with a specific message.
- [ ] Send and Swap both complete and appear at the top of Activity with updated balances.
- [ ] Switching account or network updates the header, balance, token list, NFTs and activity.
- [ ] Changing display currency updates every formatted value.
- [ ] Nothing scrolls the 360 × 600 shell; only content regions scroll.
- [ ] `prefers-reduced-motion: reduce` removes all animation without breaking any layout.
- [ ] Keyboard-only pass through onboarding, send and settings succeeds.
- [ ] `grep -rE "fetch\(|ethers|web3|bip39|https?://(?!.*(w3\.org|fontsource))" src/` returns nothing.
- [ ] The ember gradient appears only in the four permitted places.
- [ ] `DEMO` chip visible and removable from one line in `config.ts`.
- [ ] `README.md` and `HANDOFF.md` written.

## 14. Working agreement

Ask before deviating from §3, §5.2 or §9. If a spec detail turns out wrong once it is on screen, say
so with a concrete alternative rather than silently substituting one. Prefer more small components
over large ones; no file over ~200 lines. Screenshot each phase and critique it against §5.6 before
declaring the phase done — if a screen would look at home in any generic dark-mode dashboard,
it has missed the brief.
