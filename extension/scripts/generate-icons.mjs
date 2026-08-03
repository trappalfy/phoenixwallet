// Toolbar / store icons: the white shard knocked into an accent-gradient square.
// Run with `npm run icons`. Output is generated — never hand-edit public/icons/*.
//
// Why the gradient plate at every size, not just 16 and 32 (spec §5.1): a
// transparent white mark vanishes on a light Chrome toolbar, and one silhouette
// across toolbar, extensions page and store listing is worth more than the
// transparency. The 135° angle matches the site's accent gradient so the icon
// and the UI share one light direction.
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { mkdir } from 'node:fs/promises'
import sharp from 'sharp'
import { loadTrimmedMark, MARK_PNG } from './mark-source.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(here, '../public/icons')
const STORE_OUT = resolve(here, '../store')

// The Chrome Web Store listing icon is framed differently from the toolbar set.
// Google's image guidelines put the artwork in a 96×96 box centred on a 128×128
// canvas, leaving 16px transparent on every side, and ask for no edge of our own
// on the outer square: the store draws its own rounding and shadow, so a plate
// running to the canvas edge gets treated twice and reads pinched next to icons
// that followed the rule.
//
// It is submission material, not part of the bundle, so it goes to store/ and
// never to public/icons — Vite copies that directory wholesale into dist/, and
// a second 128px file would ride along in the zip unreferenced by the manifest.
const STORE_ICON = { canvas: 128, plate: 96, ss: 8, inset: 0.86, radius: 0.2 }

// 180 is the apple-touch-icon the landing site copies out of here (there is
// no separate generator for it) — see the npm run icons step in README.
const SIZES = [16, 32, 48, 128, 180]

// Everything is composited at SS× and the finished icon downsampled in one step.
// Resizing the mark straight to 15px instead computes its antialiasing from a
// 15px raster, and the shard's thin points break up into noise. 180 gets a
// lower factor: at 8x its mark box (180 × 0.86 × 8 ≈ 1238px) would exceed the
// source mark's 903px width and get refused as an upscale; 5x keeps it a
// downscale while still comfortably supersampled.
const SS = { 16: 8, 32: 8, 48: 8, 128: 8, 180: 5 }

// Fraction of the canvas the mark occupies. The shard reads smaller than its
// bounding box, so it runs wide. At 16px it runs widest: shrinking it there
// costs legibility rather than buying air, because the points are already
// sub-pixel and less ink means less silhouette.
const INSET = { 16: 0.95, 32: 0.9, 48: 0.87, 128: 0.86, 180: 0.86 }

// Lanczos leaves the small sizes soft and the shard's points wash out. A light
// unsharp pass after the downscale restores the silhouette. The big sizes
// resolve on their own and sharpening there only crunches the gradient.
const SHARPEN = { 16: true, 32: true, 48: false, 128: false, 180: false }

// Corner radius as a fraction of the canvas. Chrome renders toolbar icons
// unmasked, so the plate carries its own rounding — except at 16px, where a
// radius eats more pixels than it buys, and 180, which iOS masks to its own
// squircle and would double-round if the source already carried one.
const RADIUS = { 16: 0, 32: 0.16, 48: 0.18, 128: 0.2, 180: 0 }

// The plate runs violet-weighted rather than using the accent gradient's
// stops verbatim: the white mark needs to sit on deep violet, and white on
// accent-300 has no contrast at all. Pushing accent-300 to the last 15% keeps
// the brand's light direction and its full hue range while confining the
// lightest stop to the corner the shard's mass does not cover.
function plate(px, radiusFraction) {
  const r = Math.round(px * radiusFraction)
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}">
       <defs>
         <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
           <stop offset="0%" stop-color="#2E1065"/>
           <stop offset="45%" stop-color="#7C3AED"/>
           <stop offset="85%" stop-color="#8B5CF6"/>
           <stop offset="100%" stop-color="#C4B5FD"/>
         </linearGradient>
       </defs>
       <rect width="${px}" height="${px}" rx="${r}" ry="${r}" fill="url(#g)"/>
     </svg>`,
  )
}

/** The listing icon: the same plate and mark, shrunk to 96 and centred on a
 *  transparent 128 canvas. Built from the same source as the toolbar set so the
 *  store and the browser cannot drift apart. */
async function storeIcon(trimmed, width, height) {
  const { canvas, plate: plateSize, ss, inset, radius } = STORE_ICON
  const box = Math.round(plateSize * inset * ss)
  if (box > Math.max(width, height)) {
    throw new Error(`refusing to upscale the mark (${width}×${height}) past ${box}px`)
  }

  const mark = await sharp(trimmed)
    .resize(box, box, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer()

  const large = await sharp(plate(plateSize * ss, radius))
    .composite([{ input: mark, gravity: 'center' }])
    .png()
    .toBuffer()

  const small = await sharp(large)
    .resize(plateSize, plateSize, { kernel: 'lanczos3' })
    .png()
    .toBuffer()

  const pad = (canvas - plateSize) / 2
  await sharp({
    create: {
      width: canvas,
      height: canvas,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: small, top: pad, left: pad }])
    .png({ compressionLevel: 9 })
    .toFile(resolve(STORE_OUT, 'store-icon-128.png'))

  console.log(
    `store/store-icon-128.png  ${canvas}×${canvas}  plate ${plateSize}px + ${pad}px transparent padding`,
  )
}

async function main() {
  await mkdir(OUT, { recursive: true })

  const { buffer: trimmed, width, height } = await loadTrimmedMark()
  console.log(`source ${MARK_PNG.split('/').pop()} → cropped to ${width}×${height}`)

  for (const size of SIZES) {
    const ss = SS[size]
    const box = Math.round(size * INSET[size] * ss)
    if (box > Math.max(width, height)) {
      throw new Error(`refusing to upscale the mark (${width}×${height}) past ${box}px`)
    }

    const mark = await sharp(trimmed)
      .resize(box, box, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer()

    const large = await sharp(plate(size * ss, RADIUS[size]))
      .composite([{ input: mark, gravity: 'center' }])
      .png()
      .toBuffer()

    let pipeline = sharp(large).resize(size, size, { kernel: 'lanczos3' })
    if (SHARPEN[size]) pipeline = pipeline.sharpen({ sigma: 0.6, m1: 1, m2: 2 })

    await pipeline.png({ compressionLevel: 9 }).toFile(resolve(OUT, `${size}.png`))

    console.log(
      `icons/${size}.png  ${size}×${size}  composited at ${size * ss}px, mark ${box}px` +
        (SHARPEN[size] ? ', sharpened' : ''),
    )
  }

  await storeIcon(trimmed, width, height)
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
