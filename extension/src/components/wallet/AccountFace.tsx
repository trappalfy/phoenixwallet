import type { Account } from '../../mock/db'
import { NFTS } from '../../mock/nfts'
import { nftArtStyle } from '../../lib/nftArt'
import AccountAvatar from './AccountAvatar'

/**
 * How an account is pictured: the collectible it was given on NftDetail, or the
 * generated identicon.
 *
 * The identicon is seeded from the account's EVM address rather than its address
 * on the active network. Those differ per address format, so seeding from the
 * active one made an account's face change when the user switched to Solana —
 * the account has not changed, and its picture should not either.
 */
export default function AccountFace({ account, size = 24 }: { account: Account; size?: number }) {
  const nft = account.avatarNftId ? NFTS.find((n) => n.id === account.avatarNftId) : undefined

  if (nft) {
    return (
      <span
        className="block shrink-0 rounded-pill"
        style={{ width: size, height: size, ...nftArtStyle(nft.art) }}
        aria-hidden
      />
    )
  }

  return <AccountAvatar address={account.addresses.evm} size={size} />
}
