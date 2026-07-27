import { useState } from 'react'
import BackBar from '../components/shell/BackBar'
import Button from '../components/primitives/Button'
import QrPanel from '../components/wallet/QrPanel'
import ChainGlyph from '../components/icons/ChainGlyph'
import Sheet from '../components/primitives/Sheet'
import { useWallet } from '../state/WalletProvider'
import { getChain, MAINNETS } from '../mock/chains'
import { addressFor } from '../mock/db'
import { copyText } from '../lib/clipboard'
import { Copy, Check, ChevronDown, Alert } from '../components/icons'

export default function Receive() {
  const { state, dispatch, account } = useWallet()
  const [pickerOpen, setPickerOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const chain = getChain(state.activeChainId)
  const address = addressFor(account, state.activeChainId)

  const onCopy = async () => {
    const ok = await copyText(address)
    if (!ok) {
      dispatch({ type: 'toast/show', toast: { tone: 'error', message: 'Could not reach the clipboard.' } })
      window.setTimeout(() => dispatch({ type: 'toast/hide' }), 2200)
      return
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
    dispatch({ type: 'toast/show', toast: { tone: 'success', message: 'Address copied' } })
    window.setTimeout(() => dispatch({ type: 'toast/hide' }), 2000)
  }

  return (
    <div className="flex h-full flex-col">
      <BackBar title="Receive" />
      <div className="scroll-region flex-1 px-gutter pb-4">
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="mx-auto flex min-h-10 items-center gap-2 rounded-pill border border-hairline bg-surface-1 px-3 transition-colors duration-state ease-out hover:bg-surface-2"
        >
          <span style={{ color: chain.tint }}>
            <ChainGlyph id={chain.id} size={18} />
          </span>
          <span className="text-13 text-text">{chain.name}</span>
          <ChevronDown size={14} className="text-text-mute" />
        </button>

        <div className="pt-4">
          <QrPanel value={address} />
        </div>

        {/* break-all so the middle wraps rather than truncating — this is the one
            place the whole address must be readable character by character. */}
        <p className="mx-auto max-w-[30ch] break-all pt-4 text-center font-mono text-13 text-text">
          {address}
        </p>

        {/* Copy is the whole job. A Share button sat here doing nothing next to
            a Copy button that already puts the address wherever it needs to go. */}
        <div className="pt-4">
          <Button block variant="ghost" onClick={onCopy}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied' : 'Copy address'}
          </Button>
        </div>

        <p className="flex items-start gap-2 pt-4 text-12 text-text-dim">
          <span className="mt-0.5 shrink-0 text-ember-hot">
            <Alert size={14} />
          </span>
          Send only {chain.name} assets to this address. Anything sent from another network is lost.
        </p>
      </div>

      <Sheet open={pickerOpen} onClose={() => setPickerOpen(false)} title="Receive on">
        <div className="space-y-0.5">
          {MAINNETS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                dispatch({ type: 'chain/select', chainId: c.id })
                setPickerOpen(false)
              }}
              className="flex h-row w-full items-center gap-3 rounded-control px-2 text-left transition-colors duration-state ease-out hover:bg-surface-3"
            >
              <span style={{ color: c.tint }}>
                <ChainGlyph id={c.id} size={20} />
              </span>
              <span className="flex-1 truncate text-15 text-text">{c.name}</span>
              {c.id === chain.id && <Check size={16} className="text-ember" />}
            </button>
          ))}
        </div>
      </Sheet>
    </div>
  )
}
