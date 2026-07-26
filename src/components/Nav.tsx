import { brand, nav } from '../content/copy'
import { Arrow } from '../lib/icons'
import { useScrolled } from '../hooks/useScrolled'

export default function Nav({ onWaitlist }: { onWaitlist: () => void }) {
  const scrolled = useScrolled(40)

  return (
    <header
      data-load="nav"
      className={`fixed inset-x-0 top-0 z-50 h-[68px] border-b transition-colors duration-300 ${
        scrolled
          ? 'border-hairline bg-void/[0.88] backdrop-blur-md'
          : 'border-transparent'
      }`}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-6"
      >
        <a href="#top" className="flex items-center gap-2" aria-label={`${brand.name} — home`}>
          <img src="/brand/phoenix-mark.png" alt="" className="h-6 w-auto" />
          <span className="font-display text-[19px] font-bold tracking-display text-bone">
            {brand.name}
          </span>
        </a>

        <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 font-sans text-[15px] md:flex">
          {nav.links.map((l) => (
            <li key={l.label}>
              <a href={l.href} className="nav-link">
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4">
          <button
            onClick={onWaitlist}
            className="group flex items-center gap-2 rounded-pill bg-ember py-1.5 pl-4 pr-1.5 text-[15px] font-medium text-void transition-transform hover:scale-[1.02]"
          >
            {nav.cta}
            <span className="grid h-7 w-7 place-items-center rounded-pill bg-void transition-transform duration-300 group-hover:rotate-45">
              <Arrow className="h-3.5 w-3.5 text-ember" />
            </span>
          </button>
        </div>
      </nav>
    </header>
  )
}
