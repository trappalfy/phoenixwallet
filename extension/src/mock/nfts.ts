import type { ChainId } from './chains'

// Six items across Ethereum, Base and Solana (§7). Artwork is generated in the
// component from `art` — layered gradients and geometry, no external images and
// no placeholder service.

export type ArtPattern = 'orbit' | 'strata' | 'prism' | 'bloom' | 'grid' | 'arc'

export type NftArt = {
  pattern: ArtPattern
  /** Three stops, dark to light, used by the card's layered gradients. */
  hues: readonly [string, string, string]
  /** Rotation in degrees, so two cards sharing a pattern do not look identical. */
  angle: number
}

export type Nft = {
  id: string
  /** Owner. A collectible belongs to an account, not to a network (§13). */
  accountId: string
  chainId: ChainId
  collection: string
  name: string
  tokenId: string
  traits: readonly { label: string; value: string }[]
  art: NftArt
}

export const NFTS: readonly Nft[] = [
  {
    id: 'nft-1',
    accountId: 'acc-main',
    chainId: 'ethereum',
    collection: 'Ember Fragments',
    name: 'Fragment 0184',
    tokenId: '184',
    traits: [
      { label: 'Facet', value: 'Cleaved' },
      { label: 'Heat', value: 'High' },
      { label: 'Ground', value: 'Basalt' },
      { label: 'Edition', value: '184 / 512' },
    ],
    // Deliberately off the brand ramp. Artwork tinted with the exact --grad-accent
    // stops reads as a UI surface — the card looked like the primary button.
    art: { pattern: 'prism', hues: ['#2A0618', '#B4145A', '#FF9E5E'], angle: 135 },
  },
  {
    id: 'nft-2',
    accountId: 'acc-main',
    chainId: 'ethereum',
    collection: 'Ember Fragments',
    name: 'Fragment 0207',
    tokenId: '207',
    traits: [
      { label: 'Facet', value: 'Whole' },
      { label: 'Heat', value: 'Low' },
      { label: 'Ground', value: 'Ash' },
      { label: 'Edition', value: '207 / 512' },
    ],
    art: { pattern: 'strata', hues: ['#16101F', '#5B2E86', '#D98BD0'], angle: 12 },
  },
  {
    id: 'nft-3',
    accountId: 'acc-main',
    chainId: 'base',
    collection: 'Onchain Meridian',
    name: 'Meridian 41',
    tokenId: '41',
    traits: [
      { label: 'Arc', value: 'Northern' },
      { label: 'Density', value: '0.62' },
      { label: 'Palette', value: 'Cobalt' },
    ],
    art: { pattern: 'arc', hues: ['#04102E', '#1B4FD8', '#7BC4FF'], angle: 200 },
  },
  {
    id: 'nft-4',
    // Minted by Trading in act-4 — ownership and history have to agree.
    accountId: 'acc-trading',
    chainId: 'base',
    collection: 'Onchain Meridian',
    name: 'Meridian 88',
    tokenId: '88',
    traits: [
      { label: 'Arc', value: 'Equatorial' },
      { label: 'Density', value: '0.31' },
      { label: 'Palette', value: 'Ember' },
    ],
    art: { pattern: 'orbit', hues: ['#170608', '#C43A08', '#FFB040'], angle: 320 },
  },
  {
    id: 'nft-5',
    accountId: 'acc-trading',
    chainId: 'solana',
    collection: 'Slow Static',
    name: 'Static #012',
    tokenId: '12',
    traits: [
      { label: 'Signal', value: 'Weak' },
      { label: 'Bands', value: '7' },
      { label: 'Grain', value: 'Coarse' },
    ],
    art: { pattern: 'grid', hues: ['#0A1410', '#136B4A', '#3ED598'], angle: 45 },
  },
  {
    id: 'nft-6',
    accountId: 'acc-main',
    chainId: 'solana',
    collection: 'Slow Static',
    name: 'Static #029',
    tokenId: '29',
    traits: [
      { label: 'Signal', value: 'Strong' },
      { label: 'Bands', value: '3' },
      { label: 'Grain', value: 'Fine' },
    ],
    art: { pattern: 'bloom', hues: ['#12060F', '#8B1D6A', '#FF6FD8'], angle: 90 },
  },
] as const
