import type { ChainId } from './chains'

// 4–7 assets per network (§7): a mix of 24h gains and losses, and one
// zero-balance holding on Ethereum so the hide-small-balances toggle has
// something to act on.
//
// Bitcoin carries BRC-20s rather than invented assets — a Bitcoin account with
// four made-up tokens would read as wrong to anyone who holds any.

/** Shape family for the token glyph. Drawn in components/icons/TokenGlyph.tsx. */
export type TokenGlyph =
  | 'diamond'
  | 'stable'
  | 'btc'
  | 'bars'
  | 'cube'
  | 'ring'
  | 'wave'
  | 'bolt'
  | 'hex'
  | 'drop'

export type Token = {
  id: string
  chainId: ChainId
  name: string
  symbol: string
  balance: number
  /** USD per unit. Totals are computed from this, never hardcoded (§7). */
  price: number
  /** Percent, signed. */
  change24h: number
  glyph: TokenGlyph
  tint: string
}

type Seed = Omit<Token, 'id' | 'chainId'>

const SEEDS: Record<ChainId, readonly Seed[]> = {
  ethereum: [
    { name: 'Ethereum', symbol: 'ETH', balance: 2.4051, price: 2996.4, change24h: 1.9, glyph: 'diamond', tint: '#8A92B2' },
    { name: 'USD Coin', symbol: 'USDC', balance: 3120, price: 1, change24h: 0.01, glyph: 'stable', tint: '#2775CA' },
    { name: 'Tether', symbol: 'USDT', balance: 848.2, price: 0.999, change24h: -0.02, glyph: 'stable', tint: '#26A17B' },
    { name: 'Wrapped Bitcoin', symbol: 'WBTC', balance: 0.0412, price: 68240, change24h: -1.08, glyph: 'btc', tint: '#F09242' },
    { name: 'Chainlink', symbol: 'LINK', balance: 96.4, price: 14.82, change24h: 3.41, glyph: 'hex', tint: '#375BD2' },
    // Zero balance on purpose — the hide-small-balances toggle needs a target.
    { name: 'Pepe', symbol: 'PEPE', balance: 0, price: 0.0000098, change24h: -4.2, glyph: 'drop', tint: '#3D8B3D' },
  ],
  solana: [
    { name: 'Solana', symbol: 'SOL', balance: 41.208, price: 163.7, change24h: 4.06, glyph: 'bars', tint: '#14F195' },
    { name: 'USD Coin', symbol: 'USDC', balance: 1240.5, price: 1, change24h: 0, glyph: 'stable', tint: '#2775CA' },
    { name: 'Jupiter', symbol: 'JUP', balance: 812.7, price: 0.842, change24h: -2.74, glyph: 'ring', tint: '#C7F284' },
    { name: 'Bonk', symbol: 'BONK', balance: 12400000, price: 0.0000212, change24h: 6.18, glyph: 'drop', tint: '#F2A900' },
    { name: 'Jito Staked SOL', symbol: 'JitoSOL', balance: 6.402, price: 187.4, change24h: 3.92, glyph: 'wave', tint: '#7BE2C8' },
  ],
  bitcoin: [
    { name: 'Bitcoin', symbol: 'BTC', balance: 0.2076, price: 68240, change24h: -1.08, glyph: 'btc', tint: '#F7931A' },
    { name: 'Ordinals', symbol: 'ORDI', balance: 14.2, price: 32.6, change24h: 2.15, glyph: 'ring', tint: '#E4761B' },
    { name: 'Sats', symbol: 'SATS', balance: 42800000, price: 0.00000041, change24h: -3.6, glyph: 'bars', tint: '#C99A2E' },
    { name: 'Rats', symbol: 'RATS', balance: 1860000, price: 0.00012, change24h: 1.14, glyph: 'drop', tint: '#8C7B6B' },
  ],
  base: [
    { name: 'Ethereum', symbol: 'ETH', balance: 1.0402, price: 2996.4, change24h: 1.9, glyph: 'diamond', tint: '#8A92B2' },
    { name: 'USD Coin', symbol: 'USDC', balance: 2410.88, price: 1, change24h: 0.01, glyph: 'stable', tint: '#2775CA' },
    { name: 'Coinbase Wrapped BTC', symbol: 'cbBTC', balance: 0.018, price: 68180, change24h: -1.12, glyph: 'btc', tint: '#0052FF' },
    { name: 'Aerodrome', symbol: 'AERO', balance: 1420.6, price: 0.914, change24h: 5.27, glyph: 'wave', tint: '#3AC0F2' },
    { name: 'Degen', symbol: 'DEGEN', balance: 24800, price: 0.0072, change24h: -6.4, glyph: 'drop', tint: '#A36EFD' },
  ],
  arbitrum: [
    { name: 'Ethereum', symbol: 'ETH', balance: 0.7318, price: 2996.4, change24h: 1.9, glyph: 'diamond', tint: '#8A92B2' },
    { name: 'USD Coin', symbol: 'USDC', balance: 640.2, price: 1, change24h: 0, glyph: 'stable', tint: '#2775CA' },
    { name: 'Arbitrum', symbol: 'ARB', balance: 1840, price: 0.612, change24h: -2.18, glyph: 'cube', tint: '#28A0F0' },
    { name: 'GMX', symbol: 'GMX', balance: 22.4, price: 28.9, change24h: 1.02, glyph: 'hex', tint: '#4E8AF4' },
    { name: 'Pendle', symbol: 'PENDLE', balance: 184.6, price: 4.18, change24h: 7.84, glyph: 'ring', tint: '#25C6DA' },
  ],
  optimism: [
    { name: 'Ethereum', symbol: 'ETH', balance: 0.4126, price: 2996.4, change24h: 1.9, glyph: 'diamond', tint: '#8A92B2' },
    { name: 'USD Coin', symbol: 'USDC', balance: 318.4, price: 1, change24h: 0.01, glyph: 'stable', tint: '#2775CA' },
    { name: 'Optimism', symbol: 'OP', balance: 620.8, price: 1.28, change24h: -1.64, glyph: 'ring', tint: '#FF0420' },
    { name: 'Velodrome', symbol: 'VELO', balance: 8400, price: 0.0612, change24h: 2.98, glyph: 'wave', tint: '#F24C4C' },
  ],
  polygon: [
    { name: 'Polygon', symbol: 'POL', balance: 3240.5, price: 0.386, change24h: -0.92, glyph: 'hex', tint: '#8247E5' },
    { name: 'USD Coin', symbol: 'USDC', balance: 512.7, price: 1, change24h: 0, glyph: 'stable', tint: '#2775CA' },
    { name: 'Wrapped Ether', symbol: 'WETH', balance: 0.284, price: 2996.4, change24h: 1.88, glyph: 'diamond', tint: '#8A92B2' },
    { name: 'Aave', symbol: 'AAVE', balance: 4.62, price: 128.4, change24h: 2.41, glyph: 'bolt', tint: '#B6509E' },
    { name: 'Quickswap', symbol: 'QUICK', balance: 940, price: 0.0418, change24h: -5.1, glyph: 'bolt', tint: '#418AC9' },
  ],
  sui: [
    { name: 'Sui', symbol: 'SUI', balance: 1840.2, price: 1.94, change24h: 3.16, glyph: 'drop', tint: '#4DA2FF' },
    { name: 'USD Coin', symbol: 'USDC', balance: 284.6, price: 1, change24h: 0, glyph: 'stable', tint: '#2775CA' },
    { name: 'Cetus', symbol: 'CETUS', balance: 6120, price: 0.078, change24h: -2.88, glyph: 'wave', tint: '#28C0E8' },
    { name: 'DeepBook', symbol: 'DEEP', balance: 18400, price: 0.0214, change24h: 4.62, glyph: 'cube', tint: '#3B7BD8' },
  ],
  sepolia: [
    { name: 'Sepolia Ether', symbol: 'ETH', balance: 12.5, price: 0, change24h: 0, glyph: 'diamond', tint: '#8A92B2' },
    { name: 'Test USD Coin', symbol: 'USDC', balance: 10000, price: 0, change24h: 0, glyph: 'stable', tint: '#2775CA' },
  ],
  'base-sepolia': [
    { name: 'Sepolia Ether', symbol: 'ETH', balance: 4.2, price: 0, change24h: 0, glyph: 'diamond', tint: '#8A92B2' },
    { name: 'Test USD Coin', symbol: 'USDC', balance: 5000, price: 0, change24h: 0, glyph: 'stable', tint: '#2775CA' },
  ],
}

export const TOKENS_BY_CHAIN: Record<ChainId, Token[]> = Object.fromEntries(
  Object.entries(SEEDS).map(([chainId, seeds]) => [
    chainId,
    seeds.map((s) => ({ ...s, chainId: chainId as ChainId, id: `${chainId}:${s.symbol}` })),
  ]),
) as Record<ChainId, Token[]>

export const usdValue = (t: Token) => t.balance * t.price

/**
 * Holdings per account. §13 requires switching account to move the balance,
 * token list, NFTs and activity together, so a balance cannot belong to the
 * chain alone — the seed above is what the *first* account holds.
 *
 * Each account scales that seed by its own profile, applied by position and
 * cycling if the chain lists more assets than the profile has entries. A zero
 * means the account never held that asset, so it drops off the list entirely
 * rather than sitting there at nothing.
 *
 * TODO(backend): delete this. Real balances come per (account, chain) from an
 * indexer, and `tokensFor` becomes that call.
 */
const ACCOUNT_PROFILE: Record<string, readonly number[]> = {
  // Main holds the seed as written — it is the account every screenshot shows.
  'acc-main': [1],
  // Trading: stable-heavy, out of the blue chips it has sold, deep in the rest.
  'acc-trading': [0.38, 1.72, 0.9, 0, 2.4, 1.15],
  // Cold storage: the native asset and a little else. Nothing speculative.
  'acc-cold': [3.6, 0.08, 0, 5.2, 0, 0],
}

/**
 * Keeps a generated balance as plausible as the hand-written ones: about six
 * significant digits, never trailing float noise like 0.9139380000000001.
 */
function tidy(n: number): number {
  if (n === 0) return 0
  const magnitude = Math.floor(Math.log10(Math.abs(n)))
  return Number(n.toFixed(Math.min(Math.max(0, 5 - magnitude), 8)))
}

export function tokensFor(accountId: string, chainId: ChainId): Token[] {
  const profile = ACCOUNT_PROFILE[accountId]

  // Any account not in the table — the one a new wallet starts with, or one
  // added during the session — holds only the network's native asset, at zero.
  // That is what a real new account looks like: not an empty screen, but ETH
  // 0.0000 waiting for a first deposit. Handing it someone else's portfolio
  // would be the lie; hiding the native asset would be wrong the other way.
  if (!profile) return [{ ...TOKENS_BY_CHAIN[chainId][0], balance: 0 }]

  return TOKENS_BY_CHAIN[chainId].flatMap((token, i) => {
    const weight = profile[i % profile.length]
    return weight === 0 ? [] : [{ ...token, balance: tidy(token.balance * weight) }]
  })
}
