import { useState } from 'react'
import BackBar from '../../components/shell/BackBar'
import PhoenixMark from '../../components/brand/PhoenixMark'
import Pill from '../../components/primitives/Pill'
import Sheet from '../../components/primitives/Sheet'
import { SettingsGroup, SettingsNavRow, SettingsValueRow } from '../../components/wallet/SettingsRow'
import { useWallet } from '../../state/WalletProvider'
import { copyText } from '../../lib/clipboard'
import { IS_DEMO, VERSION } from '../../config'
import { Copy, ExternalLink } from '../../components/icons'

type LinkId = 'website' | 'docs' | 'support' | 'privacy'

/**
 * §2.1 forbids any real URL in the source, and §13 greps for one — so a tap
 * opens an in-app sheet with the same content a real link would lead to,
 * rather than an `href` to a domain that does not exist yet.
 */
const LINKS: readonly { id: LinkId; label: string; detail: string }[] = [
  { id: 'website', label: 'Website', detail: 'perigee.wallet' },
  { id: 'docs', label: 'Documentation', detail: 'Guides and walkthroughs' },
  { id: 'support', label: 'Support', detail: 'Get help from the team' },
  { id: 'privacy', label: 'Privacy policy', detail: 'How your data is handled' },
]

const DOC_TOPICS = [
  'Setting up your wallet',
  'Sending and receiving assets',
  'Connecting to a dApp',
  'Managing multiple accounts',
]

function CopyRow({ text, onCopy }: { text: string; onCopy: (text: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onCopy(text)}
      className="flex w-full items-center justify-between gap-2 rounded-control border border-hairline bg-surface-1 px-3 py-2.5 text-left transition-colors duration-state ease-out hover:bg-surface-2"
    >
      <span className="font-mono text-13 text-text">{text}</span>
      <Copy size={14} className="shrink-0 text-text-mute" />
    </button>
  )
}

function LinkContent({ id, onCopy }: { id: LinkId; onCopy: (text: string) => void }) {
  if (id === 'website') {
    return (
      <div className="space-y-3 pb-2">
        <p className="text-13 text-text-dim">
          The Perigee Wallet website — news, guides and release notes.
        </p>
        <CopyRow text="perigee.wallet" onCopy={onCopy} />
        <p className="text-11 text-text-mute">Goes live with the public release.</p>
      </div>
    )
  }
  if (id === 'docs') {
    return (
      <div className="space-y-2.5 pb-2">
        <p className="text-13 text-text-dim">Full guides ship with the public release. Planned topics:</p>
        <ul className="space-y-1.5">
          {DOC_TOPICS.map((topic) => (
            <li key={topic} className="flex items-start gap-2 text-13 text-text-dim">
              <span className="mt-[9px] h-1 w-1 shrink-0 rounded-pill bg-text-mute" />
              {topic}
            </li>
          ))}
        </ul>
      </div>
    )
  }
  if (id === 'support') {
    return (
      <div className="space-y-3 pb-2">
        <p className="text-13 text-text-dim">Reach the team directly.</p>
        <CopyRow text="support@perigee.wallet" onCopy={onCopy} />
        <p className="text-11 text-text-mute">Typical reply time is within one business day.</p>
      </div>
    )
  }
  return (
    <div className="space-y-3 pb-2 text-13 leading-relaxed text-text-dim">
      <p>
        Perigee Wallet is self-custodial. This build makes no network requests and collects no data —
        nothing about your activity, balances or accounts ever leaves this device.
      </p>
      <p>
        Recovery phrases, private keys and passwords are never transmitted, logged or stored outside
        your browser's extension sandbox.
      </p>
      <p className="text-text-mute">
        A future release may add optional, clearly-disclosed network features such as price feeds or
        transaction broadcasting. This page is updated before any such feature ships.
      </p>
    </div>
  )
}

export default function About() {
  const { dispatch } = useWallet()
  const [openLink, setOpenLink] = useState<LinkId | null>(null)

  const copy = async (text: string) => {
    const ok = await copyText(text)
    dispatch({
      type: 'toast/show',
      toast: ok ? { tone: 'success', message: 'Copied' } : { tone: 'error', message: 'Could not reach the clipboard.' },
    })
    window.setTimeout(() => dispatch({ type: 'toast/hide' }), 2000)
  }

  const active = LINKS.find((l) => l.id === openLink)

  return (
    <div className="flex h-full flex-col">
      <BackBar title="About" />

      <div className="scroll-region flex-1 px-gutter pb-5">
        <div className="flex flex-col items-center pt-4 text-center">
          <PhoenixMark size={48} active className="text-text" />
          <h1 className="pt-3 font-display text-22 font-bold tracking-display text-text">Perigee</h1>
          <p className="pt-0.5 font-mono text-12 tabular-nums text-text-mute">Version {VERSION}</p>
          {IS_DEMO && (
            <div className="pt-2">
              <Pill tone="accent">Demo build</Pill>
            </div>
          )}
        </div>

        <p className="pt-5 text-13 leading-relaxed text-text-dim">
          A self-custody wallet for eight networks. Your keys stay on this device: nothing is
          uploaded, so nothing can be handed over.
        </p>

        <SettingsGroup label="This build">
          <SettingsValueRow first label="Type" value="Interface preview" />
          <SettingsValueRow label="Browser permissions" value="None requested" />
          <SettingsValueRow label="Network requests" value="None" />
          <SettingsValueRow label="Data collected" value="None" />
        </SettingsGroup>

        <SettingsGroup label="Links">
          {LINKS.map((link, i) => (
            <SettingsNavRow
              key={link.id}
              first={i === 0}
              icon={<ExternalLink size={18} />}
              label={link.label}
              detail={link.detail}
              onClick={() => setOpenLink(link.id)}
            />
          ))}
        </SettingsGroup>

        {/* The one place the build states plainly what it is. Wording is load-
            bearing: it is the disclosure the store listing points at, so it has
            to stay accurate if the mock layer ever changes. */}
        <p className="pt-5 text-11 leading-relaxed text-text-mute">
          This is a preview of the interface, running on locally generated sample data. It connects
          to no network, derives no keys, and cannot hold, send or receive real funds. The recovery
          phrase it shows is display text — it unlocks nothing, here or anywhere else.
        </p>
      </div>

      <Sheet open={openLink !== null} onClose={() => setOpenLink(null)} title={active?.label ?? ''}>
        {openLink && <LinkContent id={openLink} onCopy={copy} />}
      </Sheet>
    </div>
  )
}
