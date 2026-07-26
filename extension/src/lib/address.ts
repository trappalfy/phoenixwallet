import type { AddressFormat } from '../mock/chains'

// Shape validation only. There is no checksum arithmetic and no network lookup
// here (§2.1) — this answers "could this plausibly be an address on this chain",
// which is what the UI needs to stop someone pasting a Solana address into an
// Ethereum send. A real build must verify the checksum before broadcasting.
// TODO(backend): replace with real per-chain validation, including EIP-55.

const SHAPES: Record<AddressFormat, RegExp> = {
  evm: /^0x[0-9a-fA-F]{40}$/,
  sui: /^0x[0-9a-fA-F]{64}$/,
  bitcoin: /^(bc1[02-9ac-hj-np-z]{25,60}|[13][1-9A-HJ-NP-Za-km-z]{25,34})$/,
  solana: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
}

/** Names like `vitalik.eth` are accepted as plain strings (§9.4), not resolved. */
const NAME = /^[a-z0-9][a-z0-9-]{1,62}\.(eth|sol|sui|base)$/i

export type AddressCheck =
  | { ok: true; kind: 'address' | 'name' }
  | { ok: false; reason: string }

export function checkRecipient(value: string, format: AddressFormat, chainName: string): AddressCheck {
  const trimmed = value.trim()
  if (!trimmed) return { ok: false, reason: '' }
  if (NAME.test(trimmed)) return { ok: true, kind: 'name' }
  if (SHAPES[format].test(trimmed)) return { ok: true, kind: 'address' }

  // Say which chain it looks like it belongs to — "invalid address" leaves the
  // user guessing, and pasting the right address on the wrong chain is the
  // mistake that actually loses money (§6).
  const other = (Object.keys(SHAPES) as AddressFormat[]).find(
    (f) => f !== format && SHAPES[f].test(trimmed),
  )
  if (other) {
    return {
      ok: false,
      reason: `That looks like ${LABELS[other]} address, not ${LABELS[format]} one. Switch network or check the address.`,
    }
  }
  return { ok: false, reason: `That is not a valid ${chainName} address.` }
}

const LABELS: Record<AddressFormat, string> = {
  evm: 'an Ethereum-style',
  solana: 'a Solana',
  bitcoin: 'a Bitcoin',
  sui: 'a Sui',
}
