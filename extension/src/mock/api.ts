import type { Account } from './db'
import { ACCOUNTS, addressFor, newAddresses } from './db'
import type { ChainId } from './chains'
import { getChain } from './chains'
import type { Token } from './tokens'
import { TOKENS_BY_CHAIN, tokensFor, usdValue } from './tokens'
import type { Nft } from './nfts'
import { NFTS } from './nfts'
import type { Activity, ActivityStatus } from './activity'
import { ACTIVITY } from './activity'

// Plain synchronous functions (§7). No artificial latency and no simulated
// failures — this is a clickable prototype and fake spinners waste a reviewer's
// time. sendTransaction and swap mutate the in-memory store so balances and the
// activity list update, then reset when the popup reopens.
//
// Everything is keyed by (account, chain), not by chain alone: §13 requires
// switching account to move the balance, tokens, NFTs and activity together.

/**
 * Mutable working copy, one token list per (account, chain), built on first
 * read. Module scope, so reopening the popup restores the seed.
 */
const tokens = new Map<string, Token[]>()

function listFor(accountId: string, chainId: ChainId): Token[] {
  const key = `${accountId}:${chainId}`
  let list = tokens.get(key)
  if (!list) {
    list = tokensFor(accountId, chainId)
    tokens.set(key, list)
  }
  return list
}

const activity: Activity[] = [...ACTIVITY]

/** Mutable too: a collectible that has been sent is no longer owned. */
const nfts: Nft[] = [...NFTS]

/** TODO(backend): list accounts derived from the unlocked keyring. */
export const getAccounts = (): readonly Account[] => ACCOUNTS

/** TODO(backend): resolve the account's address for this chain from the keyring. */
export const getAddress = (account: Account, chainId: ChainId): string => addressFor(account, chainId)

/** TODO(backend): token balances + prices for (account, chain) from an indexer and a price feed. */
export const getTokens = (accountId: string, chainId: ChainId): readonly Token[] =>
  listFor(accountId, chainId)

/** TODO(backend): NFTs owned by (account, chain) from an indexer. */
export const getNfts = (accountId: string, chainId: ChainId): readonly Nft[] =>
  nfts.filter((n) => n.accountId === accountId && n.chainId === chainId)

export const getNft = (id: string): Nft | undefined => nfts.find((n) => n.id === id)

/** TODO(backend): paginated transaction history for (account, chain). */
export const getActivity = (accountId: string, chainId: ChainId): readonly Activity[] =>
  activity.filter((a) => a.accountId === accountId && a.chainId === chainId).sort((a, b) => b.at - a.at)

export const getToken = (accountId: string, chainId: ChainId, symbol: string): Token | undefined =>
  listFor(accountId, chainId).find((t) => t.symbol === symbol)

/**
 * Portfolio total and 24h change, computed from token data so the numbers stay
 * consistent when someone edits the seed (§7).
 * TODO(backend): the same shape, summed server-side or from the price feed.
 */
export function getTotals(accountId: string, chainId: ChainId): { value: number; change24h: number } {
  const list = listFor(accountId, chainId)
  const value = list.reduce((sum, t) => sum + usdValue(t), 0)
  if (value === 0) return { value: 0, change24h: 0 }
  // Portfolio change is the value-weighted mean of each holding's change.
  const weighted = list.reduce((sum, t) => sum + usdValue(t) * t.change24h, 0)
  return { value, change24h: weighted / value }
}

export type SendDraft = {
  accountId: string
  chainId: ChainId
  symbol: string
  amount: number
  to: string
  fee: number
  /** Set for a collectible transfer; `symbol` then carries its name. */
  nftId?: string
}

/** TODO(backend): build, sign and broadcast the transfer; return the real hash. */
export function sendTransaction(draft: SendDraft): Activity {
  if (draft.nftId) {
    // A sent collectible leaves the wallet. Leaving it in the grid while its
    // transfer sits at the top of Activity is the kind of contradiction §13's
    // "balances update" line exists to prevent.
    const i = nfts.findIndex((n) => n.id === draft.nftId)
    if (i >= 0) nfts.splice(i, 1)
  } else {
    const token = getToken(draft.accountId, draft.chainId, draft.symbol)
    if (token) token.balance = Math.max(0, token.balance - draft.amount)
  }

  const entry: Activity = {
    id: `act-${Date.now()}`,
    accountId: draft.accountId,
    chainId: draft.chainId,
    kind: 'send',
    status: 'pending',
    at: Date.now(),
    amount: -draft.amount,
    symbol: draft.symbol,
    counterparty: draft.to,
    hash: mockHash(draft.chainId),
    fee: draft.fee,
    feeSymbol: nativeSymbol(draft.chainId),
  }
  activity.unshift(entry)
  return entry
}

export type SwapDraft = {
  accountId: string
  chainId: ChainId
  fromSymbol: string
  toSymbol: string
  fromAmount: number
  toAmount: number
  fee: number
}

/** TODO(backend): route, quote and execute the swap; return the real hash. */
export function swap(draft: SwapDraft): Activity {
  const from = getToken(draft.accountId, draft.chainId, draft.fromSymbol)
  const to = getToken(draft.accountId, draft.chainId, draft.toSymbol)
  if (from) from.balance = Math.max(0, from.balance - draft.fromAmount)
  if (to) to.balance += draft.toAmount

  const entry: Activity = {
    id: `act-${Date.now()}`,
    accountId: draft.accountId,
    chainId: draft.chainId,
    kind: 'swap',
    status: 'pending',
    at: Date.now(),
    amount: -draft.fromAmount,
    symbol: draft.fromSymbol,
    toAmount: draft.toAmount,
    toSymbol: draft.toSymbol,
    counterparty: 'Perigee Router',
    hash: mockHash(draft.chainId),
    fee: draft.fee,
    feeSymbol: nativeSymbol(draft.chainId),
  }
  activity.unshift(entry)
  return entry
}

/**
 * A new account for the Add account screen (§9.7).
 *
 * NOT KEY DERIVATION. Nothing is derived from the recovery phrase and no key
 * material exists in this codebase (§2.1) — these are strings shaped like
 * addresses so the UI truncates and validates them the way it will in the real
 * build. The account starts empty on every network, which is what a freshly
 * derived account actually looks like.
 *
 * TODO(backend): derive the next account from the unlocked keyring and return
 * its real addresses.
 */
export function createAccount(name: string): Account {
  return { id: `acc-${Date.now()}`, name, addresses: newAddresses() }
}

export type BuyDraft = {
  accountId: string
  chainId: ChainId
  symbol: string
  /** How much of the asset the order delivers. */
  amount: number
  /** What the buyer pays, in USD, provider fee included. */
  spentUsd: number
  method: string
}

/**
 * Everything the chain offers, carrying this account's balance where it holds
 * any. You buy assets you do not own yet, so the Buy screen cannot be limited to
 * what is already in the wallet the way Send and Swap are.
 *
 * TODO(backend): the payment provider's supported-asset list for this chain.
 */
export function getBuyable(accountId: string, chainId: ChainId): readonly Token[] {
  const held = listFor(accountId, chainId)
  return TOKENS_BY_CHAIN[chainId].map(
    (seed) => held.find((t) => t.symbol === seed.symbol) ?? { ...seed, balance: 0 },
  )
}

/** TODO(backend): create the order with the payment provider and settle on fill. */
export function buyTokens(draft: BuyDraft): Activity {
  const list = listFor(draft.accountId, draft.chainId)
  let token = list.find((t) => t.symbol === draft.symbol)
  if (!token) {
    // Buying something the account has never held adds it to the wallet, which
    // is the whole point of the screen.
    const seed = TOKENS_BY_CHAIN[draft.chainId].find((t) => t.symbol === draft.symbol)
    if (seed) {
      token = { ...seed, balance: 0 }
      list.push(token)
    }
  }
  if (token) token.balance += draft.amount

  const entry: Activity = {
    id: `act-${Date.now()}`,
    accountId: draft.accountId,
    chainId: draft.chainId,
    kind: 'buy',
    status: 'pending',
    at: Date.now(),
    amount: draft.amount,
    symbol: draft.symbol,
    counterparty: draft.method,
    hash: mockHash(draft.chainId),
    // The provider delivers the asset and pays the network cost out of its cut.
    fee: 0,
    feeSymbol: nativeSymbol(draft.chainId),
  }
  activity.unshift(entry)
  return entry
}

/** Flips a pending entry once the TxStatus screen has shown its pending state. */
export function settleActivity(id: string, status: ActivityStatus): void {
  const entry = activity.find((a) => a.id === id)
  if (entry) entry.status = status
}

/**
 * Fees are paid in the chain's native asset, so this reads the chain rather than
 * the account's token list — an account that holds none of it still pays in it.
 */
function nativeSymbol(chainId: ChainId): string {
  return getChain(chainId).symbol
}

const HEX = '0123456789abcdef'
const BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

/** Display filler in a given alphabet. Not random in any cryptographic sense. */
function pick(n: number, alphabet: string): string {
  return Array.from({ length: n }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('')
}

/**
 * Shaped like the chain's real hashes so the UI truncates them correctly. This
 * is display filler, not a digest — nothing is hashed and nothing depends on it.
 */
function mockHash(chainId: ChainId): string {
  if (chainId === 'solana') return pick(64, BASE58)
  if (chainId === 'bitcoin') return pick(64, HEX)
  return `0x${pick(64, HEX)}`
}
