import type { CurrencyCode } from '../mock/db'
import { FX } from '../mock/db'

// All formatting lives here (§11) so changing the display currency updates every
// value in the app from one place, and no screen invents its own rounding.

/** USD in, display currency out. Rates come from the mock FX table. */
export function formatFiat(usd: number, currency: CurrencyCode): string {
  const { rate } = FX[currency]
  const value = usd * rate
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Crypto amounts keep significant digits rather than a fixed decimal count: a
 * BONK balance and an ETH balance need very different precision, and padding
 * either to the other's shape makes the column unreadable.
 */
export function formatCrypto(amount: number, symbol?: string): string {
  const abs = Math.abs(amount)
  let digits: number
  if (abs === 0) digits = 2
  else if (abs >= 1000) digits = 2
  else if (abs >= 1) digits = 4
  else if (abs >= 0.001) digits = 6
  else digits = 8

  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: abs >= 1000 ? 2 : 0,
    maximumFractionDigits: digits,
  }).format(amount)
  return symbol ? `${formatted} ${symbol}` : formatted
}

/** Signed, always two decimals, so a column of these does not jitter. */
export function formatPercent(change: number): string {
  return `${change >= 0 ? '+' : '−'}${Math.abs(change).toFixed(2)}%`
}

/**
 * Middle truncation — 0x71c4…9f4a. Users verify the head and tail, so those are
 * what survive. Short strings are returned whole rather than mangled.
 */
export function truncateAddress(address: string, head = 6, tail = 4): string {
  if (address.length <= head + tail + 1) return address
  return `${address.slice(0, head)}…${address.slice(-tail)}`
}

export function truncateHash(hash: string): string {
  return truncateAddress(hash, 10, 8)
}

/**
 * Whether a counterparty is a raw address rather than a name. Testing for a `0x`
 * prefix is not enough — "0x1inch Router" is a protocol name and truncating it
 * to "0x1inc…uter" turns readable text into gibberish. Shape is the only
 * reliable signal, so each format is matched in full.
 */
export function looksLikeAddress(value: string): boolean {
  return (
    /^0x[0-9a-fA-F]{40}$/.test(value) || // EVM
    /^0x[0-9a-fA-F]{64}$/.test(value) || // Sui
    /^bc1[02-9ac-hj-np-z]{25,60}$/.test(value) || // Bitcoin bech32
    /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value) // Solana base58
  )
}

/** Truncates only if the value is actually an address; names pass through whole. */
export function formatCounterparty(value: string): string {
  return looksLikeAddress(value) ? truncateAddress(value) : value
}

const MIN = 60_000
const HOUR = 60 * MIN
const DAY = 24 * HOUR

export function relativeTime(at: number, now = Date.now()): string {
  const delta = now - at
  if (delta < MIN) return 'Just now'
  if (delta < HOUR) return `${Math.floor(delta / MIN)}m ago`
  if (delta < DAY) return `${Math.floor(delta / HOUR)}h ago`
  const days = Math.floor(delta / DAY)
  return days === 1 ? 'Yesterday' : `${days}d ago`
}

/** Heading for a day group in the activity list. */
export function dayLabel(at: number, now = Date.now()): string {
  const start = (ms: number) => {
    const d = new Date(ms)
    d.setHours(0, 0, 0, 0)
    return d.getTime()
  }
  const days = Math.round((start(now) - start(at)) / DAY)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(at)
}

export function formatTimestamp(at: number): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(at)
}
