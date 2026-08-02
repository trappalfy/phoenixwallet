# Handoff — every `TODO(backend)`

Phoenix Wallet's UI is complete; everything it currently shows comes from `src/mock/`, a
synchronous, in-memory layer with no network calls (§2 of `docs/phoenix-wallet-PROMPT.md`). A backend
team replaces that layer — not the UI — by implementing the functions below to the same
signatures. The types referenced throughout (`Token`, `Nft`, `Activity`, `Account`, ...) are
already defined in `src/mock/` and are the intended real shapes; nothing about them is a stopgap.

Grouped by concern, each entry names the file, what stands in today, and what a real
implementation returns.

## Keyring — accounts and addresses

- **`src/mock/api.ts:41` `getAccounts()`** — returns the hardcoded `ACCOUNTS` array. A real
  implementation lists accounts derived from the unlocked keyring.
  Shape: `readonly Account[]`, `Account = { id, name, avatarNftId?, addresses: Record<AddressFormat, string> }`.
- **`src/mock/api.ts:44` `getAddress(account, chainId)`** — reads a canned address out of
  `account.addresses`. A real implementation resolves the address for that chain from the keyring.
  One address per *address format* (`evm | solana | bitcoin | sui`), not per chain — an EVM
  account has the same address on Ethereum, Base, Arbitrum, Optimism and Polygon.
- **`src/mock/api.ts:166` `createAccount(name)`** and **`src/mock/db.ts:135` `newAddresses()`** —
  generate a display-shaped random address per format. A real implementation derives the next
  account from the unlocked keyring and returns its real addresses. **Nothing here is key
  derivation** — no entropy, no BIP-32/44 path is actually walked (§2.1).
- **`src/mock/db.ts:52` `newPhrase()`** and the `RECOVERY_PHRASE` constant — twelve words with no
  BIP-39 wordlist and no checksum. A real implementation generates the phrase the keyring is
  actually seeded from and never round-trips it back through the UI in plaintext after the reveal
  step.
- **`src/screens/accounts/AddAccount.tsx:44`** — hardware-wallet connect runs a 1.4 s fake timer.
  A real implementation replaces it with WebHID/WebUSB device discovery and reads real derived
  accounts (currently three fake slots at `m/44'/60'/0'/{0,1,2}`, no addresses shown — see the
  screen for why: addresses are only ever generated at creation, never previewed).

## Balances, prices, portfolio totals

- **`src/mock/api.ts:47` `getTokens(accountId, chainId)`** — reads `tokensFor()`
  (`src/mock/tokens.ts`), a per-account weight table applied to a fixed per-chain seed list. A real
  implementation fetches token balances from an indexer and prices from a price feed, keyed by
  **(account, chain)** — §13 requires switching either to move the balance, token list, NFTs and
  activity together, so nothing may be keyed by chain alone.
  Shape: `readonly Token[]`, `Token = { id, chainId, name, symbol, balance, price, change24h, glyph, tint }`.
- **`src/mock/api.ts:67` `getTotals(accountId, chainId)`** — sums `usdValue(token)` across the
  current token list; never hardcoded. A real implementation may compute this the same way
  client-side, or sum it server-side — the contract is just `{ value: number; change24h: number }`.
- **`src/mock/tokens.ts:124`** — the whole per-account weight table (`ACCOUNT_PROFILE`) is deleted
  once real balances arrive; it exists purely to make three demo accounts look different from each
  other.

## Collectibles

- **`src/mock/api.ts:51` `getNfts(accountId, chainId)`** — filters a static `NFTS` array. A real
  implementation fetches NFTs owned by (account, chain) from an indexer.
  Shape: `readonly Nft[]`, `Nft = { id, accountId, chainId, collection, name, tokenId, traits: {label,value}[], art }`.
  `art` is CSS-drawn (`NftArt = { pattern, hues, angle }`) — a real build likely replaces this with
  a real image URL and a `<img>`/`<canvas>` renderer; `nftArtStyle()` in `src/lib/nftArt.ts` is the
  only place that would need to change.

## Activity / transaction history

- **`src/mock/api.ts:57` `getActivity(accountId, chainId)`** — filters and sorts a static
  `ACTIVITY` array. A real implementation returns paginated transaction history for (account,
  chain), newest first.
  Shape: `readonly Activity[]`, see `src/mock/activity.ts` for the full type — five kinds
  (`send | receive | swap | approve | mint | buy`), three statuses
  (`confirmed | pending | failed`), a `reason` string required on every `failed` entry.
- **`src/components/wallet/ExplorerSheet.tsx:44`** — the "View on {explorer}" sheet fabricates a
  block number, confirmation count, gas/nonce (EVM only) and fee from a hash of the transaction's
  own `hash` field, so it never changes between visits but is not real. A real implementation
  looks these up from the chain's explorer API. Kept deliberately free of any URL in source (§2.1).

## Sending

- **`src/mock/api.ts:89` `sendTransaction(draft)`** — mutates the in-memory token/NFT list and
  pushes a `pending` activity entry with a fake hash. A real implementation builds, signs and
  broadcasts the transfer, returning the real transaction hash; the `pending → confirmed` flip
  currently happens on a 1.8 s client timer (`src/screens/send/TxStatus.tsx`, `SETTLE_MS`) rather
  than a real confirmation.
- **`src/screens/send/SendAmount.tsx:13`** (`BASE_FEE`) and **`src/components/wallet/FeeSelector.tsx:7`**
  — fixed multipliers over a hardcoded base fee for the standard/fast tiers. A real implementation
  estimates the real network fee per tier.
- **`src/lib/address.ts:7` `checkRecipient()`** — validates address *shape* only (regex per
  format), including which chain a well-formed-but-wrong-network address looks like. A real
  implementation adds real per-chain validation, including EIP-55 checksum casing for EVM
  addresses.

## Swap

- **`src/screens/swap/Swap.tsx:16`** (`NETWORK_FEE`) and the rate shown (`from.price / to.price`)
  — plain price-ratio math, no slippage model, no real route. A real implementation calls a quote
  endpoint for the rate, minimum received and fee.
- **`src/components/wallet/SwapRoute.tsx:5`** — draws a fixed two-hop path (`asset → Phoenix →
  asset`); there is no router behind it. A real implementation draws the real route from the
  quote.
- **`src/mock/api.ts:130` `swap(draft)`** — same mutate-and-fake-hash pattern as `sendTransaction`.
  A real implementation executes the swap and returns the real hash.

## Buy

- **`src/mock/api.ts:189` `getBuyable(accountId, chainId)`** — every asset the chain seed list
  defines, carrying this account's real balance where it holds any, zero otherwise. A real
  implementation returns the payment provider's supported-asset list for that chain.
- **`src/mock/api.ts:198` `buyTokens(draft)`** — credits the account and pushes a `pending`
  activity entry with `fee: 0` (the provider is assumed to cover network cost). A real
  implementation creates the order with the payment provider and settles the activity entry on
  fill, at which point a real fee may apply.
- **`src/mock/db.ts:216` `PAYMENT_METHODS`** — three hardcoded methods (Visa, Apple Pay, SEPA)
  with fixed fee percentages, ETAs and per-order limits. A real implementation returns the
  signed-in user's actual saved methods, fees and limits from the payment provider.

## Display currency

- **`src/mock/db.ts:236` `FX`** and **`src/screens/settings/Currency.tsx:66`** — four fixed
  USD conversion rates (`USD, EUR, GBP, PLN`). A real implementation keys live FX rates off the
  same `CurrencyCode` codes; every screen already reads through `lib/format.ts`'s `formatFiat()`,
  so updating the rate table is the only change needed.

## Networks

- **`src/screens/settings/Networks.tsx:142`** — a custom network a user adds is stored and shown
  ("not connected in this demo") but cannot be switched to, because `ChainId` is a closed union the
  whole app's typing depends on. A real implementation attaches an RPC endpoint and promotes custom
  networks to selectable — this is a larger change than the other entries here, since it touches
  the `ChainId` type itself rather than one function.

## Security

- **`src/screens/settings/Security.tsx:116`** — the auto-lock minutes setting is stored in state
  and displayed, but nothing currently locks the wallet on a timer. A real implementation adds an
  idle timer plus a lock-on-popup-close hook.
- **`src/lib/clipboard.ts:21`** — `copyText()` writes to the clipboard and never clears it. A real
  build should also clear a copied recovery phrase or private key after a short delay, and on
  popup close and on lock.

## Not on this list

Nothing here touches the UI layer — screens, routing, motion and layout are done and are not
expected to change when the mock layer is replaced. If a real data shape cannot fit what a screen
already expects, that is worth a conversation before either side reshapes to fit the other.
