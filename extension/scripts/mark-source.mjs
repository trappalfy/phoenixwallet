// Shared loader for the brand mark. Both generate-icons.mjs and trace-mark.mjs
// need the same tightly-cropped silhouette, and getting there is not a one-liner:
// sharp's trim() leaves the source at its full 1254² because the transparent
// margin is speckled with stray alpha 1–3 pixels that defeat its edge detection.
// So the bounding box is measured directly, ignoring anything under `threshold`.
import sharp from 'sharp'
import { fileURLToPath } from 'node:url'

// fileURLToPath, not .pathname: on Windows the latter yields "/C:/..." with a
// leading slash, which sharp can't resolve as a file path.
export const MARK_PNG = fileURLToPath(new URL('../assets/brand/star-white-transparent.png', import.meta.url))

/**
 * @returns {Promise<{buffer: Buffer, width: number, height: number}>}
 *   the source cropped to the mark's true bounding box.
 */
export async function loadTrimmedMark(threshold = 24) {
  const { data, info } = await sharp(MARK_PNG).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width, height, channels } = info

  let minX = width
  let minY = height
  let maxX = -1
  let maxY = -1
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * channels + 3] <= threshold) continue
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
  }
  if (maxX < 0) throw new Error(`${MARK_PNG} is empty above alpha ${threshold}`)

  const box = { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 }
  const buffer = await sharp(MARK_PNG).extract(box).png().toBuffer()
  return { buffer, width: box.width, height: box.height }
}
