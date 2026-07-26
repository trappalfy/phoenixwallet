import { useState } from 'react'
import BackBar from '../../components/shell/BackBar'
import Button from '../../components/primitives/Button'
import Field from '../../components/primitives/Field'
import { SettingsGroup, SettingsNavRow } from '../../components/wallet/SettingsRow'
import { useWallet } from '../../state/WalletProvider'
import { useNav } from '../../router/useNav'
import { Plus, Download, Key, Shield, Check } from '../../components/icons'

type Mode = 'menu' | 'create' | 'hardware'
type HwStep = 'device' | 'searching' | 'found'
type Device = 'Ledger' | 'Trezor'

/** Three derivation slots, the way a hardware wallet offers the next few
 * accounts on its default path rather than an arbitrary list. */
const HW_SLOTS = [0, 1, 2] as const

export default function AddAccount() {
  const { state, dispatch } = useWallet()
  const nav = useNav()
  const [mode, setMode] = useState<Mode>('menu')
  const [name, setName] = useState(`Account ${state.accounts.length + 1}`)
  const [hwStep, setHwStep] = useState<HwStep>('device')
  const [device, setDevice] = useState<Device | null>(null)
  const [hwPick, setHwPick] = useState<number | null>(null)

  const trimmed = name.trim()
  const taken = state.accounts.some((a) => a.name.toLowerCase() === trimmed.toLowerCase())
  const error = !trimmed ? undefined : taken ? 'You already have an account with that name.' : undefined

  const create = () => {
    dispatch({ type: 'account/add', name: trimmed })
    dispatch({
      type: 'toast/show',
      toast: { tone: 'success', message: `${trimmed} added and selected` },
    })
    window.setTimeout(() => dispatch({ type: 'toast/hide' }), 2400)
    nav.reset({ name: 'home' })
  }

  const pickDevice = (next: Device) => {
    setDevice(next)
    setHwStep('searching')
    // TODO(backend): WebHID/WebUSB device discovery replaces this timer.
    window.setTimeout(() => setHwStep('found'), 1400)
  }

  const importHardware = () => {
    if (hwPick === null || !device) return
    const label = `${device} ${hwPick + 1}`
    dispatch({ type: 'account/add', name: label })
    dispatch({ type: 'toast/show', toast: { tone: 'success', message: `${label} added and selected` } })
    window.setTimeout(() => dispatch({ type: 'toast/hide' }), 2400)
    nav.reset({ name: 'home' })
  }

  if (mode === 'hardware') {
    return (
      <div className="flex h-full flex-col">
        <BackBar
          title="Connect hardware wallet"
          onBack={() => (hwStep === 'device' ? setMode('menu') : setHwStep('device'))}
        />
        <div className="scroll-region flex-1 px-gutter pb-4">
          {hwStep === 'device' && (
            <>
              <p className="pb-3 text-13 text-text-dim">Choose the device you want to connect.</p>
              <SettingsGroup>
                <SettingsNavRow
                  first
                  icon={<Shield size={18} />}
                  label="Ledger"
                  detail="Nano S Plus, Nano X"
                  onClick={() => pickDevice('Ledger')}
                />
                <SettingsNavRow
                  icon={<Shield size={18} />}
                  label="Trezor"
                  detail="Model One, Model T"
                  onClick={() => pickDevice('Trezor')}
                />
              </SettingsGroup>
            </>
          )}

          {hwStep === 'searching' && (
            <div className="flex flex-col items-center justify-center gap-3 pt-16 text-center">
              <span className="animate-pulse text-text-dim">
                <Shield size={40} />
              </span>
              <p className="text-13 text-text-dim">Looking for your {device}…</p>
              <p className="max-w-[26ch] text-11 text-text-mute">
                Make sure it’s unlocked and plugged in, or connected over Bluetooth.
              </p>
            </div>
          )}

          {hwStep === 'found' && (
            <>
              <p className="pb-3 text-13 text-text-dim">
                <span className="text-gain">{device} connected.</span> Choose an account to add.
              </p>
              <div className="space-y-1.5">
                {HW_SLOTS.map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setHwPick(i)}
                    className={`flex h-row w-full items-center gap-3 rounded-control border px-3 text-left transition-colors duration-state ease-out ${
                      hwPick === i
                        ? 'border-ember/50 bg-surface-2'
                        : 'border-hairline bg-surface-1 hover:bg-surface-2'
                    }`}
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-pill border border-hairline bg-surface-2 text-text-dim">
                      <Shield size={16} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-15 text-text">
                        {device} {i + 1}
                      </span>
                      <span className="block truncate font-mono text-11 text-text-mute">
                        m/44'/60'/0'/{i}
                      </span>
                    </span>
                    {hwPick === i && <Check size={16} className="shrink-0 text-ember" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {hwStep === 'found' && (
          <div className="shrink-0 px-gutter pb-5 pt-2">
            <Button block disabled={hwPick === null} onClick={importHardware}>
              Add account
            </Button>
          </div>
        )}
      </div>
    )
  }

  if (mode === 'create') {
    return (
      <div className="flex h-full flex-col">
        <BackBar title="New account" onBack={() => setMode('menu')} />
        <div className="scroll-region flex-1 px-gutter pb-4">
          <Field
            label="Name"
            autoFocus
            maxLength={30}
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={error}
            hint="Only you see this. It is stored with the wallet, not on any network."
          />
          {/* Said here rather than discovered on Home: a new account is empty. */}
          <p className="pt-4 text-12 text-text-dim">
            The new account starts with no assets on any network. Its addresses are its own.
          </p>
        </div>
        <div className="shrink-0 px-gutter pb-5 pt-2">
          <Button block disabled={!trimmed || taken} onClick={create}>
            Create account
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <BackBar title="Add account" />
      <div className="scroll-region flex-1 px-gutter pb-4">
        <SettingsGroup>
          <SettingsNavRow
            first
            icon={<Plus size={18} />}
            label="Create new"
            detail="A fresh account in this wallet"
            onClick={() => setMode('create')}
          />
          <SettingsNavRow
            icon={<Download size={18} />}
            label="Import recovery phrase"
            detail="Twelve or twenty-four words"
            onClick={() => nav.push({ name: 'importSeed' })}
          />
          <SettingsNavRow
            icon={<Key size={18} />}
            label="Import private key"
            detail="Bring in a single account"
            onClick={() => nav.push({ name: 'importSeed', tab: 'key' })}
          />
          <SettingsNavRow
            icon={<Shield size={18} />}
            label="Connect hardware wallet"
            detail="Ledger, Trezor"
            onClick={() => setMode('hardware')}
          />
        </SettingsGroup>
      </div>
    </div>
  )
}
