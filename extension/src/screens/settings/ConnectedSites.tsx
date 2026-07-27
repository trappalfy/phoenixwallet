import BackBar from '../../components/shell/BackBar'
import Button from '../../components/primitives/Button'
import AccountFace from '../../components/wallet/AccountFace'
import EmptyState from '../../components/wallet/EmptyState'
import { useWallet } from '../../state/WalletProvider'
import { useNav } from '../../router/useNav'

export default function ConnectedSites() {
  const { state, dispatch } = useWallet()
  const nav = useNav()

  const disconnect = (id: string, host: string) => {
    dispatch({ type: 'sites/disconnect', id })
    dispatch({ type: 'toast/show', toast: { tone: 'success', message: `Disconnected from ${host}` } })
    window.setTimeout(() => dispatch({ type: 'toast/hide' }), 2400)
  }

  return (
    <div className="flex h-full flex-col">
      <BackBar title="Connected sites" />

      <div className="scroll-region flex-1 px-gutter pb-4">
        {state.connectedSites.length === 0 ? (
          <EmptyState
            title="No sites connected"
            body="Sites you connect to will be listed here, with the account each one can see."
            action={
              <Button variant="ghost" onClick={() => nav.back()}>
                Back to settings
              </Button>
            }
          />
        ) : (
          <>
            <p className="pb-2 text-12 text-text-dim">
              These sites can see the account listed. They can ask you to sign; they cannot move
              anything on their own.
            </p>

            <div className="space-y-1.5">
              {state.connectedSites.map((site) => {
                const account = state.accounts.find((a) => a.id === site.accountId)
                return (
                  <div
                    key={site.id}
                    className="rounded-card border border-hairline bg-surface-1 p-3"
                  >
                    <div className="flex items-start gap-2.5">
                      {/* The site's initial, drawn here — a favicon would be a
                          remote image, which the manifest CSP forbids (§2.4). */}
                      <span
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-control border border-hairline bg-surface-2 font-display text-15 font-bold text-text-dim"
                        aria-hidden
                      >
                        {site.host[0].toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-mono text-13 text-text">{site.host}</p>
                        <p className="truncate text-11 text-text-mute">{site.connectedAt}</p>
                      </div>
                    </div>

                    <p className="pt-2.5 text-12 text-text-dim">{site.permission}</p>

                    <div className="flex items-center justify-between gap-2 pt-2.5">
                      <span className="flex min-w-0 items-center gap-2">
                        {account && <AccountFace account={account} size={20} />}
                        <span className="min-w-0 truncate text-12 text-text-dim">
                          {account?.name ?? 'Removed account'}
                        </span>
                      </span>
                      <Button
                        variant="danger"
                        className="min-h-9 shrink-0 px-3 text-13"
                        onClick={() => disconnect(site.id, site.host)}
                      >
                        Disconnect
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
