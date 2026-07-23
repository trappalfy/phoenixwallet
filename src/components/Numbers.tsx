import { numbers } from '../content/copy'
import Marquee from './Marquee'

export default function Numbers() {
  return (
    <section id="networks" className="relative px-6 pb-24 pt-24 md:pb-28 md:pt-32">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-4">
          {numbers.stats.map((s) => (
            <div key={s.label} data-reveal>
              <p
                data-counter
                data-value={s.value}
                data-prefix={s.prefix}
                data-suffix={s.suffix}
                className="font-display text-[clamp(2.5rem,5vw,4rem)] font-bold leading-none tracking-display text-bone"
              >
                {s.prefix}
                {s.value}
                {s.suffix}
              </p>
              <p className="mt-3 font-mono text-label uppercase text-smoke">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
      <Marquee />
    </section>
  )
}
