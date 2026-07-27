// Dev-only: trace the brand logo's alpha silhouette into SVG path data, so
// PhoenixMark.tsx is a reproducible derivation of assets/brand/*.png rather than
// a hand-typed magic string. Re-run it if the logo ever changes.
//
//   node scripts/trace-mark.mjs [tolerance]
//
// Prints path data in a 24×24 viewBox. Paste the result into PhoenixMark.tsx and
// compare side by side against the source (spec §5.1) before accepting it.
import sharp from 'sharp'
import { loadTrimmedMark } from './mark-source.mjs'

const N = 512 // trace resolution
const VB = 24 // target viewBox
const TOL = Number(process.argv[2] ?? 1.5) // Douglas-Peucker tolerance, in N-space px

const { buffer: trimmed } = await loadTrimmedMark()
const { data, info } = await sharp(trimmed)
  .resize(N, N, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .raw()
  .toBuffer({ resolveWithObject: true })

const ch = info.channels
const solid = (x, y) => x >= 0 && y >= 0 && x < N && y < N && data[(y * N + x) * ch + 3] > 127

// --- Crack following -------------------------------------------------------
// Every boundary between a solid and an empty pixel contributes one directed
// edge, wound so the solid side is always on the left. Directed edges chain
// head-to-tail into closed loops with no ambiguity about where to start.
const edges = new Map() // "x,y" (tail) -> [hx, hy] (head)
const key = (x, y) => `${x},${y}`

for (let y = 0; y < N; y++) {
  for (let x = 0; x < N; x++) {
    if (!solid(x, y)) continue
    if (!solid(x, y - 1)) edges.set(key(x, y), [x + 1, y])
    if (!solid(x + 1, y)) edges.set(key(x + 1, y), [x + 1, y + 1])
    if (!solid(x, y + 1)) edges.set(key(x + 1, y + 1), [x, y + 1])
    if (!solid(x - 1, y)) edges.set(key(x, y + 1), [x, y])
  }
}

const loops = []
const used = new Set()
for (const [start] of edges) {
  if (used.has(start)) continue
  const pts = []
  let cur = start
  while (!used.has(cur) && edges.has(cur)) {
    used.add(cur)
    const [x, y] = cur.split(',').map(Number)
    pts.push([x, y])
    const head = edges.get(cur)
    cur = key(head[0], head[1])
  }
  if (pts.length > 16) loops.push(pts)
}

// --- Douglas-Peucker -------------------------------------------------------
function dp(pts, tol) {
  if (pts.length < 3) return pts
  let maxD = -1
  let idx = 0
  const [ax, ay] = pts[0]
  const [bx, by] = pts[pts.length - 1]
  const dx = bx - ax
  const dy = by - ay
  const len = Math.hypot(dx, dy) || 1
  for (let i = 1; i < pts.length - 1; i++) {
    const d = Math.abs((pts[i][0] - ax) * dy - (pts[i][1] - ay) * dx) / len
    if (d > maxD) {
      maxD = d
      idx = i
    }
  }
  if (maxD <= tol) return [pts[0], pts[pts.length - 1]]
  return [...dp(pts.slice(0, idx + 1), tol).slice(0, -1), ...dp(pts.slice(idx), tol)]
}

const s = VB / N
const fmt = (n) => Number((n * s).toFixed(2))

// Douglas-Peucker needs two endpoints, and a closed ring has none: its chord is
// zero-length, every perpendicular distance measures 0, and the whole outline
// collapses. Cut the ring at its two most distant points and simplify each arc.
function simplifyRing(ring, tol) {
  const cx = ring.reduce((a, p) => a + p[0], 0) / ring.length
  const cy = ring.reduce((a, p) => a + p[1], 0) / ring.length
  const farthestFrom = (px, py) => {
    let best = 0
    let bestD = -1
    ring.forEach(([x, y], i) => {
      const d = Math.hypot(x - px, y - py)
      if (d > bestD) {
        bestD = d
        best = i
      }
    })
    return best
  }
  const a = farthestFrom(cx, cy)
  const b = farthestFrom(ring[a][0], ring[a][1])
  const [lo, hi] = a < b ? [a, b] : [b, a]
  const arc1 = ring.slice(lo, hi + 1)
  const arc2 = [...ring.slice(hi), ...ring.slice(0, lo + 1)]
  return [...dp(arc1, tol).slice(0, -1), ...dp(arc2, tol).slice(0, -1)]
}

for (const loop of loops.sort((a, b) => b.length - a.length)) {
  const simp = simplifyRing(loop, TOL)
  const d = 'M' + simp.map(([x, y]) => `${fmt(x)} ${fmt(y)}`).join('L') + 'Z'
  console.log(`--- loop ${loop.length} raw → ${simp.length} points, ${d.length} chars`)
  console.log(d)
  console.log()
}
