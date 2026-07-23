import { hero } from '../content/copy'
import { NetworkMark } from '../lib/icons'

export default function Hero({ onWaitlist }: { onWaitlist: () => void }) {
  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] flex-col justify-between px-6 pb-10 pt-[68px]"
    >
      {/* scrim: darkens top + left (where all the text lives) so body copy keeps
          ≥4.5:1 over the shader, while the molten band still glows bottom-right */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(7,6,10,0.72) 0%, rgba(7,6,10,0.18) 44%, rgba(7,6,10,0) 62%), linear-gradient(90deg, rgba(7,6,10,0.82) 0%, rgba(7,6,10,0.32) 42%, rgba(7,6,10,0) 70%)',
        }}
      />

      {/* centre block */}
      <div className="relative mx-auto flex w-full max-w-[1200px] flex-1 flex-col justify-center">
        <div
          data-load="eyebrow"
          className="inline-flex w-fit items-center rounded-pill border border-hairline bg-bone/[0.03] px-3.5 py-1.5 font-mono text-label uppercase text-smoke"
        >
          {hero.eyebrow}
        </div>

        <h1 className="mt-7 leading-[0.92]">
          <span className="block overflow-hidden pb-[0.1em]">
            <span
              data-load="line"
              className="block font-display font-medium tracking-display text-bone"
              style={{ fontSize: 'clamp(1.25rem, 3.3vw, 3rem)' }}
            >
              {hero.line1}
            </span>
          </span>
          <span className="block overflow-hidden pb-[0.1em]">
            <span
              data-load="line"
              className="block font-display text-hero font-bold tracking-display text-bone"
            >
              {hero.line2}
            </span>
          </span>
        </h1>

        <p data-load="sub" className="mt-7 max-w-prose text-body text-smoke">
          {hero.sub}
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          <button
            data-load="cta"
            data-magnetic
            onClick={onWaitlist}
            className="rounded-pill bg-ember px-6 py-3.5 text-[15px] font-medium text-void transition-opacity hover:opacity-90"
          >
            {hero.ctaPrimary}
          </button>
          <button
            data-load="cta"
            onClick={onWaitlist}
            className="rounded-pill border border-hairline px-6 py-3.5 text-[15px] text-bone transition-colors hover:border-bone/25"
          >
            {hero.ctaSecondary}
          </button>
        </div>
      </div>

      {/* network row pinned to the bottom */}
      <div className="relative mx-auto w-full max-w-[1200px]">
        <p data-load="net" className="font-mono text-label uppercase text-smoke/70">
          {hero.networksLabel}
        </p>
        <ul className="mt-4 flex flex-wrap items-center gap-x-7 gap-y-4">
          {hero.networks.map((n) => (
            <li
              key={n.id}
              data-load="net"
              className="flex items-center gap-2 text-smoke/40 transition-all duration-300 hover:scale-[1.06] hover:text-bone"
            >
              <NetworkMark id={n.id} className="h-5 w-5" />
              <span className="font-mono text-[12px] uppercase tracking-[0.08em]">
                {n.name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
