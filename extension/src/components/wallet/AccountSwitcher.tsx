import { useState } from 'react'
import { useWallet } from '../../state/WalletProvider'
import { addressFor } from '../../mock/db'
import { truncateAddress } from '../../lib/format'
import AccountFace from './AccountFace'
import Sheet from '../primitives/Sheet'
import Field from '../primitives/Field'
import Button from '../primitives/Button'
import { useNav } from '../../router/useNav'
import { ChevronDown, Check } from '../icons'

export default function AccountSwitcher() {
  const { state, dispatch, account } = useWallet()
  const nav = useNav()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const matches = state.accounts.filter((a) =>
    a.name.toLowerCase().includes(query.trim().toLowerCase()),
  )

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="flex min-h-10 min-w-0 items-center gap-1.5 rounded-pill px-1.5 text-text transition-colors duration-state ease-out hover:bg-surface-2"
      >
        <AccountFace account={account} size={22} />
        {/* truncate + min-w-0 keeps a 30-character account name from breaking the header (§11) */}
        <span className="min-w-0 truncate text-13">{account.name}</span>
        <ChevronDown size={14} className="shrink-0 text-text-mute" />
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} title="Accounts">
        <Field
          label="Search"
          placeholder="Account name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="mt-3 space-y-1">
          {matches.map((a) => {
            const active = a.id === state.activeAccountId
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => {
                  dispatch({ type: 'account/select', accountId: a.id })
                  setOpen(false)
                }}
                className="flex w-full items-center gap-3 rounded-control px-2 py-2 text-left transition-colors duration-state ease-out hover:bg-surface-3"
              >
                <AccountFace account={a} size={32} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-15 text-text">{a.name}</span>
                  <span className="block font-mono text-11 text-text-mute">
                    {truncateAddress(addressFor(a, state.activeChainId))}
                  </span>
                </span>
                {active && <Check size={18} className="shrink-0 text-ember" />}
              </button>
            )
          })}
          {matches.length === 0 && (
            <p className="py-6 text-center text-13 text-text-dim">No account by that name.</p>
          )}
        </div>

        {/* The sheet switches; adding, renaming and comparing balances happens on
            the full screen, which has the room for it (§9.7). */}
        <div className="pt-2 text-center">
          <Button
            variant="quiet"
            onClick={() => {
              setOpen(false)
              nav.push({ name: 'accountList' })
            }}
          >
            Manage accounts
          </Button>
        </div>
      </Sheet>
    </>
  )
}
