import { useState } from 'react'
import PhoenixMark from '../components/brand/PhoenixMark'
import DemoChip from '../components/brand/DemoChip'
import Button from '../components/primitives/Button'
import IconButton from '../components/primitives/IconButton'
import Field from '../components/primitives/Field'
import Pill from '../components/primitives/Pill'
import Tabs from '../components/primitives/Tabs'
import Sheet from '../components/primitives/Sheet'
import Toast from '../components/primitives/Toast'
import type { ToastState, ToastTone } from '../components/primitives/Toast'
import Skeleton from '../components/primitives/Skeleton'
import Divider from '../components/primitives/Divider'
import * as Icons from '../components/icons'
import { Copy, Lock, Send, Settings } from '../components/icons'

// Temporary review surface (§12 Phase 1). Removed from the router in Phase 7;
// the file stays so the primitives keep a place to be inspected in isolation.

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="pt-5">
      <h2 className="font-mono text-11 uppercase tracking-label text-text-mute">{title}</h2>
      <div className="mt-2.5">{children}</div>
    </section>
  )
}

const TABS = [
  { id: 'tokens', label: 'Tokens' },
  { id: 'nfts', label: 'NFTs' },
  { id: 'activity', label: 'Activity' },
] as const

const SWATCHES = [
  ['ink', 'bg-ink'],
  ['surface-1', 'bg-surface-1'],
  ['surface-2', 'bg-surface-2'],
  ['surface-3', 'bg-surface-3'],
  ['ember-deep', 'bg-ember-deep'],
  ['ember', 'bg-ember'],
  ['ember-hot', 'bg-ember-hot'],
  ['gain', 'bg-gain'],
  ['loss', 'bg-loss'],
] as const

export default function KitchenSink() {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('tokens')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [toast, setToast] = useState<ToastState>(null)
  const [amount, setAmount] = useState('2.4051')

  const fire = (tone: ToastTone, message: string) => {
    setToast({ tone, message })
    window.setTimeout(() => setToast(null), 2400)
  }

  return (
    <div className="relative h-full">
      <div className="scroll-region h-full px-gutter pb-16">
        <header className="flex items-center gap-2 py-3">
          <PhoenixMark size={24} active />
          <span className="font-display text-17 font-bold tracking-display text-text">
            Kitchen sink
          </span>
          <span className="ml-auto">
            <DemoChip />
          </span>
        </header>
        <Divider />

        <Section title="Brand mark">
          <div className="flex items-end gap-4 text-text">
            <PhoenixMark size={64} active />
            <PhoenixMark size={64} />
            <PhoenixMark size={24} />
            <span className="text-ember">
              <PhoenixMark size={24} />
            </span>
          </div>
        </Section>

        <Section title="Type scale">
          <p className="font-display text-34 font-bold tracking-figure text-text tnum">$12,480.92</p>
          <p className="font-display text-22 font-bold tracking-display text-text">Screen title</p>
          <p className="text-17 text-text">Body seventeen</p>
          <p className="text-15 text-text">Body fifteen — the default control size</p>
          <p className="text-13 text-text-dim">Thirteen, secondary row copy</p>
          <p className="text-12 text-text-dim">Twelve, labels and hints</p>
          <p className="font-mono text-11 uppercase tracking-label text-text-mute">Eleven mono label</p>
          <p className="mt-1 font-mono text-13 text-text tnum">0x71c4…9f4a · 2.4051 ETH</p>
        </Section>

        <Section title="Palette">
          <div className="grid grid-cols-3 gap-1.5">
            {SWATCHES.map(([name, cls]) => (
              <div key={name} className="rounded-control border border-hairline p-1.5">
                <div className={`h-7 rounded-chip ${cls}`} />
                <p className="mt-1 font-mono text-11 text-text-mute">{name}</p>
              </div>
            ))}
            <div className="rounded-control border border-hairline p-1.5">
              <div className="h-7 rounded-chip bg-grad-ember" />
              <p className="mt-1 font-mono text-11 text-text-mute">grad-ember</p>
            </div>
          </div>
        </Section>

        <Section title="Button">
          <div className="flex flex-wrap gap-2">
            <Button>Send</Button>
            <Button variant="ghost">Cancel</Button>
            <Button variant="quiet">Manage tokens</Button>
            <Button variant="danger">Disconnect</Button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button disabled>Send</Button>
            <Button variant="ghost" disabled hint="Soon">
              Buy
            </Button>
          </div>
          <div className="mt-2">
            <Button block onClick={() => fire('success', 'Sent')}>
              Block width
            </Button>
          </div>
        </Section>

        <Section title="Icon button">
          <div className="flex items-center gap-1">
            <IconButton label="Copy address">
              <Copy />
            </IconButton>
            <IconButton label="Lock wallet" tone="active">
              <Lock />
            </IconButton>
            <IconButton label="Send" disabled>
              <Send />
            </IconButton>
            <IconButton label="Settings">
              <Settings />
            </IconButton>
          </div>
        </Section>

        <Section title="Field">
          <div className="space-y-3">
            <Field label="Account name" placeholder="Main" defaultValue="Cold storage" />
            <Field
              label="Amount"
              mono
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              trailing={
                <button
                  type="button"
                  className="rounded-chip bg-surface-3 px-1.5 py-0.5 font-mono text-11 uppercase tracking-label text-ember"
                >
                  Max
                </button>
              }
              hint="≈ $7,204.10"
            />
            <Field
              label="Recipient"
              mono
              defaultValue="0x71c4"
              error="Not a valid Ethereum address. It should start with 0x and be 42 characters."
            />
            <Field label="Password" type="password" placeholder="At least 8 characters" disabled />
          </div>
        </Section>

        <Section title="Pill">
          <div className="flex flex-wrap gap-1.5">
            <Pill>Ethereum</Pill>
            <Pill tone="gain" mono>
              ▲ 2.14%
            </Pill>
            <Pill tone="loss" mono>
              ▼ 1.08%
            </Pill>
            <Pill tone="ember">Active</Pill>
            <Pill tone="pending">Pending</Pill>
          </div>
        </Section>

        <Section title="Tabs">
          <Tabs items={TABS} active={tab} onChange={setTab} label="Kitchen sink demo tabs" />
          <p className="pt-2.5 text-13 text-text-dim">Active panel: {tab}</p>
        </Section>

        <Section title="Skeleton">
          <div className="flex items-center gap-3">
            <Skeleton rounded="pill" className="h-9 w-9" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-3 w-14" />
          </div>
        </Section>

        <Section title="Toast">
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onClick={() => fire('success', 'Address copied')}>
              Success
            </Button>
            <Button variant="ghost" onClick={() => fire('error', 'Not enough ETH for network fee')}>
              Error
            </Button>
            <Button variant="ghost" onClick={() => fire('info', 'Switched to Base')}>
              Info
            </Button>
          </div>
        </Section>

        <Section title="Sheet">
          <Button variant="ghost" onClick={() => setSheetOpen(true)}>
            Open bottom sheet
          </Button>
        </Section>

        <Section title="Icons">
          <div className="grid grid-cols-8 gap-y-3 text-text-dim">
            {Object.entries(Icons)
              .filter(([name]) => name[0] === name[0].toUpperCase())
              .map(([name, Icon]) => {
                const Glyph = Icon as (p: { size?: number }) => JSX.Element
                return (
                  <div key={name} className="grid place-items-center" title={name}>
                    <Glyph size={20} />
                  </div>
                )
              })}
          </div>
        </Section>

        <Section title="Focus ring">
          <div className="flex flex-wrap items-center gap-3">
            {/* Forced on so the ring is reviewable in a static screenshot; every
                interactive element gets this from :focus-visible in index.css. */}
            <span className="inline-flex rounded-pill shadow-focus">
              <Button variant="ghost">Keyboard focus</Button>
            </span>
            <span className="inline-flex rounded-pill shadow-focus">
              <IconButton label="Copy address">
                <Copy />
              </IconButton>
            </span>
          </div>
          <p className="mt-2 text-12 text-text-mute">Tab through this screen to see the live ring.</p>
        </Section>

        <Section title="Divider and rails">
          <Divider />
          <div className="mt-3 h-0.5 rounded-pill bg-grad-ember" />
          <p className="mt-1.5 text-12 text-text-mute">Heat rail — the fourth permitted gradient.</p>
        </Section>
      </div>

      <Toast state={toast} />

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Select network">
        <div className="space-y-1">
          {['Ethereum', 'Solana', 'Bitcoin', 'Base'].map((n) => (
            <button
              key={n}
              type="button"
              className="flex h-row w-full items-center rounded-control px-3 text-15 text-text hover:bg-surface-3"
            >
              {n}
            </button>
          ))}
        </div>
      </Sheet>
    </div>
  )
}
