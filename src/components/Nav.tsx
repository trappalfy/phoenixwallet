import { brand, nav, product } from '../content/copy'
import { Arrow } from '../lib/icons'
import { canInstallExtension } from '../lib/browser'
import { useScrolled } from '../hooks/useScrolled'

const PILL =
  'group flex items-center gap-2 rounded-pill py-1.5 pl-4 pr-1.5 text-[15px] font-medium transition-transform'
const BADGE = 'grid h-7 w-7 place-items-center rounded-pill transition-transform duration-300'

/**
 * Store CTA. Three states, one shape:
 *  - not a desktop Chromium browser → inert, says so;
 *  - listing approved (chromeStoreUrl set) → link to the Web Store;
 *  - still pending → waitlist modal (extension/store/README.md step 7).
 */
function StoreCta({ onWaitlist }: { onWaitlist: () => void }) {
  if (!canInstallExtension) {
    return (
      <span
        aria-disabled="true"
        className={`${PILL} cursor-not-allowed border border-hairline bg-bone/[0.04] text-smoke`}
      >
        {product.unsupportedLabel}
        <span className={`${BADGE} bg-bone/[0.06]`}>
          <Arrow className="h-3.5 w-3.5 text-smoke" />
        </span>
      </span>
    )
  }

  const inner = (
    <>
      {nav.cta}
      <span className={`${BADGE} bg-void group-hover:rotate-45`}>
        <Arrow className="h-3.5 w-3.5 text-ember" />
      </span>
    </>
  )
  const live = `${PILL} bg-ember text-void hover:scale-[1.02]`

  return product.chromeStoreUrl ? (
    <a href={product.chromeStoreUrl} target="_blank" rel="noopener noreferrer" className={live}>
      {inner}
    </a>
  ) : (
    <button onClick={onWaitlist} className={live}>
      {inner}
    </button>
  )
}

/** `hrefBase` is '/' on the install page so the section anchors still resolve. */
export default function Nav({
  onWaitlist,
  hrefBase = '',
}: {
  onWaitlist: () => void
  hrefBase?: string
}) {
  const scrolled = useScrolled(40)

  return (
    <header
      data-load="nav"
      className={`fixed inset-x-0 top-0 z-50 h-[68px] border-b transition-colors duration-300 ${
        scrolled ? 'border-hairline bg-void/[0.88] backdrop-blur-md' : 'border-transparent'
      }`}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-6"
      >
        <a
          href={`${hrefBase}#top`}
          className="flex items-center gap-2"
          aria-label={`${brand.name} — home`}
        >
          <img src="/brand/phoenix-mark.png" alt="" className="h-6 w-auto" />
          <span className="font-display text-[19px] font-bold tracking-display text-bone">
            {brand.name}
          </span>
        </a>

        <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 font-sans text-[15px] md:flex">
          {nav.links.map((l) => (
            <li key={l.label}>
              <a href={l.href.startsWith('#') ? `${hrefBase}${l.href}` : l.href} className="nav-link">
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4">
          <StoreCta onWaitlist={onWaitlist} />
        </div>
      </nav>
    </header>
  )
}
