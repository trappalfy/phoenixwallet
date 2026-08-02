// Scan "PERIGEE" into horizontal stroke rows (FOOTER-SPEC §13.3). The word is
// drawn to an offscreen canvas in Cabinet Grotesk Bold, then read row by row;
// each row becomes a set of [x0,x1] segments (the ink spans on that scanline).
//
// Font path only — the project has no brand SVG. Drop one at /brand and add an
// svgUrl branch later if wanted; the render side already treats rows abstractly.

export type ScanResult = { rows: [number, number][][]; width: number; height: number }

const DPR = 2

// per-char draw/measure instead of ctx.letterSpacing — works in every browser
function measureTracked(ctx: CanvasRenderingContext2D, text: string, trackPx: number) {
  let w = 0
  for (const ch of [...text]) w += ctx.measureText(ch).width + trackPx
  return w - trackPx
}
function drawTracked(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, trackPx: number) {
  let cx = x
  for (const ch of [...text]) {
    ctx.fillText(ch, cx, y)
    cx += ctx.measureText(ch).width + trackPx
  }
}

export async function scanWordmark(opts: {
  text: string
  family?: string
  weight?: number
  tracking?: number // em
  width: number
  rows: number
}): Promise<ScanResult> {
  const { text, family = 'Cabinet Grotesk', weight = 700, tracking = -0.04, width, rows } = opts

  // wait for *our* weight, not just fonts.ready — else we scan the fallback
  await document.fonts.load(`${weight} 100px "${family}"`)
  await document.fonts.ready

  // fit the word to the target width
  const probe = document.createElement('canvas').getContext('2d')!
  const BASE = 200
  probe.font = `${weight} ${BASE}px "${family}"`
  const baseW = measureTracked(probe, text, BASE * tracking)
  const fontSize = BASE * (width / baseW)

  probe.font = `${weight} ${fontSize}px "${family}"`
  const m = probe.measureText(text)
  const ascent = m.actualBoundingBoxAscent
  const descent = m.actualBoundingBoxDescent // ≈0 for caps
  const height = Math.max(1, Math.ceil(ascent + descent))

  const c = document.createElement('canvas')
  c.width = Math.ceil(width * DPR)
  c.height = Math.ceil(height * DPR)
  const ctx = c.getContext('2d', { willReadFrequently: true })!
  ctx.scale(DPR, DPR)
  ctx.fillStyle = '#fff'
  ctx.textBaseline = 'alphabetic'
  ctx.font = `${weight} ${fontSize}px "${family}"`
  drawTracked(ctx, text, 0, ascent, fontSize * tracking)

  // row-by-row scan (device pixels; segments returned in CSS px)
  const img = ctx.getImageData(0, 0, c.width, c.height).data
  const pitch = c.height / rows
  const out: [number, number][][] = []

  for (let r = 0; r < rows; r++) {
    const y = Math.min(c.height - 1, Math.floor((r + 0.5) * pitch))
    const off = y * c.width * 4
    const segs: [number, number][] = []
    let start = -1
    for (let x = 0; x < c.width; x++) {
      const on = img[off + x * 4 + 3] > 128
      if (on && start === -1) start = x
      else if (!on && start !== -1) {
        segs.push([start / DPR, x / DPR])
        start = -1
      }
    }
    if (start !== -1) segs.push([start / DPR, c.width / DPR])
    // drop sub-1.5px specks from antialiased diagonals (X, N)
    out.push(segs.filter(([a, b]) => b - a >= 1.5))
  }

  return { rows: out, width, height }
}
