import BackBar from '../components/shell/BackBar'
import Button from '../components/primitives/Button'
import Pill from '../components/primitives/Pill'
import EmptyState from '../components/wallet/EmptyState'
import ChainGlyph from '../components/icons/ChainGlyph'
import { useWallet } from '../state/WalletProvider'
import { useNav } from '../router/useNav'
import { getChain } from '../mock/chains'
import { nftArtStyle } from '../lib/nftArt'
import * as api from '../mock/api'
import { Check, Send } from '../components/icons'

export default function NftDetail({ nftId }: { nftId: string }) {
  const { dispatch, account } = useWallet()
  const nav = useNav()

  const nft = api.getNft(nftId)

  if (!nft) {
    // Reachable after sending the collectible away, or if the account changed
    // underneath the screen. Say which, rather than showing an empty frame.
    return (
      <div className="flex h-full flex-col">
        <BackBar title="Collectible" />
        <EmptyState
          title="Not in this account"
          body="This collectible has left the wallet or belongs to another account."
          action={
            <Button variant="ghost" onClick={() => nav.reset({ name: 'home' })}>
              Back to wallet
            </Button>
          }
        />
      </div>
    )
  }

  const chain = getChain(nft.chainId)
  const isAvatar = account.avatarNftId === nft.id

  const setAvatar = () => {
    dispatch({ type: 'account/setAvatar', accountId: account.id, nftId: isAvatar ? null : nft.id })
    dispatch({
      type: 'toast/show',
      toast: {
        tone: 'success',
        message: isAvatar ? 'Avatar reset' : `${account.name} now shows ${nft.name}`,
      },
    })
    window.setTimeout(() => dispatch({ type: 'toast/hide' }), 2200)
  }

  const send = () => {
    dispatch({ type: 'draft/send', patch: { nftId: nft.id, to: '', amount: '1' } })
    nav.push({ name: 'sendTo' })
  }

  return (
    <div className="flex h-full flex-col">
      <BackBar title="Collectible" />

      <div className="scroll-region flex-1 px-gutter pb-4">
        {/* Capped, not full-width: a 328px square pushed the traits — the part
            that says what the thing is — entirely below the fold. */}
        <div
          className="mx-auto aspect-square w-full max-w-[248px] rounded-card border border-hairline"
          style={nftArtStyle(nft.art)}
          role="img"
          aria-label={`${nft.name}, ${nft.collection}`}
        />

        <div className="flex items-start justify-between gap-3 pt-3">
          <div className="min-w-0">
            <h1 className="truncate font-display text-22 font-bold tracking-display text-text">
              {nft.name}
            </h1>
            <p className="truncate text-13 text-text-dim">{nft.collection}</p>
          </div>
          <span className="flex shrink-0 items-center gap-1.5 pt-1" style={{ color: chain.tint }}>
            <ChainGlyph id={chain.id} size={16} />
            <span className="text-11 text-text-mute">{chain.name}</span>
          </span>
        </div>

        {isAvatar && (
          <div className="pt-2">
            <Pill tone="ember">
              <Check size={12} />
              Account avatar
            </Pill>
          </div>
        )}

        <p className="pb-1 pt-4 font-mono text-11 uppercase tracking-label text-text-mute">
          Token ID
        </p>
        <p className="font-mono text-13 tabular-nums text-text">#{nft.tokenId}</p>

        <p className="pb-1.5 pt-4 font-mono text-11 uppercase tracking-label text-text-mute">
          Traits
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {nft.traits.map((trait) => (
            <div
              key={trait.label}
              className="min-w-0 rounded-control border border-hairline bg-surface-1 px-2.5 py-2"
            >
              <p className="truncate text-11 text-text-mute">{trait.label}</p>
              <p className="truncate text-13 text-text">{trait.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex shrink-0 gap-2 px-gutter pb-5 pt-2">
        <Button className="flex-1" onClick={send}>
          <Send size={16} />
          Send
        </Button>
        <Button variant="ghost" className="flex-1" onClick={setAvatar}>
          {isAvatar ? 'Reset avatar' : 'Set as avatar'}
        </Button>
      </div>
    </div>
  )
}
