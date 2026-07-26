import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import PhoenixMark from '../brand/PhoenixMark'

/**
 * QR rendered to SVG by `qrcode` (§9.5). White modules on a light plate rather
 * than ember-on-ink: scanners need luminance contrast, and a themed QR that
 * cannot be read is decoration, not a feature.
 *
 * Error correction is H so the knocked-out square holding the mark does not cost
 * readability.
 */
export default function QrPanel({ value }: { value: string }) {
  const [svg, setSvg] = useState<string | null>(null)

  useEffect(() => {
    let live = true
    QRCode.toString(value, {
      type: 'svg',
      errorCorrectionLevel: 'H',
      margin: 1,
      color: { dark: '#0A0506', light: '#F7EDEA' },
    })
      .then((out) => live && setSvg(out))
      .catch(() => live && setSvg(null))
    return () => {
      live = false
    }
  }, [value])

  return (
    <div className="relative mx-auto w-[196px] rounded-card border border-hairline bg-text p-2">
      {svg ? (
        <div
          className="[&>svg]:block [&>svg]:h-auto [&>svg]:w-full"
          // qrcode's output is a fixed SVG string built from `value`; no user
          // markup reaches this.
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <div className="aspect-square w-full animate-pulse rounded-control bg-surface-2" />
      )}

      {svg && (
        <span className="absolute left-1/2 top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-control bg-text">
          <PhoenixMark size={26} className="text-ink" />
        </span>
      )}
    </div>
  )
}
