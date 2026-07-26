// Data integrity gate for the mock layer (§7). Runs against the TypeScript
// sources via a throwaway esbuild bundle, so it checks the real seed rather than
// a copy that can drift.
//
//   node scripts/check-mock.mjs
import { build } from 'esbuild'
import { readFile, rm } from 'node:fs/promises'

const OUT = new URL('../.mock-check.mjs', import.meta.url).pathname

await build({
  entryPoints: [new URL('../src/mock/index-for-check.ts', import.meta.url).pathname],
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile: OUT,
  logLevel: 'error',
})

const m = await import(OUT + `?t=${Date.now()}`)
await rm(OUT)

const fails = []
const ok = []
const check = (label, pass, detail = '') =>
  (pass ? ok : fails).push(`${label}${detail ? '  — ' + detail : ''}`)

/* --- addresses must be shaped correctly per chain (§7) -------------------- */
const SHAPE = {
  evm: /^0x[0-9a-f]{40}$/,
  solana: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
  bitcoin: /^bc1q[02-9ac-hj-np-z]{38}$/,
  sui: /^0x[0-9a-f]{64}$/,
}
for (const acc of m.ACCOUNTS) {
  for (const [format, addr] of Object.entries(acc.addresses)) {
    check(`${acc.name} ${format} address`, SHAPE[format].test(addr), addr)
  }
}

/* --- tokens --------------------------------------------------------------- */
const mainnets = m.CHAINS.filter((c) => !c.testnet)
for (const c of mainnets) {
  const list = m.TOKENS_BY_CHAIN[c.id]
  check(`${c.name}: 4–7 assets`, list.length >= 4 && list.length <= 7, `${list.length}`)
}
const all = mainnets.flatMap((c) => m.TOKENS_BY_CHAIN[c.id])
check('at least two 24h losses', all.filter((t) => t.change24h < 0).length >= 2,
  `${all.filter((t) => t.change24h < 0).length} negative`)
check('at least one zero-balance holding', all.some((t) => t.balance === 0))

/* --- activity ------------------------------------------------------------- */
check('~14 activity entries', m.ACTIVITY.length >= 12 && m.ACTIVITY.length <= 16, `${m.ACTIVITY.length}`)
for (const kind of ['send', 'receive', 'swap', 'approve', 'mint'])
  check(`activity covers "${kind}"`, m.ACTIVITY.some((a) => a.kind === kind))
for (const status of ['confirmed', 'pending', 'failed'])
  check(`activity covers "${status}"`, m.ACTIVITY.some((a) => a.status === status))
check('every failed entry explains itself', m.ACTIVITY.filter((a) => a.status === 'failed').every((a) => a.reason))

const HASH = { evm: /^0x[0-9a-f]{64}$/, btc: /^[0-9a-f]{64}$/, sol: /^[1-9A-HJ-NP-Za-km-z]{43,88}$/ }
for (const a of m.ACTIVITY) {
  const fmt = m.getChain(a.chainId).format
  const re = fmt === 'bitcoin' ? HASH.btc : fmt === 'solana' ? HASH.sol : HASH.evm
  check(`${a.id} hash shape (${fmt})`, re.test(a.hash), a.hash.slice(0, 14) + '…')
}

/* --- nfts ----------------------------------------------------------------- */
check('6 NFTs', m.NFTS.length === 6, `${m.NFTS.length}`)
check('NFTs span Ethereum, Base and Solana',
  new Set(m.NFTS.map((n) => n.chainId)).size === 3,
  [...new Set(m.NFTS.map((n) => n.chainId))].join(', '))

/* --- totals are computed, not hardcoded ---------------------------------- */
const eth = m.getTotals('acc-main', 'ethereum')
const sum = m.TOKENS_BY_CHAIN.ethereum.reduce((s, t) => s + t.balance * t.price, 0)
check('Ethereum total is derived from token data', Math.abs(eth.value - sum) < 1e-6,
  `$${eth.value.toFixed(2)}`)

/* --- holdings belong to an account, not to a chain (§13) ------------------ */
const ids = new Set(m.ACCOUNTS.map((a) => a.id))
check('every NFT names a real owner', m.NFTS.every((n) => ids.has(n.accountId)))
check('every activity entry names a real owner', m.ACTIVITY.every((a) => ids.has(a.accountId)))
for (const acc of m.ACCOUNTS) {
  check(`${acc.name} has its own history`, m.ACTIVITY.some((a) => a.accountId === acc.id),
    `${m.ACTIVITY.filter((a) => a.accountId === acc.id).length} entries`)
}
// The point of the refactor: three accounts on one chain must not be identical.
const totals = m.ACCOUNTS.map((a) => m.getTotals(a.id, 'ethereum').value)
check('accounts hold different amounts on the same chain', new Set(totals).size === totals.length,
  totals.map((t) => `$${Math.round(t).toLocaleString('en-US')}`).join(' / '))
check('a mint is credited to the account that owns the NFT',
  m.ACTIVITY.filter((a) => a.kind === 'mint').every((a) => {
    const nft = m.NFTS.find((n) => n.name === a.symbol)
    return !nft || nft.accountId === a.accountId
  }))
/* --- a wallet nobody has used yet ---------------------------------------- */
// The one thing this build must never do is greet a brand new wallet with
// someone else's money.
check('a new wallet has exactly one account', m.FRESH_ACCOUNTS.length === 1,
  m.FRESH_ACCOUNTS.map((a) => a.name).join(', '))
check('the new wallet account has its own addresses',
  m.FRESH_ACCOUNTS.every((a) => !m.ACCOUNTS.some((s) => s.addresses.evm === a.addresses.evm)))
// Generated per session: two registrations must not show the same address.
check('a new wallet address is not a constant',
  m.newAddresses().evm !== m.newAddresses().evm)
for (const [format, addr] of Object.entries(m.newAddresses())) {
  check(`generated ${format} address has the right shape`, SHAPE[format].test(addr), addr)
}
for (const acc of m.FRESH_ACCOUNTS) {
  for (const [format, addr] of Object.entries(acc.addresses)) {
    check(`${acc.name} ${format} address`, SHAPE[format].test(addr), addr)
  }
}
for (const c of mainnets) {
  const held = m.tokensFor('acc-fresh', c.id)
  // Not an empty list: a real new account shows the native asset at zero.
  check(`${c.name}: a new account holds only ${c.symbol}, at zero`,
    held.length === 1 && held[0].symbol === c.symbol && held[0].balance === 0,
    held.map((t) => `${t.balance} ${t.symbol}`).join(', '))
}
check('a new wallet is worth nothing', m.getTotals('acc-fresh', 'ethereum').value === 0)
check('a new wallet owns no collectibles',
  m.NFTS.every((n) => n.accountId !== 'acc-fresh'))
check('a new wallet has no history',
  m.ACTIVITY.every((a) => a.accountId !== 'acc-fresh'))

/* --- generated phrases ---------------------------------------------------- */
const p1 = m.newPhrase()
const p2 = m.newPhrase()
check('a generated phrase is 12 words', p1.length === 12, p1.join(' '))
check('a generated phrase has no repeats', new Set(p1).size === 12)
check('two wallets get different phrases', p1.join(' ') !== p2.join(' '))
check('generated words are lowercase and alphabetic', p1.every((w) => /^[a-z]+$/.test(w)))
// The confirm step is only a test if the decoys are not already on screen.
const decoys = m.decoysFor(p1)
check('decoys never collide with the phrase',
  decoys.length === 3 && decoys.every((d) => !p1.includes(d)), decoys.join(', '))

/* --- the sample wallet's phrase is the documented dummy ------------------- */
check('recovery phrase is 12 words', m.RECOVERY_PHRASE.length === 12)
const db = await readFile(new URL('../src/mock/db.ts', import.meta.url), 'utf8')
check('recovery phrase is marked as not a real wallet', /NOT A VALID WALLET/.test(db))

console.log(`${ok.length} passed`)
if (fails.length) {
  console.log(`\n${fails.length} FAILED:`)
  for (const f of fails) console.log('  ✗ ' + f)
  process.exit(1)
}
console.log('mock layer: all checks pass')
