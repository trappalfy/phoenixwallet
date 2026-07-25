import { useState } from 'react'
import { finalCta } from '../content/copy'
import { useFakeSubmit } from '../hooks/useFakeSubmit'

export default function FinalCta() {
  const [email, setEmail] = useState('')
  const { status, submit, reset } = useFakeSubmit()
  const done = status === 'done'

  return (
    <section className="relative overflow-hidden px-6 pb-32 pt-16 md:pb-40 md:pt-20">
      {/* Flat warm horizon rising to the bottom edge. A radial "dome" here peaks
          at the seam and, meeting the footer's upward-peaking dawn, formed a
          bright cusp (a visible line). A flat vertical gradient has no horizontal
          variation, and its top-of-seam color + near-zero slope are mirrored by
          .footer__dawn — so the boundary has no step and no cusp. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3"
        style={{
          background:
            'linear-gradient(to top, rgba(255,116,48,0.15) 0%, rgba(255,104,44,0.14) 5%, rgba(198,68,28,0.095) 20%, rgba(122,30,0,0.045) 38%, transparent 62%)',
        }}
      />

      <div className="relative mx-auto max-w-[720px] text-center">
        <h2
          data-reveal
          className="font-display text-section font-bold tracking-display text-bone"
        >
          {finalCta.headline}
        </h2>

        {done ? (
          <div
            data-reveal
            className="mx-auto mt-10 flex max-w-md items-center justify-center gap-2 rounded-input border border-hairline bg-soot px-5 py-4 font-mono text-[14px] text-bone"
          >
            <span className="text-ember">✓</span>
            <span className="truncate">{email}</span>
            <span className="text-smoke">·</span>
            <span>{finalCta.success}</span>
          </div>
        ) : (
          <form
            data-reveal
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              submit(email)
            }}
            className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <div className="flex-1 text-left">
              <label htmlFor="cta-email" className="sr-only">
                Email address
              </label>
              <input
                id="cta-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder={finalCta.emailPlaceholder}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (status === 'error') reset()
                }}
                aria-invalid={status === 'error'}
                className="w-full rounded-input border border-hairline bg-soot px-4 py-3.5 font-mono text-[14px] text-bone placeholder:text-smoke/60 focus:border-ember/50"
              />
              {status === 'error' && (
                <p role="alert" className="mt-2 font-mono text-[12px] text-ember">
                  {finalCta.invalid}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="rounded-pill bg-ember px-6 py-3.5 text-[15px] font-medium text-void transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {status === 'submitting' ? 'Adding you…' : finalCta.button}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
