import { useState } from 'react'
import BackBar from '../../components/shell/BackBar'
import Button from '../../components/primitives/Button'
import Field from '../../components/primitives/Field'
import IconButton from '../../components/primitives/IconButton'
import Divider from '../../components/primitives/Divider'
import ChainGlyph from '../../components/icons/ChainGlyph'
import { useWallet } from '../../state/WalletProvider'
import { getChain } from '../../mock/chains'
import type { Chain } from '../../mock/chains'
import { Check, ChevronDown, ChevronUp, Globe, Plus, Trash } from '../../components/icons'

export default function Networks() {
  const { state, dispatch } = useWallet()
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [symbol, setSymbol] = useState('')
  const [chainRef, setChainRef] = useState('')

  const { showTestnets, chainOrder } = state.prefs
  const ordered = chainOrder.map(getChain)
  const mainnets = ordered.filter((c) => !c.testnet)
  const testnets = ordered.filter((c) => c.testnet)

  const trimmedName = name.trim()
  const duplicate =
    ordered.some((c) => c.name.toLowerCase() === trimmedName.toLowerCase()) ||
    state.customNetworks.some((n) => n.name.toLowerCase() === trimmedName.toLowerCase())
  const canAdd = trimmedName.length > 1 && symbol.trim().length > 0 && !duplicate

  const addNetwork = () => {
    dispatch({
      type: 'network/add',
      network: {
        id: `custom-${Date.now()}`,
        name: trimmedName,
        symbol: symbol.trim().toUpperCase(),
        chainRef: chainRef.trim(),
      },
    })
    setName('')
    setSymbol('')
    setChainRef('')
    setAdding(false)
    dispatch({ type: 'toast/show', toast: { tone: 'success', message: `${trimmedName} added` } })
    window.setTimeout(() => dispatch({ type: 'toast/hide' }), 2400)
  }

  const row = (chain: Chain, index: number, list: Chain[]) => {
    const active = chain.id === state.activeChainId
    return (
      <div
        key={chain.id}
        className={`flex items-center gap-1 rounded-card border pl-2.5 pr-1 transition-colors duration-state ease-out ${
          active ? 'border-accent/40 bg-surface-1' : 'border-hairline bg-surface-1/60'
        }`}
      >
        <button
          type="button"
          onClick={() => dispatch({ type: 'chain/select', chainId: chain.id })}
          className="flex min-h-[52px] min-w-0 flex-1 items-center gap-2.5 py-1 text-left"
        >
          <span className="shrink-0" style={{ color: chain.tint }}>
            <ChainGlyph id={chain.id} size={18} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5">
              <span className="min-w-0 truncate text-15 text-text">{chain.name}</span>
              {active && <Check size={14} className="shrink-0 text-accent" />}
            </span>
            {/* The symbol sits under the name rather than beside it: side by side
                it crowded the arrows and read as part of them. */}
            <span className="block font-mono text-11 text-text-mute">{chain.symbol}</span>
          </span>
        </button>

        {/* Buttons rather than drag: a 360px popup is a poor drag target, and
            these work from the keyboard, which drag never does. Full 40px
            targets, side by side — stacked they were 24px tall, under the floor. */}
        <div className="flex shrink-0">
          <IconButton
            label={`Move ${chain.name} up`}
            disabled={index === 0}
            onClick={() => dispatch({ type: 'chain/move', chainId: chain.id, by: -1 })}
          >
            <ChevronUp size={16} />
          </IconButton>
          <IconButton
            label={`Move ${chain.name} down`}
            disabled={index === list.length - 1}
            onClick={() => dispatch({ type: 'chain/move', chainId: chain.id, by: 1 })}
          >
            <ChevronDown size={16} />
          </IconButton>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <BackBar title="Networks" />

      <div className="scroll-region flex-1 px-gutter pb-5">
        <p className="pb-2 text-11 text-text-mute">
          This order is the order the network switcher uses.
        </p>

        <div className="space-y-1">{mainnets.map(row)}</div>

        <Divider className="my-4" />

        <label className="flex min-h-10 cursor-pointer items-center justify-between gap-3">
          <span className="text-13 text-text-dim">Show testnets</span>
          <input
            type="checkbox"
            checked={showTestnets}
            onChange={(e) => dispatch({ type: 'prefs/set', patch: { showTestnets: e.target.checked } })}
            className="h-4 w-4 accent-accent"
          />
        </label>
        {showTestnets && <div className="space-y-1 pt-2">{testnets.map(row)}</div>}

        {state.customNetworks.length > 0 && (
          <>
            <h2 className="pb-1.5 pt-5 font-mono text-11 uppercase tracking-label text-text-mute">
              Custom
            </h2>
            <div className="space-y-1">
              {state.customNetworks.map((net) => (
                <div
                  key={net.id}
                  className="flex items-center gap-2.5 rounded-card border border-hairline bg-surface-1/60 py-1 pl-2.5 pr-1"
                >
                  <span className="shrink-0 text-text-mute">
                    <Globe size={18} />
                  </span>
                  <span className="min-w-0 flex-1 py-1">
                    <span className="block truncate text-15 text-text">{net.name}</span>
                    {/* Said plainly: a custom network has no data source in this
                        build, so it is listed but cannot be selected.
                        TODO(backend): attach an RPC and make these selectable. */}
                    <span className="block truncate text-11 text-text-mute">
                      {net.symbol} · not connected in this demo
                    </span>
                  </span>
                  <IconButton
                    label={`Remove ${net.name}`}
                    onClick={() => dispatch({ type: 'network/remove', id: net.id })}
                  >
                    <Trash size={16} />
                  </IconButton>
                </div>
              ))}
            </div>
          </>
        )}

        {adding ? (
          <div className="mt-5 space-y-3 rounded-card border border-hairline bg-surface-1 p-3">
            <h2 className="font-mono text-11 uppercase tracking-label text-text-mute">
              Add a network
            </h2>
            <Field
              label="Name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={trimmedName && duplicate ? 'That network is already in the list.' : undefined}
            />
            <Field
              label="Currency symbol"
              mono
              maxLength={8}
              placeholder="ETH"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
            />
            <Field
              label="Chain ID"
              mono
              inputMode="numeric"
              placeholder="1"
              value={chainRef}
              onChange={(e) => setChainRef(e.target.value)}
              hint="Optional here. A real build also needs an RPC endpoint from your node provider."
            />
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => setAdding(false)}>
                Cancel
              </Button>
              <Button className="flex-1" disabled={!canAdd} onClick={addNetwork}>
                Add
              </Button>
            </div>
          </div>
        ) : (
          <Button block variant="ghost" className="mt-5" onClick={() => setAdding(true)}>
            <Plus size={16} />
            Add a network
          </Button>
        )}
      </div>
    </div>
  )
}
