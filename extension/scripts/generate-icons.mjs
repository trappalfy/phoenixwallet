// Toolbar / store icons: the white shard knocked into an ember-gradient square.
// Run with `npm run icons`. Output is generated — never hand-edit public/icons/*.
//
// Why the gradient plate at every size, not just 16 and 32 (spec §5.1): a
// transparent white mark vanishes on a light Chrome toolbar, and one silhouette
// across toolbar, extensions page and store listing is worth more than the
// transparency. The 135° angle matches --grad-ember so the icon and the UI share
// one light direction.
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { mkdir } from 'node:fs/promises'
import sharp from 'sharp'
import { loadTrimmedMark, MARK_PNG } from './mark-source.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(here, '../public/icons')

const SIZES = [16, 32, 48, 128]

// Everything is composited at SS× and the finished icon downsampled in one step.
// Resizing the mark straight to 15px instead computes its antialiasing from a
// 15px raster, and the shard's thin points break up into noise.
const SS = 8

// Fraction of the canvas the mark occupies. The shard reads smaller than its
// bounding box, so it runs wide. At 16px it runs widest: shrinking it there
// costs legibility rather than buying air, because the points are already
// sub-pixel and less ink means less silhouette.
const INSET = { 16: 0.95, 32: 0.9, 48: 0.87, 128: 0.86 }

// Lanczos leaves the small sizes soft and the shard's points wash out. A light
// unsharp pass after the downscale restores the silhouette. The big sizes
// resolve on their own and sharpening there only crunches the gradient.
const SHARPEN = { 16: true, 32: true, 48: false, 128: false }

// Corner radius as a fraction of the canvas. Chrome renders toolbar icons
// unmasked, so the plate carries its own rounding — except at 16px, where a
// radius eats more pixels than it buys.
const RADIUS = { 16: 0, 32: 0.16, 48: 0.18, 128: 0.2 }

// The plate runs red-weighted rather than using --grad-ember's stops verbatim:
// §5.1 wants the white mark sitting on dark red, and white on #FFC300 has no
// contrast at all. Pushing ember-hot to the last 15% keeps the brand's light
// direction and its full hue range while confining yellow to the corner the
// shard's mass does not cover.
function plate(px, radiusFraction) {
  const r = Math.round(px * radiusFraction)
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}">
       <defs>
         <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
           <stop offset="0%" stop-color="#B00000"/>
           <stop offset="45%" stop-color="#E63C00"/>
           <stop offset="85%" stop-color="#FF7A00"/>
           <stop offset="100%" stop-color="#FFC300"/>
         </linearGradient>
       </defs>
       <rect width="${px}" height="${px}" rx="${r}" ry="${r}" fill="url(#g)"/>
     </svg>`,
  )
}

async function main() {
  await mkdir(OUT, { recursive: true })

  const { buffer: trimmed, width, height } = await loadTrimmedMark()
  console.log(`source ${MARK_PNG.split('/').pop()} → cropped to ${width}×${height}`)

  for (const size of SIZES) {
    const box = Math.round(size * INSET[size] * SS)
    if (box > Math.max(width, height)) {
      throw new Error(`refusing to upscale the mark (${width}×${height}) past ${box}px`)
    }

    const mark = await sharp(trimmed)
      .resize(box, box, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer()

    const large = await sharp(plate(size * SS, RADIUS[size]))
      .composite([{ input: mark, gravity: 'center' }])
      .png()
      .toBuffer()

    let pipeline = sharp(large).resize(size, size, { kernel: 'lanczos3' })
    if (SHARPEN[size]) pipeline = pipeline.sharpen({ sigma: 0.6, m1: 1, m2: 2 })

    await pipeline.png({ compressionLevel: 9 }).toFile(resolve(OUT, `${size}.png`))

    console.log(
      `icons/${size}.png  ${size}×${size}  composited at ${size * SS}px, mark ${box}px` +
        (SHARPEN[size] ? ', sharpened' : ''),
    )
  }
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
