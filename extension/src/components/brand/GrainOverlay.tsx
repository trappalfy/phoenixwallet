/**
 * §5.2 — one grain layer above ink, so large dark areas do not band. Static: no
 * animation, no pointer events. The popup reopens dozens of times a day and an
 * animated backdrop would cost first paint for nothing.
 */
export default function GrainOverlay() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]">
      <svg className="h-full w-full">
        <filter id="perigee-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#perigee-grain)" />
      </svg>
    </div>
  )
}
