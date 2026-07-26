import { useState } from 'react'
import BackBar from '../../components/shell/BackBar'
import Button from '../../components/primitives/Button'
import Field from '../../components/primitives/Field'
import EmptyState from '../../components/wallet/EmptyState'
import AccountFace from '../../components/wallet/AccountFace'
import { useWallet } from '../../state/WalletProvider'
import { useNav } from '../../router/useNav'
import { addressFor } from '../../mock/db'
import { truncateAddress } from '../../lib/format'

const MAX = 30

export default function RenameAccount({ accountId }: { accountId: string }) {
  const { state, dispatch } = useWallet()
  const nav = useNav()

  const account = state.accounts.find((a) => a.id === accountId)
  const [name, setName] = useState(account?.name ?? '')

  if (!account) {
    return (
      <div className="flex h-full flex-col">
        <BackBar title="Rename account" />
        <EmptyState
          title="Account not found"
          body="It may have been removed while this screen was open."
          action={
            <Button variant="ghost" onClick={() => nav.reset({ name: 'accountList' })}>
              Back to accounts
            </Button>
          }
        />
      </div>
    )
  }

  const trimmed = name.trim()
  const taken = state.accounts.some(
    (a) => a.id !== account.id && a.name.toLowerCase() === trimmed.toLowerCase(),
  )
  const error = !trimmed
    ? 'An account needs a name.'
    : taken
      ? 'You already have an account with that name.'
      : undefined

  const save = () => {
    dispatch({ type: 'account/rename', accountId: account.id, name: trimmed })
    dispatch({ type: 'toast/show', toast: { tone: 'success', message: `Renamed to ${trimmed}` } })
    window.setTimeout(() => dispatch({ type: 'toast/hide' }), 2200)
    nav.back()
  }

  return (
    <div className="flex h-full flex-col">
      <BackBar title="Rename account" />

      <div className="scroll-region flex-1 px-gutter pb-4">
        <div className="flex items-center gap-3 rounded-card border border-hairline bg-surface-1 p-3">
          <AccountFace account={account} size={34} />
          <span className="min-w-0">
            <span className="block truncate text-13 text-text">{account.name}</span>
            <span className="block truncate font-mono text-11 text-text-mute">
              {truncateAddress(addressFor(account, state.activeChainId))}
            </span>
          </span>
        </div>

        <div className="pt-4">
          <Field
            label="Name"
            autoFocus
            maxLength={MAX}
            value={name}
            onChange={(e) => setName(e.target.value)}
            // An empty field is only an error once the user has emptied it, not
            // on a screen they just opened.
            error={name.length > 0 ? error : undefined}
            hint={`${trimmed.length} of ${MAX} characters. The name is local to this wallet.`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && trimmed && !taken) save()
            }}
          />
        </div>
      </div>

      <div className="shrink-0 px-gutter pb-5 pt-2">
        <Button block disabled={!trimmed || taken} onClick={save}>
          Save
        </Button>
      </div>
    </div>
  )
}
