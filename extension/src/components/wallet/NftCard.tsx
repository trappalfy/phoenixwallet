import type { ButtonHTMLAttributes } from 'react'
import type { Nft } from '../../mock/nfts'
import { nftArtStyle } from '../../lib/nftArt'

// The card is a grid item, so it cannot be wrapped without changing how it
// sizes. Extra attributes — `data-stagger`, for one — go straight on the button.
export default function NftCard({
  nft,
  onClick,
  ...rest
}: { nft: Nft; onClick?: () => void } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="overflow-hidden rounded-card border border-hairline bg-surface-1 text-left transition-[transform,background-color] duration-press ease-out hover:bg-surface-2 active:scale-[0.98]"
      {...rest}
    >
      <span className="block aspect-square w-full" style={nftArtStyle(nft.art)} aria-hidden />
      <span className="block px-2 py-2">
        <span className="block truncate text-13 text-text">{nft.name}</span>
        <span className="block truncate text-11 text-text-mute">{nft.collection}</span>
      </span>
    </button>
  )
}
