import { useState } from 'react'
import BackBar from '../../components/shell/BackBar'
import Button from '../../components/primitives/Button'
import SeedGrid, { SeedCell } from '../../components/wallet/SeedGrid'
import { useNav } from '../../router/useNav'
import { useWallet } from '../../state/WalletProvider'
import { CONFIRM_POSITIONS, decoysFor } from '../../mock/db'
import { useShake } from '../../lib/motion'

/** Deterministic per mount; a reshuffle on every keystroke would be unusable. */
function shuffled<T>(items: readonly T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export default function SeedConfirm() {
  const nav = useNav()
  const { state } = useWallet()
  const phrase = state.phrase
  const [placed, setPlaced] = useState<Record<number, string>>({})
  const [wrongAt, setWrongAt] = useState<number | null>(null)
  const [shakeKey, setShakeKey] = useState(0)
  // Decoys come from the same pool as the phrase and are checked against it, so
  // the test is a real one — three chips for three slots would only test tapping.
  const [chips] = useState(() =>
    shuffled([...CONFIRM_POSITIONS.map((p) => phrase[p]), ...decoysFor(phrase)]),
  )

  // Only the cell that is wrong shakes; the other eleven hold still (§10).
  const shake = useShake(shakeKey, '[data-shake]')

  const nextSlot = CONFIRM_POSITIONS.find((p) => !placed[p]) ?? null
  const done = CONFIRM_POSITIONS.every((p) => placed[p])

  const place = (word: string) => {
    if (nextSlot === null) return
    if (phrase[nextSlot] !== word) {
      // Name the position that is wrong, not just "try again" (§6).
      setWrongAt(nextSlot)
      setShakeKey((k) => k + 1)
      return
    }
    setWrongAt(null)
    setPlaced((prev) => ({ ...prev, [nextSlot]: word }))
  }

  const used = new Set(Object.values(placed))

  return (
    <div className="flex h-full flex-col">
      <BackBar title="Confirm your phrase" />
      <div className="scroll-region flex-1 px-gutter pb-4">
        <p className="pb-3 text-13 text-text-dim">
          Fill in the three missing words to confirm you wrote the phrase down.
        </p>

        <div ref={shake}>
        <SeedGrid>
          {phrase.map((word, i) => {
            const isSlot = CONFIRM_POSITIONS.includes(i as (typeof CONFIRM_POSITIONS)[number])
            if (!isSlot) {
              return (
                <SeedCell key={i} index={i}>
                  <span className="text-text-dim">{word}</span>
                </SeedCell>
              )
            }
            const value = placed[i]
            const isWrong = wrongAt === i
            return (
              <div key={i} data-shake={isWrong ? '' : undefined}>
                <SeedCell
                  index={i}
                  tone={isWrong ? 'error' : value ? 'filled' : i === nextSlot ? 'active' : 'empty'}
                >
                  {value ?? <span className="text-text-mute">—</span>}
                </SeedCell>
              </div>
            )
          })}
        </SeedGrid>
        </div>

        {wrongAt !== null && (
          <p role="alert" className="mt-2.5 text-12 text-loss">
            That is not word {wrongAt + 1}. Check your written copy and try again.
          </p>
        )}

        <div className="mt-4">
          <p className="font-mono text-11 uppercase tracking-label text-text-mute">
            {nextSlot === null ? 'All three placed' : `Select word ${nextSlot + 1}`}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {chips.map((word) => {
              const spent = used.has(word)
              return (
                <button
                  key={word}
                  type="button"
                  disabled={spent || nextSlot === null}
                  onClick={() => place(word)}
                  className="rounded-pill border border-hairline bg-surface-2 px-3 py-1.5 font-mono text-13 text-text transition-[transform,opacity] duration-press ease-out hover:bg-surface-3 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-30"
                >
                  {word}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="shrink-0 px-gutter pb-5 pt-2">
        <Button block disabled={!done} onClick={() => nav.push({ name: 'ready' })}>
          Confirm
        </Button>
      </div>
    </div>
  )
}
