import { useState } from 'react'
import { truncateAddress } from '../../lib/format'
import { copyText } from '../../lib/clipboard'
import { useWallet } from '../../state/WalletProvider'
import { Copy, Check } from '../icons'

/** Mono, middle-truncated, tap to copy (§9.3). */
export default function AddressLine({ address }: { address: string }) {
  const { dispatch } = useWallet()
  const [copied, setCopied] = useState(false)

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
    <button
      type="button"
      onClick={onCopy}
      aria-label={`Copy address ${address}`}
      className="inline-flex min-h-10 items-center gap-1.5 rounded-pill px-1.5 -ml-1.5 font-mono text-12 text-text-dim transition-colors duration-state ease-out hover:bg-surface-2 hover:text-text"
    >
      {truncateAddress(address)}
      {copied ? <Check size={13} className="text-gain" /> : <Copy size={13} />}
    </button>
  )
}
