// "One surface" backdrop — the Wope portal-glow, in the accent ramp. A light
// source blooms at top-centre; a fan of thin rays radiates down out of it,
// crossed by faint concentric contour arcs so the fan reads as a warped
// horizon rather than a plain sunburst. Everything dissolves outward via a
// radial mask.
//
// Decorative only (aria-hidden), accent ramp only. Motion lives in CSS
// classes (sg-breathe / sg-sway / sg-descend) so reduced-motion freezes it centrally.

const APEX = { x: 750, y: 150 }
const VB = { w: 1500, h: 1500 }

// Contour rings step by a fixed *ratio*, not a fixed gap, so the whole ring
// stack can scale by exactly that ratio and land on itself — a seamless loop.
// This RATIO must equal the scale in @keyframes sgDescend (index.css).
const ARC_RATIO = 1.32

// One combined path for all rays — cheaper than 41 <line> nodes.
const RAYS = Array.from({ length: 41 }, (_, i) => {
  const ang = ((-82 + (i / 40) * 164) * Math.PI) / 180 // -82°..82° from straight down
  const R = 2000
  const x2 = APEX.x + Math.sin(ang) * R
  const y2 = APEX.y + Math.cos(ang) * R
  return `M${APEX.x} ${APEX.y}L${x2.toFixed(1)} ${y2.toFixed(1)}`
}).join('')

// Concentric contour rings, slightly flattened so they read as a horizon.
// Geometric radii spanning below the visible ring (near the apex) to well past
// it, so the seamless scale-loop always has a ring entering and one leaving in
// the mask's faded zones.
const ARCS = (() => {
  const out: number[] = []
  for (let r = 90; r < 2600; r *= ARC_RATIO) out.push(r)
  return out
})()

export default function SurfaceGlow() {
  return (
    <div className="edge-fade-y pointer-events-none absolute inset-0 overflow-hidden">
      <svg
        aria-hidden
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${VB.w} ${VB.h}`}
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          {/* radial fade for the line work: dim at the hot centre, strongest in
              the mid-ring, gone by the edges */}
          <radialGradient id="sg-fade" cx={APEX.x} cy={APEX.y} r="1050" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#fff" stopOpacity="0.25" />
            <stop offset="0.28" stopColor="#fff" stopOpacity="0.9" />
            <stop offset="0.62" stopColor="#fff" stopOpacity="0.5" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <mask id="sg-mask">
            <rect width={VB.w} height={VB.h} fill="url(#sg-fade)" />
          </mask>

          {/* blooms — kept concentrated near the apex so the section stays
              predominantly dark and the fan edges fall back into void */}
          <radialGradient id="sg-halo" cx={APEX.x} cy={APEX.y} r="820" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#8B5CF6" stopOpacity="0.26" />
            <stop offset="0.42" stopColor="#2E1065" stopOpacity="0.14" />
            <stop offset="1" stopColor="#2E1065" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="sg-core" cx={APEX.x} cy={APEX.y} r="340" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#C4B5FD" stopOpacity="0.72" />
            <stop offset="0.4" stopColor="#A78BFA" stopOpacity="0.42" />
            <stop offset="1" stopColor="#8B5CF6" stopOpacity="0" />
          </radialGradient>
          {/* descending beam onto the content — soft, not a spotlight */}
          <linearGradient id="sg-beam" x1={APEX.x} y1={APEX.y} x2={APEX.x} y2="1500" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#A78BFA" stopOpacity="0.3" />
            <stop offset="0.5" stopColor="#8B5CF6" stopOpacity="0.09" />
            <stop offset="1" stopColor="#8B5CF6" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* wide halo (breathing) */}
        <rect className="sg-breathe" width={VB.w} height={VB.h} fill="url(#sg-halo)" />

        {/* beam wedge widening as it falls */}
        <polygon points={`${APEX.x - 40},${APEX.y} ${APEX.x + 40},${APEX.y} ${APEX.x + 430},1500 ${APEX.x - 430},1500`} fill="url(#sg-beam)" />

        {/* line work, faded by the radial mask */}
        <g mask="url(#sg-mask)">
          <g className="sg-sway">
            <path d={RAYS} stroke="#A78BFA" strokeWidth="1" strokeOpacity="0.5" />
          </g>
          {/* rings drift outward from the apex forever — light pouring down */}
          <g className="sg-descend">
            {ARCS.map((r, i) => (
              <ellipse
                key={i}
                cx={APEX.x}
                cy={APEX.y}
                rx={r * 1.24}
                ry={r * 0.82}
                stroke="#A78BFA"
                strokeWidth="1"
                strokeOpacity="0.34"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </g>
        </g>

        {/* hot core last, so it sits over the line work (breathing) */}
        <rect className="sg-breathe" width={VB.w} height={VB.h} fill="url(#sg-core)" />
      </svg>
    </div>
  )
}
