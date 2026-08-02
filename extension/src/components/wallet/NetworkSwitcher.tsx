import { useState } from 'react'
import { useWallet } from '../../state/WalletProvider'
import { getChain, MAINNETS, TESTNETS } from '../../mock/chains'
import type { Chain } from '../../mock/chains'
import ChainGlyph from '../icons/ChainGlyph'
import Sheet from '../primitives/Sheet'
import Field from '../primitives/Field'
import Divider from '../primitives/Divider'
import { ChevronDown, Check } from '../icons'

export default function NetworkSwitcher() {
  const { state, dispatch } = useWallet()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const active = getChain(state.activeChainId)
  const showTestnets = state.prefs.showTestnets
  const match = (c: Chain) => c.name.toLowerCase().includes(query.trim().toLowerCase())

  const select = (chain: Chain) => {
    dispatch({ type: 'chain/select', chainId: chain.id })
    setOpen(false)
  }

  const row = (chain: Chain) => (
    <button
      key={chain.id}
      type="button"
      onClick={() => select(chain)}
      className="flex h-row w-full items-center gap-3 rounded-control px-2 text-left transition-colors duration-state ease-out hover:bg-surface-3"
    >
      <span style={{ color: chain.tint }}>
        <ChainGlyph id={chain.id} size={20} />
      </span>
      <span className="min-w-0 flex-1 truncate text-15 text-text">{chain.name}</span>
      <span className="font-mono text-11 text-text-mute">{chain.symbol}</span>
      {chain.id === state.activeChainId && <Check size={18} className="shrink-0 text-accent" />}
    </button>
  )

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="flex min-h-10 min-w-0 items-center gap-1.5 rounded-pill px-1.5 text-text transition-colors duration-state ease-out hover:bg-surface-2"
      >
        <span style={{ color: active.tint }}>
          <ChainGlyph id={active.id} size={18} />
        </span>
        <span className="min-w-0 truncate text-13">{active.name}</span>
        <ChevronDown size={14} className="shrink-0 text-text-mute" />
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} title="Networks">
        <Field
          label="Search"
          placeholder="Network name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="mt-3 space-y-0.5">{MAINNETS.filter(match).map(row)}</div>

        <Divider className="my-3" />
        <label className="flex min-h-10 cursor-pointer items-center justify-between gap-3">
          <span className="text-13 text-text-dim">Testnets</span>
          <input
            type="checkbox"
            checked={showTestnets}
            onChange={(e) => dispatch({ type: 'prefs/set', patch: { showTestnets: e.target.checked } })}
            className="h-4 w-4 accent-accent"
          />
        </label>
        {showTestnets && <div className="space-y-0.5">{TESTNETS.filter(match).map(row)}</div>}
      </Sheet>
    </>
  )
}
