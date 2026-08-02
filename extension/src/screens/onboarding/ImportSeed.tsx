import { useState } from 'react'
import type { ClipboardEvent } from 'react'
import BackBar from '../../components/shell/BackBar'
import Button from '../../components/primitives/Button'
import Tabs from '../../components/primitives/Tabs'
import Field from '../../components/primitives/Field'
import IconButton from '../../components/primitives/IconButton'
import { useNav } from '../../router/useNav'
import { useWallet } from '../../state/WalletProvider'
import { RECOVERY_PHRASE } from '../../mock/db'
import { Check, Alert, Eye, EyeOff } from '../../components/icons'

const TABS = [
  { id: 'phrase', label: 'Recovery phrase' },
  { id: 'key', label: 'Private key' },
] as const

const EMPTY = Array.from({ length: 12 }, () => '')

/** A single secp256k1-style key, optionally 0x-prefixed. Shape only — §2.1. */
const KEY_SHAPE = /^(0x)?[0-9a-fA-F]{64}$/

export default function ImportSeed({ initialTab }: { initialTab?: 'phrase' | 'key' }) {
  const nav = useNav()
  const { state, dispatch } = useWallet()
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>(initialTab ?? 'phrase')
  const [words, setWords] = useState<string[]>(EMPTY)
  const [privateKey, setPrivateKey] = useState('')
  const [revealKey, setRevealKey] = useState(false)

  const trimmedKey = privateKey.trim()
  const validKey = KEY_SHAPE.test(trimmedKey)
  const keyError =
    trimmedKey.length > 0 && !validKey
      ? 'That doesn’t look like a private key. Expected 64 hex characters, optionally prefixed with 0x.'
      : undefined

  // There is no BIP-39 implementation here and no wordlist to check against
  // (§2.1), so a word is "right" when it matches the demo phrase's word for that
  // position. This is also what keeps a real phrase from ever being accepted.
  const isRight = (i: number) => words[i].trim().toLowerCase() === RECOVERY_PHRASE[i]
  const filled = words.filter((w) => w.trim()).length
  const allRight = words.every((_, i) => isRight(i))

  const setWord = (i: number, value: string) =>
    setWords((prev) => prev.map((w, j) => (j === i ? value : w)))

  /**
   * The same screen serves onboarding and Settings → Add account. During
   * onboarding an import continues to setting a password; inside an unlocked
   * wallet it adds an account, because the wallet already has a password and
   * asking for a second one would be nonsense.
   */
  const onImport = () => {
    if (tab === 'phrase') {
      if (state.status !== 'unlocked') {
        // The phrase brings its wallet back — accounts, balances and history —
        // before the password step, so Ready can say what was actually restored.
        dispatch({ type: 'wallet/restore' })
        nav.push({ name: 'setPassword' })
        return
      }
      const name = `Imported ${state.accounts.length + 1}`
      dispatch({ type: 'account/add', name })
      dispatch({ type: 'toast/show', toast: { tone: 'success', message: `${name} added` } })
      window.setTimeout(() => dispatch({ type: 'toast/hide' }), 2400)
      nav.reset({ name: 'home' })
      return
    }

    // A private key brings in one account, never a whole wallet. During
    // onboarding the wallet already starts as the single fresh account this
    // key belongs to, so there is nothing to replace — only the password step
    // is left.
    if (state.status !== 'unlocked') {
      nav.push({ name: 'setPassword' })
      return
    }
    const name = `Imported ${state.accounts.length + 1}`
    dispatch({ type: 'account/add', name })
    dispatch({ type: 'toast/show', toast: { tone: 'success', message: `${name} added` } })
    window.setTimeout(() => dispatch({ type: 'toast/hide' }), 2400)
    nav.reset({ name: 'home' })
  }

  /** Pasting a full phrase fills all twelve fields (§9.1.6). */
  const onPaste = (i: number) => (e: ClipboardEvent<HTMLInputElement>) => {
    const parts = e.clipboardData.getData('text').trim().split(/\s+/)
    if (parts.length < 2) return
    e.preventDefault()
    setWords((prev) => {
      const next = [...prev]
      parts.slice(0, 12 - i).forEach((p, k) => {
        next[i + k] = p.toLowerCase()
      })
      return next
    })
  }

  return (
    <div className="flex h-full flex-col">
      <BackBar title="Import a wallet" />
      <div className="px-gutter">
        <Tabs items={TABS} active={tab} onChange={setTab} label="Import method" />
      </div>

      <div className="scroll-region flex-1 px-gutter pb-4 pt-3">
        <div className="mb-3 flex gap-2.5 rounded-control border border-accent-hot/25 bg-accent-hot/[0.07] p-3">
          <span className="mt-0.5 shrink-0 text-accent-hot">
            <Alert size={16} />
          </span>
          {/* The DEMO chip is gone, but this stays: it is the one screen where a
              user can type something they cannot take back. Worded the way a real
              wallet warns about phishing, because that is what it is. */}
          <p className="text-12 text-text-dim">
            <span className="text-text">Only enter a phrase you wrote down yourself.</span> Anyone
            who sends you one, or asks you for yours, is taking the wallet it belongs to.
          </p>
        </div>

        {tab === 'phrase' ? (
          <>
            <div className="grid grid-cols-3 gap-1.5">
              {words.map((word, i) => {
                const right = isRight(i)
                const wrong = word.trim().length > 0 && !right
                return (
                  <label
                    key={i}
                    className={`flex min-h-10 items-center gap-1 rounded-control border bg-surface-2 px-2 ${
                      wrong ? 'border-loss' : right ? 'border-accent/40' : 'border-hairline'
                    }`}
                  >
                    <span className="w-3.5 shrink-0 text-right font-mono text-11 tabular-nums text-text-mute">
                      {i + 1}
                    </span>
                    <input
                      value={word}
                      onChange={(e) => setWord(i, e.target.value)}
                      onPaste={onPaste(i)}
                      aria-label={`Word ${i + 1}`}
                      autoComplete="off"
                      spellCheck={false}
                      className="min-w-0 flex-1 bg-transparent py-1.5 font-mono text-13 text-text outline-none"
                    />
                    {right && <Check size={13} className="shrink-0 text-gain" />}
                  </label>
                )
              })}
            </div>

            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="font-mono text-11 text-text-mute tabular-nums">{filled} / 12</span>
              <Button variant="quiet" onClick={() => setWords([...RECOVERY_PHRASE])}>
                Fill the sample phrase
              </Button>
            </div>
          </>
        ) : (
          <Field
            label="Private key"
            mono
            type={revealKey ? 'text' : 'password'}
            autoComplete="off"
            spellCheck={false}
            placeholder="Paste your private key"
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            error={keyError}
            hint={keyError ? undefined : 'Imports one account rather than the whole wallet.'}
            trailing={
              <IconButton label={revealKey ? 'Hide key' : 'Show key'} onClick={() => setRevealKey((v) => !v)}>
                {revealKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </IconButton>
            }
          />
        )}
      </div>

      <div className="shrink-0 px-gutter pb-5 pt-2">
        <Button block disabled={tab === 'phrase' ? !allRight : !validKey} onClick={onImport}>
          Import
        </Button>
      </div>
    </div>
  )
}
