import { security } from '../content/copy'
import { BentoIcon } from '../lib/icons'
import AbsorbField from './AbsorbField'

export default function Security() {
  return (
    <section id="security" className="relative px-6 py-24 md:py-32">
      {/* Dots stream into the enclave and dissolve there — light goes in, and
          nothing continues out the other side to a server. That's the product
          thesis rendered as a graphic (brief §4). One field centred on the icon
          (viewport centre), so it reads as a single composition. */}
      <div className="edge-fade-y pointer-events-none absolute inset-0 overflow-hidden">
        <AbsorbField className="inset-x-0 top-[-140px] h-[540px]" intensity={1.15} />
      </div>

      <div className="relative z-10 mx-auto max-w-[1080px]">
        <div
          data-absorb-center
          className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-[18px] border border-subtle bg-surface [box-shadow:0_0_60px_-16px_rgba(139,92,246,0.6)]"
        >
          <BentoIcon name="enclave" className="h-8 w-8 text-accent-500" />
        </div>

        <h2
          data-reveal
          className="text-center font-display text-section font-bold tracking-display text-ink"
        >
          {security.heading}
        </h2>

        <div className="mt-14 grid gap-x-12 gap-y-10 md:grid-cols-2">
          {/* proof points */}
          <ul className="space-y-6">
            {security.proofs.map((p) => (
              <li key={p.label} data-reveal className="border-t border-subtle pt-5">
                <p className="font-mono text-label uppercase text-accent-400">{p.label}</p>
                <p className="mt-2 text-body text-ink/90">{p.body}</p>
              </li>
            ))}
          </ul>

          {/* inverted "can't do" list */}
          <div data-reveal className="rounded-card border border-subtle bg-surface p-8">
            <h3 className="font-display text-[22px] font-medium tracking-[-0.02em] text-ink">
              {security.cantHeading}
            </h3>
            <ul className="mt-6 space-y-3.5 font-mono text-[15px]">
              {security.cant.map((item) => (
                <li key={item} className="flex items-baseline gap-3">
                  <span className="text-accent-500 line-through">—</span>
                  <span className="text-haze line-through decoration-accent-500/40 decoration-2">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p data-reveal className="mx-auto mt-12 max-w-prose text-center text-[14px] leading-relaxed text-haze">
          {security.footnote}
        </p>
      </div>
    </section>
  )
}
