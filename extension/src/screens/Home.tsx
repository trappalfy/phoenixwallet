import { useMemo } from 'react'
import { useWallet } from '../state/WalletProvider'
import { useNav } from '../router/useNav'
import { usdValue } from '../mock/tokens'
import { dayLabel } from '../lib/format'
import BalanceHero from '../components/wallet/BalanceHero'
import ActionRow from '../components/wallet/ActionRow'
import TokenRow from '../components/wallet/TokenRow'
import NftCard from '../components/wallet/NftCard'
import ActivityRow from '../components/wallet/ActivityRow'
import Tabs from '../components/primitives/Tabs'
import Button from '../components/primitives/Button'
import EmptyState from '../components/wallet/EmptyState'
import { useListStagger } from '../lib/motion'

const TABS = [
  { id: 'tokens', label: 'Tokens' },
  { id: 'nfts', label: 'NFTs' },
  { id: 'activity', label: 'Activity' },
] as const

/** Anything under a dollar is "small"; it also catches the zero-balance holding. */
const SMALL_BALANCE_USD = 1

export default function Home({ tab: tabParam }: { tab?: (typeof TABS)[number]['id'] }) {
  const { state, dispatch, tokens } = useWallet()
  const nav = useNav()
  // The route, not local state, owns which sub-tab is showing — the bottom
  // tab bar's Activity button opens Home on this same route with `tab:
  // 'activity'`, and a value that only lives in local state could never be
  // driven from outside the screen that holds it.
  const tab = tabParam ?? 'tokens'

  const { hideSmallBalances, currency } = state.prefs

  // Replays when the visible set changes — switching tab, account, network or
  // the small-balance filter all rebuild the list underneath.
  const rows = useListStagger([tab, state.activeAccountId, state.activeChainId, hideSmallBalances])

  const visibleTokens = useMemo(
    () => (hideSmallBalances ? tokens.filter((t) => usdValue(t) >= SMALL_BALANCE_USD) : tokens),
    [tokens, hideSmallBalances],
  )
  const hiddenCount = tokens.length - visibleTokens.length

  const activityByDay = useMemo(() => {
    const groups = new Map<string, typeof state.activity>()
    for (const entry of state.activity) {
      const key = dayLabel(entry.at)
      groups.set(key, [...(groups.get(key) ?? []), entry])
    }
    return [...groups.entries()]
  }, [state.activity])

  return (
    <div className="flex h-full flex-col">
      <BalanceHero />
      <ActionRow />

      <div className="mt-4 px-gutter">
        <Tabs
          items={TABS}
          active={tab}
          onChange={(next) => nav.replace({ name: 'home', tab: next })}
          label="Wallet contents"
        />
      </div>

      <div ref={rows} className="scroll-region min-h-0 flex-1 px-gutter pb-3">
        {tab === 'tokens' && (
          <>
            <div className="flex items-center justify-between gap-2 py-2">
              <label className="flex cursor-pointer items-center gap-2 text-12 text-text-dim">
                <input
                  type="checkbox"
                  checked={hideSmallBalances}
                  onChange={(e) =>
                    dispatch({ type: 'prefs/set', patch: { hideSmallBalances: e.target.checked } })
                  }
                  className="h-3.5 w-3.5 accent-ember"
                />
                Hide small balances
              </label>
              {hiddenCount > 0 && (
                <span className="font-mono text-11 tabular-nums text-text-mute">
                  {hiddenCount} hidden
                </span>
              )}
            </div>

            {visibleTokens.length === 0 ? (
              <EmptyState
                title="No tokens yet"
                body="Assets you receive on this network show up here."
                action={<Button onClick={() => nav.push({ name: 'receive' })}>Receive</Button>}
              />
            ) : (
              <>
                {/* 12ms stagger, first eight rows (§10). The attribute marks what
                    counts as a row; the hook does the slicing. */}
                <div className="space-y-0.5">
                  {visibleTokens.map((token) => (
                    <div key={token.id} data-stagger>
                      <TokenRow token={token} currency={currency} />
                    </div>
                  ))}
                </div>
                <div className="pt-2 text-center">
                  <Button variant="quiet" onClick={() => nav.push({ name: 'settings' })}>
                    Manage tokens
                  </Button>
                </div>
              </>
            )}
          </>
        )}

        {tab === 'nfts' &&
          (state.nfts.length === 0 ? (
            <EmptyState
              title="No collectibles yet"
              body="Collectibles you hold on this network show up here."
              action={<Button onClick={() => nav.push({ name: 'receive' })}>Receive</Button>}
            />
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-2">
              {state.nfts.map((nft) => (
                <NftCard
                  key={nft.id}
                  nft={nft}
                  data-stagger
                  onClick={() => nav.push({ name: 'nftDetail', nftId: nft.id })}
                />
              ))}
            </div>
          ))}

        {tab === 'activity' &&
          (state.activity.length === 0 ? (
            <EmptyState
              title="No activity yet"
              body="Transactions on this network show up here."
              action={<Button onClick={() => nav.push({ name: 'receive' })}>Receive</Button>}
            />
          ) : (
            <div className="pt-1">
              {activityByDay.map(([day, entries]) => (
                <div key={day}>
                  <p className="pb-0.5 pt-2 font-mono text-11 uppercase tracking-label text-text-mute">
                    {day}
                  </p>
                  <div className="space-y-0.5">
                    {entries.map((entry) => (
                      <div key={entry.id} data-stagger>
                        <ActivityRow
                          entry={entry}
                          onClick={() => nav.push({ name: 'activityDetail', activityId: entry.id })}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
      </div>
    </div>
  )
}
