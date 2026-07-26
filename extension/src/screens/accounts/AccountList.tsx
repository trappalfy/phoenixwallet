import BackBar from '../../components/shell/BackBar'
import Button from '../../components/primitives/Button'
import IconButton from '../../components/primitives/IconButton'
import AccountFace from '../../components/wallet/AccountFace'
import { useWallet } from '../../state/WalletProvider'
import { useNav } from '../../router/useNav'
import { getChain } from '../../mock/chains'
import { addressFor } from '../../mock/db'
import { formatFiat, truncateAddress } from '../../lib/format'
import * as api from '../../mock/api'
import { Check, Pencil, Plus } from '../../components/icons'

export default function AccountList() {
  const { state, dispatch } = useWallet()
  const nav = useNav()

  const chain = getChain(state.activeChainId)
  const { currency } = state.prefs

  return (
    <div className="flex h-full flex-col">
      <BackBar
        title="Accounts"
        trailing={
          <IconButton label="Add account" onClick={() => nav.push({ name: 'addAccount' })}>
            <Plus size={18} />
          </IconButton>
        }
      />

      <div className="scroll-region flex-1 px-gutter pb-4">
        <p className="pb-2 text-11 text-text-mute">Balances shown on {chain.name}.</p>

        <div className="space-y-1">
          {state.accounts.map((a) => {
            const active = a.id === state.activeAccountId
            const total = api.getTotals(a.id, state.activeChainId)

            return (
              <div
                key={a.id}
                className={`flex items-center gap-2 rounded-card border pl-2 pr-1 transition-colors duration-state ease-out ${
                  active ? 'border-ember/40 bg-surface-1' : 'border-hairline bg-surface-1/60'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    dispatch({ type: 'account/select', accountId: a.id })
                    nav.reset({ name: 'home' })
                  }}
                  className="flex min-h-[60px] min-w-0 flex-1 items-center gap-3 py-2 text-left"
                >
                  <AccountFace account={a} size={34} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="min-w-0 truncate text-15 text-text">{a.name}</span>
                      {active && <Check size={14} className="shrink-0 text-ember" />}
                    </span>
                    <span className="block truncate font-mono text-11 text-text-mute">
                      {truncateAddress(addressFor(a, state.activeChainId))}
                    </span>
                  </span>
                  <span className="shrink-0 pr-1 text-right">
                    <span className="block font-mono text-13 tabular-nums text-text">
                      {formatFiat(total.value, currency)}
                    </span>
                  </span>
                </button>

                <IconButton
                  label={`Rename ${a.name}`}
                  onClick={() => nav.push({ name: 'renameAccount', accountId: a.id })}
                >
                  <Pencil size={16} />
                </IconButton>
              </div>
            )
          })}
        </div>
      </div>

      <div className="shrink-0 px-gutter pb-5 pt-2">
        <Button block variant="ghost" onClick={() => nav.push({ name: 'addAccount' })}>
          <Plus size={16} />
          Add account
        </Button>
      </div>
    </div>
  )
}
