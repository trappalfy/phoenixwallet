import { useMemo } from 'react'
import BackBar from '../../components/shell/BackBar'
import Button from '../../components/primitives/Button'
import Field from '../../components/primitives/Field'
import Divider from '../../components/primitives/Divider'
import AccountAvatar from '../../components/wallet/AccountAvatar'
import { useWallet } from '../../state/WalletProvider'
import { useNav } from '../../router/useNav'
import { getChain } from '../../mock/chains'
import { addressFor } from '../../mock/db'
import { checkRecipient } from '../../lib/address'
import { formatCounterparty, truncateAddress } from '../../lib/format'
import { nftArtStyle } from '../../lib/nftArt'
import * as api from '../../mock/api'

export default function SendTo() {
  const { state, dispatch, account } = useWallet()
  const nav = useNav()
  const chain = getChain(state.activeChainId)
  const to = state.drafts.send.to
  // A collectible has no amount to choose, so that step is skipped entirely
  // rather than shown with a disabled input reading "1".
  const nft = state.drafts.send.nftId ? api.getNft(state.drafts.send.nftId) : undefined

  const check = useMemo(
    () => checkRecipient(to, chain.format, chain.name),
    [to, chain.format, chain.name],
  )

  // Counterparties already seen on this chain, most recent first.
  const recent = useMemo(() => {
    const seen = new Set<string>()
    return state.activity
      .filter((a) => a.kind === 'send' && !seen.has(a.counterparty) && seen.add(a.counterparty))
      .slice(0, 3)
      .map((a) => a.counterparty)
  }, [state.activity])

  const others = state.accounts.filter((a) => a.id !== account.id)
  const setTo = (value: string) => dispatch({ type: 'draft/send', patch: { to: value } })

  return (
    <div className="flex h-full flex-col">
      <BackBar title={nft ? 'Send collectible' : 'Send'} />
      <div className="scroll-region flex-1 px-gutter pb-4">
        {nft && (
          <div className="mb-3 flex items-center gap-3 rounded-card border border-hairline bg-surface-1 p-2.5">
            <span
              className="h-10 w-10 shrink-0 rounded-control"
              style={nftArtStyle(nft.art)}
              aria-hidden
            />
            <span className="min-w-0">
              <span className="block truncate text-13 text-text">{nft.name}</span>
              <span className="block truncate text-11 text-text-mute">{nft.collection}</span>
            </span>
          </div>
        )}

        <Field
          label={`Recipient on ${chain.name}`}
          mono
          autoFocus
          spellCheck={false}
          placeholder={chain.format === 'bitcoin' ? 'bc1…' : '0x… or a name'}
          value={to}
          onChange={(e) => setTo(e.target.value)}
          error={to.trim() && !check.ok ? check.reason : undefined}
          hint={check.ok && check.kind === 'name' ? 'Sending to a name, not an address.' : undefined}
        />

        {recent.length > 0 && (
          <>
            <p className="pb-1 pt-4 font-mono text-11 uppercase tracking-label text-text-mute">
              Recent
            </p>
            <div className="space-y-0.5">
              {recent.map((addr) => (
                <button
                  key={addr}
                  type="button"
                  onClick={() => setTo(addr)}
                  className="flex h-10 w-full items-center rounded-control px-2 text-left font-mono text-12 text-text-dim transition-colors duration-state ease-out hover:bg-surface-1 hover:text-text"
                >
                  {formatCounterparty(addr)}
                </button>
              ))}
            </div>
          </>
        )}

        {/* A wallet with one account has nothing to list here, and an empty
            heading over empty space reads as a bug. */}
        {others.length > 0 && (
          <>
            <Divider className="my-4" />

            <p className="pb-1 font-mono text-11 uppercase tracking-label text-text-mute">
              My accounts
            </p>
            <div className="space-y-0.5">
              {others.map((a) => {
                const addr = addressFor(a, state.activeChainId)
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setTo(addr)}
                    className="flex h-row w-full items-center gap-3 rounded-control px-2 text-left transition-colors duration-state ease-out hover:bg-surface-1"
                  >
                    <AccountAvatar address={addr} size={30} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-15 text-text">{a.name}</span>
                      <span className="block font-mono text-11 text-text-mute">
                        {truncateAddress(addr)}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>

      <div className="shrink-0 px-gutter pb-5 pt-2">
        <Button
          block
          disabled={!check.ok}
          onClick={() => nav.push({ name: nft ? 'sendReview' : 'sendAmount' })}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
