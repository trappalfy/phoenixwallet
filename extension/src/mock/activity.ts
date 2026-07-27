import type { ChainId } from './chains'

// ~14 entries spanning every kind and every status (§7). Timestamps are offsets
// from load rather than fixed dates, so "2h ago" stays true whenever the popup
// is opened and the day grouping never collapses into one stale heading.

export type ActivityKind = 'send' | 'receive' | 'swap' | 'approve' | 'mint' | 'buy'
export type ActivityStatus = 'confirmed' | 'pending' | 'failed'

export type Activity = {
  id: string
  /** Whose history this is. Switching account changes the list (§13). */
  accountId: string
  chainId: ChainId
  kind: ActivityKind
  status: ActivityStatus
  /** Epoch ms. */
  at: number
  /** Signed in the asset's own units; negative leaves the wallet. */
  amount: number
  symbol: string
  /** Second leg of a swap. */
  toAmount?: number
  toSymbol?: string
  counterparty: string
  hash: string
  /** Network fee in the chain's native symbol. */
  fee: number
  feeSymbol: string
  /** Plain-language reason, required on `failed` (§9.7). */
  reason?: string
}

const MIN = 60_000
const HOUR = 60 * MIN
const DAY = 24 * HOUR

const NOW = Date.now()
const ago = (ms: number) => NOW - ms

export const ACTIVITY: Activity[] = [
  {
    id: 'act-1', accountId: 'acc-main', chainId: 'ethereum', kind: 'send', status: 'pending', at: ago(4 * MIN),
    amount: -0.25, symbol: 'ETH', counterparty: '0x9f2b41d7c05e8a3612bd47f09ac5e83b7d1064fa',
    hash: '0x7d1e94ab6c0f52837e4d19bc0a63f582d7e94106bc3f2a850d61e9473fc082a1',
    fee: 0.00184, feeSymbol: 'ETH',
  },
  {
    id: 'act-2', accountId: 'acc-main', chainId: 'ethereum', kind: 'receive', status: 'confirmed', at: ago(2 * HOUR),
    amount: 1240, symbol: 'USDC', counterparty: '0x3c07e18b4a92df650182ba7fc4e30d95728ab6e1',
    hash: '0x2fa6c840d719b3e5027ca61f8d3b904e7215ca6083df41e29b7c5064af3182dd',
    fee: 0, feeSymbol: 'ETH',
  },
  {
    id: 'act-3', accountId: 'acc-main', chainId: 'ethereum', kind: 'swap', status: 'confirmed', at: ago(5 * HOUR),
    amount: -0.5, symbol: 'ETH', toAmount: 1498.05, toSymbol: 'USDC',
    counterparty: 'Uniswap v3', hash: '0x91b47c0e2af5836d105e7b29cf0a4d6318e5027bfa946c31d80f2e57ba6c4093',
    fee: 0.00312, feeSymbol: 'ETH',
  },
  {
    id: 'act-4', accountId: 'acc-trading', chainId: 'base', kind: 'mint', status: 'confirmed', at: ago(9 * HOUR),
    amount: 1, symbol: 'Meridian 88', counterparty: 'Onchain Meridian',
    hash: '0x58ce210b7fa3496d0e81c25b7d93a0f461e2870cb5d914f30a67e2b8c145093f',
    fee: 0.00021, feeSymbol: 'ETH',
  },
  {
    id: 'act-5', accountId: 'acc-main', chainId: 'ethereum', kind: 'approve', status: 'failed', at: ago(11 * HOUR),
    amount: 0, symbol: 'USDT', counterparty: '0x1inch Router',
    hash: '0xb30f7a2c419de5860b17f4d9028ec3516a7be40d92f18c3705ad6e2b84f1c907',
    fee: 0.00097, feeSymbol: 'ETH',
    reason: 'The network fee ran out before the transaction finished. Nothing was spent except the fee.',
  },
  {
    id: 'act-6', accountId: 'acc-main', chainId: 'solana', kind: 'receive', status: 'confirmed', at: ago(DAY + 3 * HOUR),
    amount: 12.5, symbol: 'SOL', counterparty: '9dRt4WmQb2NcVxZp7KhFj3LsAeYu6GtBnMr5XqPvCwDk',
    hash: '4hK2ncWvR8pQmTb3JdYs7LxAeF9ZgHt5UvBn6MrXqPwCkD3fJs8YtRmQb2NvZxLp',
    fee: 0.000005, feeSymbol: 'SOL',
  },
  {
    id: 'act-7', accountId: 'acc-trading', chainId: 'solana', kind: 'swap', status: 'confirmed', at: ago(DAY + 6 * HOUR),
    amount: -400, symbol: 'USDC', toAmount: 2.4438, toSymbol: 'SOL',
    counterparty: 'Jupiter', hash: '7mQpXvR3nBcJd2WsAeF4hGtYu5ZnLpXqRm3TbVcHkJd9wYtRmQb2NvZxLp8Ks4Hf',
    fee: 0.000009, feeSymbol: 'SOL',
  },
  {
    id: 'act-8', accountId: 'acc-trading', chainId: 'base', kind: 'send', status: 'confirmed', at: ago(DAY + 10 * HOUR),
    amount: -320.5, symbol: 'USDC', counterparty: '0x86d4b2701fc9e35a08bd7241e690cf35b0a7d924',
    hash: '0x0e73c1a9d842fb6507e39c15ba024d78f6e91503ac7b2d840e15f6293cb70a4d',
    fee: 0.00008, feeSymbol: 'ETH',
  },
  {
    id: 'act-9', accountId: 'acc-trading', chainId: 'arbitrum', kind: 'approve', status: 'confirmed', at: ago(2 * DAY + 2 * HOUR),
    amount: 0, symbol: 'ARB', counterparty: 'GMX Router',
    hash: '0xc41d7e0b52a6f83916d0e4bc7a25839f0d16e4725bc08a3e9f14d270ba63c85e',
    fee: 0.00014, feeSymbol: 'ETH',
  },
  {
    id: 'act-10', accountId: 'acc-trading', chainId: 'arbitrum', kind: 'send', status: 'failed', at: ago(2 * DAY + 5 * HOUR),
    amount: -180, symbol: 'ARB', counterparty: '0x2f81b0c4e739ad560a1e8b47c2d0596f3e14807b',
    hash: '0x94e2b7c105da3f6820e7b41d9c8503fa7e6120db43c9f85e027a1b6d4c308f92',
    fee: 0.00011, feeSymbol: 'ETH',
    reason: 'The recipient contract rejected the transfer. The tokens stayed in your account.',
  },
  {
    id: 'act-11', accountId: 'acc-cold', chainId: 'polygon', kind: 'receive', status: 'confirmed', at: ago(3 * DAY + HOUR),
    amount: 1500, symbol: 'POL', counterparty: '0x7b1e5d08c46a2f39705bd8241ec0396a5f7b02de',
    hash: '0x3d80f5a2c917be640d7e1a3fb0295c48e71d6a0b39f5c281e740a9b6d21c085f',
    fee: 0, feeSymbol: 'POL',
  },
  {
    id: 'act-12', accountId: 'acc-main', chainId: 'ethereum', kind: 'mint', status: 'confirmed', at: ago(4 * DAY + 7 * HOUR),
    amount: 1, symbol: 'Fragment 0207', counterparty: 'Ember Fragments',
    hash: '0xa71f0d3e825c496b0d18e7a2f5309cb64e027d1a83fb5920c64e1d7b309af285',
    fee: 0.0064, feeSymbol: 'ETH',
  },
  {
    id: 'act-13', accountId: 'acc-trading', chainId: 'optimism', kind: 'swap', status: 'confirmed', at: ago(5 * DAY + 4 * HOUR),
    amount: -240, symbol: 'OP', toAmount: 0.1024, toSymbol: 'ETH',
    counterparty: 'Velodrome', hash: '0x62b8e0d1f74a3c95028de617b3f0a94d7215ce803ab6d192f45e08c73da1926b',
    fee: 0.00006, feeSymbol: 'ETH',
  },
  {
    id: 'act-15', accountId: 'acc-main', chainId: 'ethereum', kind: 'buy', status: 'confirmed', at: ago(3 * DAY + 5 * HOUR),
    amount: 0.35, symbol: 'ETH', counterparty: 'Visa •••• 4242',
    hash: '0x1f6b04ce8a29d735c0e18b47a63fd5920e73c48b1a0f6e29d7b350c84a91e2b7',
    // Bought with a card: the provider covers the network fee out of its own.
    fee: 0, feeSymbol: 'ETH',
  },
  {
    id: 'act-14', accountId: 'acc-cold', chainId: 'bitcoin', kind: 'receive', status: 'confirmed', at: ago(6 * DAY + 8 * HOUR),
    amount: 0.0824, symbol: 'BTC', counterparty: 'bc1q7wjr4x0ns29dyf5tgh3ke6cma8zvqlp2u7rw3d',
    hash: 'd7e2841f0a6c395b2074e18df5c603a91b7e4082d635f1ae920c74b6538ad10f',
    fee: 0.000042, feeSymbol: 'BTC',
  },
]
