import { useEffect, useRef, useState } from 'react'
import BackBar from '../../components/shell/BackBar'
import Button from '../../components/primitives/Button'
import Field from '../../components/primitives/Field'
import SeedGrid, { SeedCell } from '../../components/wallet/SeedGrid'
import { SettingsGroup, SettingsValueRow } from '../../components/wallet/SettingsRow'
import { useWallet } from '../../state/WalletProvider'
import { AUTO_LOCK_MINUTES } from '../../mock/db'
import type { AutoLockMinutes } from '../../mock/db'
import { copyText, clearClipboardAfter, CLIPBOARD_CLEAR_MS } from '../../lib/clipboard'
import { Alert, Check, Copy, EyeOff, Lock } from '../../components/icons'

const MIN_PASSWORD = 8

const autoLockLabel = (m: AutoLockMinutes) => (m === 0 ? 'Never' : `${m} min`)

export default function Security() {
  const { state, dispatch } = useWallet()
  const [gate, setGate] = useState('')
  const [gateError, setGateError] = useState<string | undefined>()
  const [revealed, setRevealed] = useState(false)
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const cancelClear = useRef<(() => void) | null>(null)

  useEffect(() => () => cancelClear.current?.(), [])

  const { autoLockMinutes } = state.prefs

  const toast = (tone: 'success' | 'error', message: string) => {
    dispatch({ type: 'toast/show', toast: { tone, message } })
    window.setTimeout(() => dispatch({ type: 'toast/hide' }), 2400)
  }

  // §2.2 — no password is stored anywhere, so there is nothing to compare
  // against. Any input of the documented length passes, and the screen says so
  // rather than pretending to verify.
  const unlockPhrase = () => {
    if (gate.length < MIN_PASSWORD) {
      setGateError(`Your password is at least ${MIN_PASSWORD} characters.`)
      return
    }
    setGateError(undefined)
    setRevealed(true)
    setGate('')
  }

  const onCopyPhrase = async () => {
    const ok = await copyText(state.phrase.join(' '))
    if (!ok) {
      toast('error', 'Could not reach the clipboard.')
      return
    }
    cancelClear.current?.()
    cancelClear.current = clearClipboardAfter(CLIPBOARD_CLEAR_MS)
    toast('success', 'Phrase copied — cleared in 20 seconds')
  }

  const passwordError =
    next && next.length < MIN_PASSWORD
      ? `At least ${MIN_PASSWORD} characters.`
      : confirm && confirm !== next
        ? 'The two passwords are different.'
        : undefined

  const canChange = current.length >= MIN_PASSWORD && next.length >= MIN_PASSWORD && next === confirm

  const changePassword = () => {
    setCurrent('')
    setNext('')
    setConfirm('')
    toast('success', 'Password updated')
  }

  return (
    <div className="flex h-full flex-col">
      <BackBar title="Security" />

      <div className="scroll-region flex-1 px-gutter pb-5">
        <SettingsGroup label="Auto-lock">
          <SettingsValueRow
            first
            icon={<Lock size={18} />}
            label="Lock after"
            detail="Idle time before the wallet locks itself"
            value={autoLockLabel(autoLockMinutes)}
          />
        </SettingsGroup>

        <div
          role="radiogroup"
          aria-label="Auto-lock after"
          className="flex gap-1.5 overflow-x-auto pt-2"
        >
          {AUTO_LOCK_MINUTES.map((m) => {
            const on = m === autoLockMinutes
            return (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => dispatch({ type: 'prefs/set', patch: { autoLockMinutes: m } })}
                className={`min-h-10 shrink-0 rounded-pill border px-3 text-13 transition-colors duration-state ease-out ${
                  on
                    ? 'border-accent/50 bg-accent/10 text-accent'
                    : 'border-hairline bg-surface-1 text-text-dim hover:bg-surface-2'
                }`}
              >
                {autoLockLabel(m)}
              </button>
            )
          })}
        </div>
        {/* TODO(backend): an idle timer plus lock-on-popup-close enforces this.
            Nothing here counts down — the preference is stored, not applied. */}
        <p className="pt-2 text-11 text-text-mute">
          The popup also locks whenever it closes.
        </p>

        <h2 className="pb-1 pt-6 font-mono text-11 uppercase tracking-label text-text-mute">
          Change password
        </h2>
        <div className="space-y-3">
          <Field
            label="Current password"
            type="password"
            autoComplete="current-password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
          <Field
            label="New password"
            type="password"
            autoComplete="new-password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            error={passwordError}
          />
          <Field
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <Button block variant="ghost" disabled={!canChange} onClick={changePassword}>
            Update password
          </Button>
          <p className="text-11 text-text-mute">
            Your password never leaves this device, so there is nothing to check it against elsewhere.
          </p>
        </div>

        <h2 className="pb-1 pt-6 font-mono text-11 uppercase tracking-label text-text-mute">
          Recovery phrase
        </h2>

        {!revealed ? (
          <>
            <div className="flex gap-2.5 rounded-control border border-loss/30 bg-loss/[0.07] p-3">
              <span className="mt-0.5 shrink-0 text-loss">
                <Alert size={16} />
              </span>
              <p className="text-12 text-text-dim">
                <span className="text-text">Anyone with these twelve words takes the funds.</span>{' '}
                Make sure nobody is looking at your screen.
              </p>
            </div>
            <div className="pt-3">
              <Field
                label="Password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password to continue"
                value={gate}
                onChange={(e) => {
                  setGate(e.target.value)
                  setGateError(undefined)
                }}
                error={gateError}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') unlockPhrase()
                }}
              />
            </div>
            <Button block className="mt-3" disabled={!gate} onClick={unlockPhrase}>
              Reveal phrase
            </Button>
          </>
        ) : (
          <>
            <SeedGrid>
              {state.phrase.map((word, i) => (
                <SeedCell key={i} index={i}>
                  {word}
                </SeedCell>
              ))}
            </SeedGrid>
            <div className="mt-3 flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={onCopyPhrase}>
                <Copy size={16} />
                Copy
              </Button>
              <Button variant="ghost" className="flex-1" onClick={() => setRevealed(false)}>
                <EyeOff size={16} />
                Hide
              </Button>
            </div>
          </>
        )}

        <div className="flex items-center gap-2 pt-6 text-11 text-text-mute">
          <Check size={13} className="shrink-0 text-gain" />
          This build requests no browser permissions and makes no network calls.
        </div>
      </div>
    </div>
  )
}
