# Phoenix Wallet — extension

A Manifest V3 Chrome extension: a **complete, clickable prototype** of a self-custody wallet for
eight networks (Ethereum, Solana, Bitcoin, Base, Arbitrum, Optimism, Polygon, Sui). Every screen,
state and flow in `docs/phoenix-wallet-PROMPT.md` is built and navigable. There is no key generation, no
crypto library, and no network call anywhere in the source — all data comes from `src/mock/`, a
synchronous in-memory layer. See `HANDOFF.md` for exactly what a backend replaces and to what
shape.

## Requirements

Node 20+. No other tooling.

## Running it

```bash
npm install
npm run dev          # http://localhost:5173 — the popup in a normal browser tab
```

`src/config.ts`'s `START_AT` controls which screen the app opens on (`'welcome'` ships; `'home'` and
others are dev shortcuts documented inline). It must be `'welcome'` before building for real use —
the verification gates below assume it.

### Loading it as an actual extension

```bash
npm run build         # tsc --noEmit && vite build → dist/
```

Chrome: `chrome://extensions` → enable Developer mode → **Load unpacked** → select `dist/`.
(Chromium-based browsers only — Opera GX works the same way at `opera://extensions`; Safari
cannot load unpacked Chrome extensions.)

## Where things live

```
src/
  screens/      one file per screen in §9, grouped by flow (onboarding/, send/, swap/, buy/, ...)
  components/   primitives (Button, Field, Sheet, ...), wallet-specific pieces, hand-drawn icons
  router/       typed route union (routes.ts) + the exhaustive switch in Router.tsx
  state/        useReducer + Context, history stack lives in reducer state
  mock/         the entire backend stand-in — db.ts (seed data), api.ts (read/write functions),
                tokens.ts / nfts.ts / activity.ts / chains.ts (typed data + math)
  lib/          formatting, address validation, motion (GSAP), clipboard
  styles/       @font-face, focus ring, grain overlay, reduced-motion CSS
scripts/        build-time and QA tooling — see below
store/          Chrome Web Store submission material (listing copy, privacy policy, screenshots)
```

Every screen renders from **props and context only** — no screen imports from another screen, and
no business logic lives outside `src/mock/`. Swapping the mock layer for real data should not
require touching `src/screens/` or `src/components/`.

## Verification

Two harnesses check the **built artifact** (`dist/`), not the dev server, so what is measured is
what ships. Every mode exits non-zero on any failed check *or any console output* — a clean run
also proves the console is silent.

```bash
npm run check:mock                                  # 86 assertions on the mock data layer itself
npm run build && npx vite preview --port 4180 &
node scripts/review.mjs audit      http://localhost:4180                  # contrast, forbidden APIs, gradient discipline
node scripts/review.mjs keyboard   http://localhost:4180                  # keyboard-only pass, §11 + §13
node scripts/review.mjs onboarding http://localhost:4180 out.png          # §9.1 + error states
node scripts/review.mjs home       http://localhost:4180 out.png          # §9.3 + network/account switch
node scripts/review.mjs flows      http://localhost:4180 out.png          # send / swap / buy / receive
node scripts/review.mjs settings   http://localhost:4180 out.png          # §9.7, accounts, currency
node scripts/review.mjs walk       http://localhost:4180 out.png          # nav stack + switchers
node scripts/review.mjs motion     http://localhost:4180 out.png          # §10 + reduced motion
```

Current totals: onboarding 30, home 11, flows 23, settings 47, walk 12, motion 16, keyboard 32,
mock 86 — all passing, zero console output, `audit`'s contrast/forbidden-API/gradient checks clean.

Other scripts, not part of the gate: `generate-icons.mjs` (toolbar icons from the brand PNG),
`trace-mark.mjs` / `mark-source.mjs` (re-derive the brand shard if the logo changes),
`package.mjs` (zips `dist/` for Chrome Web Store submission — see `store/README.md`).

## What this is not

- Not a real wallet: no keys are ever generated or derived, nothing is cryptographically signed,
  and `ImportSeed` only ever accepts the one fixed sample phrase in `src/mock/db.ts` — a real
  recovery phrase is rejected by construction.
- Not connected to anything: `manifest.json` requests zero permissions, and
  `grep -rE "fetch\(|ethers|web3|bip39|https?://" src/` returns nothing.
