import { useState } from 'react'
import BackBar from '../../components/shell/BackBar'
import Field from '../../components/primitives/Field'
import Button from '../../components/primitives/Button'
import { useNav } from '../../router/useNav'
import { useWallet } from '../../state/WalletProvider'
import { Check, Close } from '../../components/icons'

// §2.2 — any input of 8+ characters is accepted and nothing is stored anywhere.
// There is no key derivation here and no password to verify against later.
const RULES = [
  { id: 'len', label: 'At least 8 characters', test: (v: string) => v.length >= 8 },
  { id: 'num', label: 'Contains a number', test: (v: string) => /\d/.test(v) },
] as const

/** Four bands so the rail has somewhere to grow after the two hard requirements. */
function strengthOf(value: string): number {
  if (!value) return 0
  let score = 0
  if (value.length >= 8) score++
  if (/\d/.test(value)) score++
  if (value.length >= 12) score++
  if (/[^A-Za-z0-9]/.test(value)) score++
  return score
}

export default function SetPassword() {
  const nav = useNav()
  const { state } = useWallet()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [acknowledged, setAcknowledged] = useState(false)
  const [touched, setTouched] = useState(false)

  const passed = RULES.filter((r) => r.test(password))
  const meetsRules = passed.length === RULES.length
  const matches = confirm.length > 0 && confirm === password
  const canContinue = meetsRules && matches && acknowledged
  const strength = strengthOf(password)

  return (
    <div className="flex h-full flex-col">
      <BackBar title="Create a password" />
      <div className="scroll-region flex-1 px-gutter pb-4">
        <p className="pb-4 text-13 text-text-dim">
          This password unlocks Perigee on this device. It does not protect your funds — your
          recovery phrase does.
        </p>

        <div className="space-y-3">
          <Field
            label="Password"
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Strength rail — accent gradient as a fill, one of the four places §5.2 allows it. */}
          <div>
            <div className="flex gap-1">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`h-1 flex-1 rounded-pill transition-colors duration-state ease-out ${
                    i < strength ? 'bg-grad-accent' : 'bg-surface-3'
                  }`}
                />
              ))}
            </div>
            <ul className="mt-2.5 space-y-1">
              {RULES.map((rule) => {
                const ok = rule.test(password)
                return (
                  <li key={rule.id} className="flex items-center gap-1.5 text-12">
                    <span className={ok ? 'text-gain' : 'text-text-mute'}>
                      {ok ? <Check size={14} /> : <Close size={14} />}
                    </span>
                    <span className={ok ? 'text-text-dim' : 'text-text-mute'}>{rule.label}</span>
                  </li>
                )
              })}
            </ul>
          </div>

          <Field
            label="Confirm password"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            onBlur={() => setTouched(true)}
            error={touched && confirm.length > 0 && !matches ? 'The two passwords do not match.' : undefined}
          />

          <label className="flex cursor-pointer items-start gap-2.5 rounded-control border border-hairline bg-surface-1 p-3">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-accent"
            />
            <span className="text-12 text-text-dim">
              I understand that Perigee cannot reset this password. If I forget it, the only way back
              in is my recovery phrase.
            </span>
          </label>
        </div>
      </div>

      <div className="shrink-0 px-gutter pb-5 pt-2">
        {/* Someone who arrived here by importing has already written their phrase
            down — showing it back and asking them to confirm it is busywork. */}
        <Button
          block
          disabled={!canContinue}
          onClick={() =>
            nav.push({
              name: state.nav.stack.some((r) => r.name === 'importSeed') ? 'ready' : 'seedReveal',
            })
          }
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
