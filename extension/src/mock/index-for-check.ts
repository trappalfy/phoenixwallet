// Barrel used only by scripts/check-mock.mjs so the data gate imports the real
// modules rather than a copy. Not imported by the app.
export { CHAINS, getChain } from './chains'
export { ACCOUNTS, FRESH_ACCOUNTS, RECOVERY_PHRASE, newAddresses, newPhrase, decoysFor } from './db'
export { TOKENS_BY_CHAIN, tokensFor } from './tokens'
export { NFTS } from './nfts'
export { ACTIVITY } from './activity'
export { getTotals } from './api'
