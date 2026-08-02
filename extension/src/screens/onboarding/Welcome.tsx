import PhoenixMark from '../../components/brand/PhoenixMark'
import Button from '../../components/primitives/Button'
import { useNav } from '../../router/useNav'

export default function Welcome() {
  const nav = useNav()

  return (
    <div className="flex h-full flex-col px-gutter pb-5 pt-16">
      <div className="flex flex-1 flex-col items-start justify-center">
        <PhoenixMark size={56} active />
        <h1 className="mt-6 font-display text-34 font-bold tracking-figure text-text">
          Perigee
        </h1>
        {/* One line, product-side and specific — not marketing copy centred in a product UI (§5.6). */}
        <p className="mt-2 max-w-[30ch] text-15 text-text-dim">
          Your keys stay on this device. Nothing is uploaded, so nothing can be handed over.
        </p>
      </div>

      {/* A single action: there is no import path, so the create/import chooser
          that used to sit between here and the password step had one option left
          and was a dead click. */}
      <Button block onClick={() => nav.push({ name: 'setPassword' })}>
        Create a new wallet
      </Button>
    </div>
  )
}
