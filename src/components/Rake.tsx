type Side = 'left' | 'right'

// Forge rake — a wedge of ember light raking in from the page edge, filled with
// a dot matrix so it reads as engineered light rather than a soft gradient.
// The apex points inward: light converges toward the content, brightest at the tip.
//
// This is the page's ambient depth after the hero. Decorative only — never
// carries meaning on its own, and never colour outside the ember ramp (brief §9).
//
// Geometry note: the apex sits at 75% of the box, not at its edge. The spare 25%
// is falloff room — the bloom needs somewhere to dissipate, and a bloom centred
// on the box edge gets sliced in half and reads as a hard vertical seam.
const APEX = 0.75

export default function Rake({
  side,
  className = '',
  intensity = 1,
}: {
  side: Side
  className?: string
  intensity?: number
}) {
  const isLeft = side === 'left'
  const apexPct = isLeft ? `${APEX * 100}%` : `${(1 - APEX) * 100}%`
  const clipPath = isLeft
    ? `polygon(0% 0%, ${apexPct} 50%, 0% 100%)`
    : `polygon(100% 0%, ${apexPct} 50%, 100% 100%)`
  const to = isLeft ? 'right' : 'left'
  // brightest at the apex, dissolving back toward the edge it entered from
  const fade = `linear-gradient(to ${to}, transparent 0%, rgba(0,0,0,0.12) 30%, #000 74%)`
  // Feathers the wedge's hard clip-path edges. Without this the triangle's
  // long diagonal reads as a stray dotted band instead of a shaft of light.
  const feather = 'linear-gradient(to bottom, transparent 0%, #000 26%, #000 74%, transparent 100%)'

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute ${className}`}
      style={{ maskImage: feather, WebkitMaskImage: feather }}
    >
      {/* bloom pooling at the apex, contained so it fades before the box edge */}
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.95 * intensity,
          filter: 'blur(52px)',
          background: `radial-gradient(ellipse 22% 78% at ${apexPct} 50%, rgba(255,90,31,0.44), rgba(122,30,0,0.24) 48%, transparent 76%)`,
        }}
      />
      {/* the wedge itself — dot matrix, not a gradient. This is what makes the
          light read as engineered rather than as a blurred glow. */}
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.9 * intensity,
          clipPath,
          backgroundImage:
            'radial-gradient(circle at center, rgba(255,169,61,0.95) 1px, transparent 1.15px)',
          backgroundSize: '6px 6px',
          maskImage: fade,
          WebkitMaskImage: fade,
        }}
      />
      {/* specular streak along the wedge's centreline — the hot line the eye
          reads as a light source. A hairline, so it stays light, not decor. */}
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.55 * intensity,
          clipPath,
          background: `linear-gradient(to ${to}, transparent 28%, rgba(255,233,196,0.5) 96%)`,
          maskImage: 'linear-gradient(to bottom, transparent 43%, #000 50%, transparent 57%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 43%, #000 50%, transparent 57%)',
        }}
      />
    </div>
  )
}
