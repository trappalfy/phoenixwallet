import type { AddressFormat, ChainId } from './chains'
import { getChain } from './chains'

/**
 * NOT A VALID WALLET. The twelve words belonging to the sample wallet below.
 * They derive no keys, control no address and hold no funds. Nothing in this
 * codebase implements BIP-39 — see §2.
 *
 * No screen reads this any more: the import flow that used to check typed words
 * against it was removed, because a recovery-phrase field is the exact shape of
 * a wallet-phishing extension and there is no keyring here for a real phrase to
 * unlock. Kept as the sample wallet's phrase for the fixtures and for whoever
 * implements the real keyring.
 */
export const RECOVERY_PHRASE = [
  'signal', 'harbor', 'velvet', 'oxide',
  'candle', 'ripple', 'quartz', 'meadow',
  'lantern', 'fabric', 'tundra', 'ember',
] as const

/**
 * Words a created wallet's phrase is drawn from.
 *
 * Deliberately **not** the BIP-39 list. Two reasons: shipping that list is the
 * first half of implementing BIP-39, which §2.1 forbids outright; and a phrase
 * built from it would validate in a real wallet, which is exactly the confusion
 * to avoid. Most of these words are outside BIP-39, so a phrase from here cannot
 * be imported anywhere — it is display text, and it stays display text.
 */
const WORD_POOL = [
  'anchor', 'amber', 'antler', 'archer', 'aspen', 'basalt', 'beacon', 'bellows',
  'birch', 'bramble', 'brindle', 'cactus', 'candle', 'canyon', 'cedar', 'cinder',
  'cobalt', 'compass', 'copper', 'crater', 'crescent', 'dawn', 'delta', 'driftwood',
  'dune', 'ember', 'fabric', 'fathom', 'fern', 'flint', 'forge', 'fossil',
  'gable', 'garnet', 'glacier', 'granite', 'grotto', 'harbor', 'harvest', 'hazel',
  'heather', 'hollow', 'indigo', 'ivory', 'juniper', 'kestrel', 'lantern', 'lattice',
  'lichen', 'lumen', 'marble', 'mariner', 'meadow', 'meridian', 'mica', 'mirth',
  'mistral', 'monsoon', 'mosaic', 'nectar', 'nimbus', 'obsidian', 'onyx', 'orchard',
  'oxide', 'pebble', 'pewter', 'pine', 'plateau', 'pollen', 'prairie', 'quarry',
  'quartz', 'quiver', 'rafter', 'reef', 'ripple', 'rivet', 'rosemary', 'rowan',
  'saffron', 'sandstone', 'sapling', 'sextant', 'shale', 'signal', 'silo', 'slate',
  'solstice', 'sparrow', 'spruce', 'stipple', 'sumac', 'summit', 'tallow', 'tamarisk',
  'thicket', 'thistle', 'tundra', 'umber', 'vellum', 'velvet', 'verdant', 'vessel',
  'willow', 'windlass', 'yarrow', 'zephyr',
] as const

/**
 * Twelve distinct words for a wallet created in this session.
 *
 * NOT KEY DERIVATION and not BIP-39: no entropy is encoded, no checksum is
 * computed and nothing is derived from the result. It exists so that two people
 * creating a wallet do not write down the same twelve words.
 *
 * TODO(backend): the keyring generates the real phrase; delete this with it.
 */
export function newPhrase(): readonly string[] {
  const pool = [...WORD_POOL]
  const out: string[] = []
  while (out.length < 12) {
    out.push(...pool.splice(Math.floor(Math.random() * pool.length), 1))
  }
  return out
}

/** Three words from the pool that are not in `phrase` — decoys for the confirm step. */
export function decoysFor(phrase: readonly string[], count = 3): string[] {
  const pool = WORD_POOL.filter((w) => !phrase.includes(w))
  const out: string[] = []
  while (out.length < count && pool.length) {
    out.push(...pool.splice(Math.floor(Math.random() * pool.length), 1))
  }
  return out
}

/** Positions blanked on the confirm step (§9.1.5), 0-indexed. */
export const CONFIRM_POSITIONS = [2, 6, 10] as const

export type Account = {
  id: string
  name: string
  /** Collectible chosen on NftDetail (§9.7). Undefined means the generated identicon. */
  avatarNftId?: string
  /**
   * One address per address *format*, not per chain: a real EVM account has the
   * same address on Ethereum, Base, Arbitrum, Optimism and Polygon, and showing
   * five different ones would be a lie the audience would spot immediately.
   */
  addresses: Record<AddressFormat, string>
}

/**
 * The funded sample wallet. **No screen reaches these** — the extension always
 * starts on `FRESH_ACCOUNTS` below. Kept because the whole mock layer (tokens,
 * activity, NFTs, connected sites) is keyed off these ids and `check:mock`
 * verifies them, so they are the fixtures a real backend gets tested against.
 */
export const ACCOUNTS: readonly Account[] = [
  {
    id: 'acc-main',
    name: 'Main',
    addresses: {
      evm: '0x71c4a1f2bd9e5a7c3f08d6b24e91ac5d3f7b09f4',
      solana: '7xKpQr9mNvBcJd2WsAeF4hGtYu5ZnLpXqRm3TbVcHkJd',
      bitcoin: 'bc1qm3ka7vd0f9x2sq8jn5t4hcegu6zrw7ly3pkm2v',
      sui: '0xb7e1049c3af28d60b5e791c4a30df682be5107ac4d9f36e2b80a75c1e493f2d6',
    },
  },
  {
    id: 'acc-trading',
    name: 'Trading',
    addresses: {
      evm: '0x3a9f27c81e4d05b6a7f39c2e84d17b605fa2c9e3',
      solana: '9dRt4WmQb2NcVxZp7KhFj3LsAeYu6GtBnMr5XqPvCwDk',
      bitcoin: 'bc1q7wjr4x0ns29dyf5tgh3ke6cma8zvqlp2u7rw3d',
      sui: '0x3f9a72c0e5d18b46f2a907c3e58b1d6a24f09e73c85b12d6a49e307fb258c1d4',
    },
  },
  {
    id: 'acc-cold',
    name: 'Cold storage',
    addresses: {
      evm: '0xd42e08b7c95a13f6e07b249d8c6f31a05e7b4d28',
      solana: '4mHqZv8NpXcRt6WdBkJf2LsGyAe9UnQb3TrMxPvCzYhL',
      bitcoin: 'bc1q9zv6qh2ty5w8kn3fjr0dsxc4gme7lau2p9v5t3',
      sui: '0xe5c308a7b142f96d0e837ab5c214f960d8e37b25a1f4907c6e38b52d0af76c93',
    },
  },
] as const

const HEX = '0123456789abcdef'
const BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
const BECH32 = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l'

const pick = (n: number, alphabet: string) =>
  Array.from({ length: n }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('')

/**
 * NOT KEY DERIVATION. Strings shaped like addresses so the UI truncates,
 * validates and renders them exactly as it will against real ones. Nothing is
 * derived from the recovery phrase and no key material exists anywhere in this
 * codebase (§2.1).
 *
 * TODO(backend): the keyring returns these; delete this function with it.
 */
export function newAddresses(): Account['addresses'] {
  return {
    evm: `0x${pick(40, HEX)}`,
    solana: pick(44, BASE58),
    bitcoin: `bc1q${pick(38, BECH32)}`,
    sui: `0x${pick(64, HEX)}`,
  }
}

/**
 * What a wallet looks like the moment it is created: one account, named the way
 * every wallet names the first one, holding nothing anywhere.
 *
 * Declared *after* the generator above on purpose — it calls it at module load,
 * and `const pick` is not hoisted the way a function declaration is.
 *
 * This is the only wallet the extension ever shows. The funded `ACCOUNTS` above
 * are fixtures with no route to them: showing an installed user someone else's
 * $15,000 and swap history is the one lie a wallet cannot tell, and a store
 * reviewer reads invented balances as exactly that.
 */
export const FRESH_ACCOUNTS: readonly Account[] = [
  {
    id: 'acc-fresh',
    name: 'Account 1',
    // Generated per session rather than written down here: two people creating a
    // wallet should not end up looking at the same address, and neither should
    // the same person twice.
    addresses: newAddresses(),
  },
]

export function addressFor(account: Account, chainId: ChainId): string {
  return account.addresses[getChain(chainId).format]
}

export type ConnectedSite = {
  id: string
  /** Host only — a bare host is not a URL, and nothing here is ever fetched (§2.1). */
  host: string
  connectedAt: string
  accountId: string
  /** What the site was granted, in the user's words rather than a scope name. */
  permission: string
}

/** Two mock entries for the Connected sites screen (§9.7). */
export const CONNECTED_SITES: readonly ConnectedSite[] = [
  {
    id: 'site-1',
    host: 'app.uniswap.org',
    connectedAt: 'Connected 3 days ago',
    accountId: 'acc-main',
    permission: 'See your address and ask you to sign',
  },
  {
    id: 'site-2',
    host: 'jup.ag',
    connectedAt: 'Connected 2 weeks ago',
    accountId: 'acc-trading',
    permission: 'See your address and ask you to sign',
  },
]

export type PaymentMethod = {
  id: string
  label: string
  /** Card art or wallet mark, drawn in the component — never a remote image (§2.4). */
  kind: 'card' | 'wallet' | 'bank'
  /** Provider's cut, as a percentage of the order. */
  feePercent: number
  eta: string
  /** Orders above this need a different method; banks and cards differ here. */
  limit: number
}

/**
 * Ways to pay on the Buy screen (§9.3's fourth action).
 * TODO(backend): a payment provider returns the user's saved methods, their
 * real fees and their real limits.
 */
export const PAYMENT_METHODS: readonly PaymentMethod[] = [
  { id: 'pm-visa', label: 'Visa •••• 4242', kind: 'card', feePercent: 1.9, eta: 'Instant', limit: 2000 },
  { id: 'pm-apple', label: 'Apple Pay', kind: 'wallet', feePercent: 2.4, eta: 'Instant', limit: 1500 },
  { id: 'pm-sepa', label: 'Bank transfer · SEPA', kind: 'bank', feePercent: 0.5, eta: '1–2 business days', limit: 25000 },
]

/** Smallest order a provider will take, in USD. */
export const MIN_ORDER_USD = 20

/** Auto-lock choices for Settings → Security. `0` is Never. */
export const AUTO_LOCK_MINUTES = [1, 5, 15, 30, 0] as const
export type AutoLockMinutes = (typeof AUTO_LOCK_MINUTES)[number]

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'PLN'

/**
 * Display-currency conversion. Fixed rates, because there is no price feed —
 * TODO(backend): replace with live FX rates keyed off the same codes.
 */
export const FX: Record<CurrencyCode, { rate: number; symbol: string }> = {
  USD: { rate: 1, symbol: '$' },
  EUR: { rate: 0.92, symbol: '€' },
  GBP: { rate: 0.79, symbol: '£' },
  PLN: { rate: 4.02, symbol: 'zł' },
}
