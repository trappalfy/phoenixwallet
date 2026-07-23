import { useState } from 'react'
import { finalCta } from '../content/copy'
import { useFakeSubmit } from '../hooks/useFakeSubmit'

export default function FinalCta() {
  const [email, setEmail] = useState('')
  const { status, submit, reset } = useFakeSubmit()
  const done = status === 'done'

  return (
    <section className="relative overflow-hidden px-6 py-32 md:py-40">
      {/* shader returns as a bottom-edge glow (~35%); CSS is enough here */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3"
        style={{
          background:
            'radial-gradient(85% 78% at 50% 118%, rgba(255,169,61,0.30), rgba(255,90,31,0.24) 30%, rgba(122,30,0,0.14) 55%, transparent 78%)',
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
