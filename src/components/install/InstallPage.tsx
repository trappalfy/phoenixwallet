import { useState } from 'react'
import { install, product } from '../../content/copy'
import { BentoIcon } from '../../lib/icons'
import { canInstallExtension } from '../../lib/browser'
import Nav from '../Nav'
import WaitlistModal from '../WaitlistModal'
import GrainOverlay from '../GrainOverlay'

function DownloadArrow(props: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden {...props}>
      <path
        d="M8 2.5v7M4.8 6.6 8 9.8l3.2-3.2M3.2 12.8h9.6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Step({ step, index }: { step: (typeof install.steps)[number]; index: number }) {
  return (
    <li className="relative flex flex-col rounded-card border border-subtle bg-surface p-6">
      <div className="flex items-start justify-between">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-input bg-elevated text-accent-400">
          <BentoIcon name={step.icon} className="h-5 w-5" />
        </span>
        <span
          aria-hidden
          className="font-display text-[28px] font-bold leading-none tracking-display text-ink/15"
        >
          {index + 1}
        </span>
      </div>

      <h3 className="mt-6 font-display text-[19px] font-medium tracking-[-0.02em] text-ink">
        {step.title}
      </h3>
      <p className="mt-2 text-[14px] leading-relaxed text-haze">
        {step.body}
        {'code' in step && step.code && (
          <>
            {' '}
            {/* Never a link: Chrome blocks navigation to chrome:// from a page,
                so an <a> here would silently do nothing. Copyable text instead. */}
            <code className="rounded bg-elevated px-1.5 py-0.5 font-mono text-[13px] text-ink">
              {step.code}
            </code>{' '}
            {step.bodyAfter}
          </>
        )}
      </p>
    </li>
  )
}

export default function InstallPage() {
  const [waitlistOpen, setWaitlistOpen] = useState(false)

  return (
    <div className="relative min-h-screen bg-base">
      <Nav onWaitlist={() => setWaitlistOpen(true)} hrefBase="/" />

      <main className="mx-auto max-w-[1200px] px-6 pb-24 pt-[120px] md:pb-32 md:pt-[152px]">
        <p className="inline-flex w-fit items-center rounded-pill border border-subtle bg-ink/[0.03] px-3.5 py-1.5 font-mono text-label uppercase text-haze">
          {install.eyebrow}
        </p>

        <h1 className="mt-7 font-display text-[clamp(2.25rem,6vw,4.25rem)] font-bold leading-[1.02] tracking-display text-ink">
          <span className="block">{install.line1}</span>
          <span className="block">{install.line2}</span>
        </h1>

        <p className="mt-6 max-w-prose text-body text-haze">{install.sub}</p>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          <a
            href={product.downloadUrl}
            download
            className="group flex items-center gap-3 rounded-pill bg-accent-500 py-1.5 pl-5 pr-1.5 text-[15px] font-medium text-base transition-transform hover:scale-[1.02]"
          >
            {install.download}
            <span className="grid h-8 w-8 place-items-center rounded-pill bg-base transition-transform duration-300 group-hover:translate-y-0.5">
              <DownloadArrow className="h-4 w-4 text-accent-500" />
            </span>
          </a>
          <a
            href="/#security"
            className="rounded-pill border border-subtle px-6 py-3.5 text-[15px] text-ink transition-colors hover:border-ink/25"
          >
            {install.secondary} <span aria-hidden>→</span>
          </a>
        </div>

        <p className="mt-4 max-w-prose font-mono text-[12px] leading-relaxed text-haze/70">
          v{product.downloadVersion} · {install.updateNote}
        </p>
        {product.downloadSha256 && (
          <p className="mt-1.5 max-w-prose select-all break-all font-mono text-[11px] leading-relaxed text-haze/40">
            SHA-256 {product.downloadSha256}
          </p>
        )}

        {!canInstallExtension && (
          <p
            role="note"
            className="mt-8 rounded-input border border-accent-400/25 bg-accent-400/[0.06] px-4 py-3 text-[14px] text-ink/85"
          >
            {install.unsupported}
          </p>
        )}

        <ol className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {install.steps.map((step, i) => (
            <Step key={step.title} step={step} index={i} />
          ))}
        </ol>

        <section className="mt-4 flex flex-col gap-4 rounded-card border border-accent-500/25 bg-elevated p-8 sm:flex-row">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-input bg-accent-500/15 text-accent-500">
            <BentoIcon name="enclave" className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-[19px] font-medium tracking-[-0.02em] text-ink">
              {install.safetyTitle}
            </h2>
            <p className="mt-2 max-w-[70ch] text-[14px] leading-relaxed text-haze">
              {install.safetyBody}
            </p>
          </div>
        </section>
      </main>

      <GrainOverlay />
      <WaitlistModal open={waitlistOpen} onClose={() => setWaitlistOpen(false)} />
    </div>
  )
}
