import { brand, footer } from '../content/copy'
import { Logo } from '../lib/icons'

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-hairline bg-void px-6 py-16">
      <div className="mx-auto grid max-w-[1200px] gap-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2">
            <Logo className="h-6 w-6 text-ember" />
            <span className="font-display text-[19px] font-bold tracking-display text-bone">
              {brand.name}
            </span>
          </div>
          <p className="mt-4 max-w-[34ch] text-[13px] leading-relaxed text-smoke">
            {footer.smallprint}
          </p>
        </div>

        {footer.columns.map((col) => (
          <div key={col.heading}>
            <p className="font-mono text-label uppercase text-smoke">{col.heading}</p>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((link) => (
                <li key={link}>
                  <a href="#" className="text-[14px] text-bone/80 transition-colors hover:text-ember">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-14 flex max-w-[1200px] items-center justify-between border-t border-hairline pt-6">
        <p className="font-mono text-[12px] text-smoke">{footer.copyright}</p>
        <p className="font-mono text-[12px] text-smoke/60">Non-custodial · Your keys</p>
      </div>
    </footer>
  )
}
