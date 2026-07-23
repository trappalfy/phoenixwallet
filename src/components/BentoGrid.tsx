import { bento } from '../content/copy'
import BentoCard from './BentoCard'

// Asymmetric 2-wide + 2-narrow bento (brief §5): card 1 & 4 span two columns.
const SPANS = ['md:col-span-2', 'md:col-span-1', 'md:col-span-1', 'md:col-span-2']

export default function BentoGrid() {
  return (
    <section id="product" className="relative px-6 py-24 md:py-32">
      <div className="mx-auto max-w-[1200px]">
        <p data-reveal className="font-mono text-label uppercase text-smoke">
          {bento.label}
        </p>
        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {bento.cards.map((c, i) => (
            <BentoCard
              key={c.title}
              icon={c.icon}
              title={c.title}
              body={c.body}
              className={SPANS[i]}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
