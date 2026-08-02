import { useState } from 'react'
import PhoenixMark from '../components/brand/PhoenixMark'
import Button from '../components/primitives/Button'
import Field from '../components/primitives/Field'
import Sheet from '../components/primitives/Sheet'
import { useWallet } from '../state/WalletProvider'
import { useIgnite, useShake } from '../lib/motion'

// §2.2 — nothing is stored, so there is no password to compare against. Any
// input of 8+ characters unlocks; anything shorter exercises the failure states
// §9.2 asks for. A real build compares against a KDF-derived check value.
const MIN_LENGTH = 8

export default function Unlock() {
  const { dispatch } = useWallet()
  const [password, setPassword] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [shakeKey, setShakeKey] = useState(0)
  const [failed, setFailed] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)

  const ignite = useIgnite()
  // Counter, not a boolean: a second wrong password has to shake again, and a
  // boolean that is already true does not change.
  const shake = useShake(shakeKey)

  const submit = () => {
    if (password.length >= MIN_LENGTH) {
      dispatch({ type: 'wallet/unlock' })
      return
    }
    setFailed(true)
    setAttempts((n) => n + 1)
    setShakeKey((k) => k + 1)
  }

  return (
    <div ref={ignite} className="relative flex h-full flex-col overflow-hidden px-gutter pb-5 pt-16">
      {/* The second and last place the ignite fires (§5.5): the mark draws out
          of its own centre while a heat rail crosses the top edge. */}
      <div className="absolute inset-x-0 top-0 h-0.5 overflow-hidden">
        <div data-ignite-rail className="h-full w-1/2 bg-grad-accent" />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center">
        <div data-ignite-mark>
          <PhoenixMark size={56} active />
        </div>
        <h1 className="mt-5 font-display text-22 font-bold tracking-display text-text">
          Welcome back
        </h1>
      </div>

      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
      >
        <div ref={shake}>
          <Field
            label="Password"
            type="password"
            autoFocus
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (failed) setFailed(false)
            }}
            error={
              failed
                ? `That password is too short. It must be at least ${MIN_LENGTH} characters.`
                : undefined
            }
          />
        </div>

        {/* Counter appears only after two failures, so one slip is not scolded. */}
        {attempts >= 2 && (
          <p className="text-12 text-text-mute tabular-nums">
            {attempts} failed attempts. Perigee does not lock you out — but it cannot reset this
            password either.
          </p>
        )}

        <Button block type="submit">
          Unlock
        </Button>
        <button
          type="button"
          onClick={() => setHelpOpen(true)}
          className="mx-auto block min-h-10 text-13 text-text-dim transition-colors duration-state ease-out hover:text-text"
        >
          Forgot password?
        </button>
      </form>

      <Sheet open={helpOpen} onClose={() => setHelpOpen(false)} title="Forgot password?">
        <div className="space-y-3 pb-2 text-13 text-text-dim">
          <p>
            Perigee cannot reset your password. It never leaves this device, so there is nothing for
            us to look up and nobody to ask.
          </p>
          <p>
            The way back in is your twelve-word recovery phrase. Reset the wallet, choose
            <span className="text-text"> I already have a wallet</span>, and enter the phrase — your
            accounts and balances come back with it.
          </p>
          <p className="text-text-mute">
            Without the phrase, the funds in this wallet cannot be recovered by anyone.
          </p>
        </div>
        <Button block variant="ghost" onClick={() => setHelpOpen(false)}>
          Got it
        </Button>
      </Sheet>
    </div>
  )
}
