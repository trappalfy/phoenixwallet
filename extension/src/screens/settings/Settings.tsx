import PhoenixMark from '../../components/brand/PhoenixMark'
import AccountFace from '../../components/wallet/AccountFace'
import {
  SettingsGroup,
  SettingsNavRow,
  SettingsToggleRow,
  SettingsValueRow,
} from '../../components/wallet/SettingsRow'
import { useWallet } from '../../state/WalletProvider'
import { useNav } from '../../router/useNav'
import { getChain, MAINNETS } from '../../mock/chains'
import { VERSION } from '../../config'
import { Globe, Info, Lock, Shield, Wallet } from '../../components/icons'

export default function Settings() {
  const { state, dispatch, account } = useWallet()
  const nav = useNav()

  const chain = getChain(state.activeChainId)
  const { currency, hideSmallBalances } = state.prefs
  const sites = state.connectedSites.length

  return (
    <div className="flex h-full flex-col">
      <div className="scroll-region flex-1 px-gutter pb-4">
        <h1 className="pb-1 pt-3 font-display text-22 font-bold tracking-display text-text">
          Settings
        </h1>

        <SettingsGroup label="Wallet">
          <SettingsNavRow
            first
            icon={<AccountFace account={account} size={20} />}
            label={account.name}
            detail={`${state.accounts.length} account${state.accounts.length === 1 ? '' : 's'}`}
            onClick={() => nav.push({ name: 'accountList' })}
          />
          <SettingsNavRow
            icon={<Shield size={18} />}
            label="Security"
            detail="Auto-lock, password, recovery phrase"
            onClick={() => nav.push({ name: 'security' })}
          />
          <SettingsNavRow
            icon={<Globe size={18} />}
            label="Networks"
            detail={`${chain.name} · ${MAINNETS.length + state.customNetworks.length} available`}
            onClick={() => nav.push({ name: 'networks' })}
          />
        </SettingsGroup>

        <SettingsGroup label="Display">
          <SettingsNavRow
            first
            icon={<Wallet size={18} />}
            label="Currency"
            value={currency}
            onClick={() => nav.push({ name: 'currency' })}
          />
          <SettingsToggleRow
            label="Hide small balances"
            detail="Holdings worth under $1"
            checked={hideSmallBalances}
            onChange={(next) => dispatch({ type: 'prefs/set', patch: { hideSmallBalances: next } })}
          />
          {/* §9.7 locks Appearance to dark and lists light as Soon. A row that
              states that is more honest than a toggle that ignores taps. */}
          <SettingsValueRow
            label="Theme"
            detail="Light theme is coming"
            value={
              <span className="flex items-center gap-1.5">
                Dark
                <span className="rounded-chip border border-hairline px-1.5 py-0.5 font-mono text-11 uppercase leading-none tracking-label text-text-mute">
                  Soon
                </span>
              </span>
            }
          />
        </SettingsGroup>

        <SettingsGroup label="Permissions">
          <SettingsNavRow
            first
            icon={<Lock size={18} />}
            label="Connected sites"
            detail={sites === 0 ? 'No sites connected' : `${sites} site${sites === 1 ? '' : 's'}`}
            onClick={() => nav.push({ name: 'connectedSites' })}
          />
          <SettingsNavRow
            icon={<Info size={18} />}
            label="About"
            value={`v${VERSION}`}
            onClick={() => nav.push({ name: 'about' })}
          />
        </SettingsGroup>

        <div className="flex flex-col items-center gap-1.5 pb-2 pt-6">
          <PhoenixMark size={22} className="text-text-mute" />
          <p className="font-mono text-11 uppercase tracking-label text-text-mute">
            {`Perigee · v${VERSION}`}
          </p>
        </div>
      </div>
    </div>
  )
}
