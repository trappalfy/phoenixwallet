// The eight networks of §7, in this order everywhere they are listed.
//
// Pure data — no React. The glyphs live in components/icons/ChainGlyph.tsx: a
// backend will replace this module with real calls, and it should not have to
// carry UI elements across that seam (§2.6).

export type AddressFormat = 'evm' | 'solana' | 'bitcoin' | 'sui'

export type ChainId =
  | 'ethereum'
  | 'solana'
  | 'bitcoin'
  | 'base'
  | 'arbitrum'
  | 'optimism'
  | 'polygon'
  | 'sui'
  | 'sepolia'
  | 'base-sepolia'

export type Chain = {
  id: ChainId
  name: string
  symbol: string
  /** Used only for the 20px chain chip, so a network's colour never leaks into the palette. */
  tint: string
  format: AddressFormat
  explorer: string
  testnet?: true
}

export const CHAINS: readonly Chain[] = [
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', tint: '#8A92B2', format: 'evm', explorer: 'Etherscan' },
  { id: 'solana', name: 'Solana', symbol: 'SOL', tint: '#14F195', format: 'solana', explorer: 'Solscan' },
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', tint: '#F7931A', format: 'bitcoin', explorer: 'Mempool' },
  { id: 'base', name: 'Base', symbol: 'ETH', tint: '#0052FF', format: 'evm', explorer: 'Basescan' },
  { id: 'arbitrum', name: 'Arbitrum', symbol: 'ETH', tint: '#28A0F0', format: 'evm', explorer: 'Arbiscan' },
  { id: 'optimism', name: 'Optimism', symbol: 'ETH', tint: '#FF0420', format: 'evm', explorer: 'Optimistic Etherscan' },
  { id: 'polygon', name: 'Polygon', symbol: 'POL', tint: '#8247E5', format: 'evm', explorer: 'Polygonscan' },
  { id: 'sui', name: 'Sui', symbol: 'SUI', tint: '#4DA2FF', format: 'sui', explorer: 'Suiscan' },
  // Revealed by the Testnets toggle in the network sheet (§9.3).
  { id: 'sepolia', name: 'Sepolia', symbol: 'ETH', tint: '#8A92B2', format: 'evm', explorer: 'Etherscan', testnet: true },
  { id: 'base-sepolia', name: 'Base Sepolia', symbol: 'ETH', tint: '#0052FF', format: 'evm', explorer: 'Basescan', testnet: true },
] as const

export const MAINNETS = CHAINS.filter((c) => !c.testnet)
export const TESTNETS = CHAINS.filter((c) => c.testnet)

const BY_ID = new Map(CHAINS.map((c) => [c.id, c]))

export function getChain(id: ChainId): Chain {
  const chain = BY_ID.get(id)
  if (!chain) throw new Error(`unknown chain: ${id}`)
  return chain
}
