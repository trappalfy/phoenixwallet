import { useEffect, useRef, useState } from 'react'
import BackBar from '../../components/shell/BackBar'
import Button from '../../components/primitives/Button'
import SeedGrid, { SeedCell } from '../../components/wallet/SeedGrid'
import { useNav } from '../../router/useNav'
import { useWallet } from '../../state/WalletProvider'
import { copyText, clearClipboardAfter, CLIPBOARD_CLEAR_MS } from '../../lib/clipboard'
import { Eye, Copy, Alert, Check } from '../../components/icons'

export default function SeedReveal() {
  const nav = useNav()
  const { state, dispatch } = useWallet()
  const phrase = state.phrase
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied] = useState(false)
  const cancelClear = useRef<(() => void) | null>(null)

  useEffect(() => () => cancelClear.current?.(), [])

  const onCopy = async () => {
    const ok = await copyText(phrase.join(' '))
    if (!ok) {
      dispatch({ type: 'toast/show', toast: { tone: 'error', message: 'Could not reach the clipboard.' } })
      return
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
    cancelClear.current?.()
    cancelClear.current = clearClipboardAfter(CLIPBOARD_CLEAR_MS)
    dispatch({ type: 'toast/show', toast: { tone: 'success', message: 'Phrase copied' } })
    window.setTimeout(() => dispatch({ type: 'toast/hide' }), 2200)
  }

  return (
    <div className="flex h-full flex-col">
      <BackBar title="Recovery phrase" />
      <div className="scroll-region flex-1 px-gutter pb-4">
        {/* §6 — direct and specific, no hedging. */}
        <div className="flex gap-2.5 rounded-control border border-loss/30 bg-loss/[0.07] p-3">
          <span className="mt-0.5 shrink-0 text-loss">
            <Alert size={16} />
          </span>
          <div className="text-12 text-text-dim">
            <p className="text-text">Anyone with these twelve words takes the funds.</p>
            <p className="mt-1">
              Phoenix cannot restore them for you. Write them down offline and keep them somewhere
              only you can reach.
            </p>
          </div>
        </div>

        <div className="relative mt-3">
          <SeedGrid className={revealed ? '' : 'select-none blur-[6px]'}>
            {phrase.map((word, i) => (
              <SeedCell key={i} index={i}>
                {word}
              </SeedCell>
            ))}
          </SeedGrid>

          {!revealed && (
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="absolute inset-0 grid place-items-center rounded-card bg-ink/50"
            >
              <span className="flex items-center gap-2 rounded-pill border border-hairline bg-surface-2 px-4 py-2.5 text-13 text-text">
                <Eye size={16} />
                Reveal phrase
              </span>
            </button>
          )}
        </div>

        {/* Copy only. There was a Download button here; saving a recovery phrase
            to a file is a practice wallets deliberately do not offer, so the
            right fix was to drop it rather than to implement it. */}
        <div className="mt-3">
          <Button block variant="ghost" onClick={onCopy} disabled={!revealed}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
        <p className="mt-2 text-11 text-text-mute">
          A copied phrase is cleared from the clipboard after 20 seconds.
        </p>
      </div>

      <div className="shrink-0 px-gutter pb-5 pt-2">
        <Button block disabled={!revealed} onClick={() => nav.push({ name: 'seedConfirm' })}>
          I wrote it down
        </Button>
      </div>
    </div>
  )
}
