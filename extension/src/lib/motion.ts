import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP, CustomEase)

// Every animation in §10 goes through this module. One place decides how long
// things take, how they ease, and — the part that matters — whether they run at
// all. Nothing outside here imports gsap.

/** §5.4 durations, in seconds because that is what GSAP speaks. */
export const DUR = {
  press: 0.12,
  state: 0.18,
  route: 0.26,
  sheet: 0.24,
  figure: 0.48,
  hold: 0.6,
  ignite: 0.52,
  rail: 1.4,
} as const

/**
 * §5.4's easing tokens, exactly.
 *
 * GSAP does not read CSS `cubic-bezier(...)` strings — handing it one throws at
 * tween time, not at build time, so it looks like nothing animates. CustomEase
 * takes the same four control points as an SVG cubic and gives back a real ease
 * function, which is how these stay identical to the CSS transitions still used
 * for hover and press.
 */
export const EASE = {
  out: CustomEase.create('phoenix-out', 'M0,0 C0.2,0.8 0.25,1 1,1'),
  inOut: CustomEase.create('phoenix-in-out', 'M0,0 C0.6,0 0.3,1 1,1'),
} as const

/** §10: 12ms apart, first eight rows only. */
export const STAGGER = { each: 0.012, max: 8 } as const

/**
 * The guard §10 asks for. Read at call time rather than cached: the setting can
 * change while the popup is open, and a wallet that keeps animating after the
 * user has asked it to stop is exactly the complaint the media query exists for.
 *
 * `matchMedia` is missing in no browser this ships to, but the optional call
 * keeps the module importable from a test runner without a DOM.
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

/**
 * Runs `build` inside a GSAP context scoped to `scope`, and skips it entirely
 * when the user has asked for reduced motion. The reduced path is not a shorter
 * animation — it is no animation, with the end state applied directly, which is
 * why `build` never sets a starting state the layout depends on.
 */
type Build = (ctx: { scope: HTMLElement }) => void

function useMotion(
  build: Build,
  scope: RefObject<HTMLElement>,
  deps: unknown[] = [],
  /**
   * What to do instead when motion is reduced. Most animations need nothing —
   * their element is already in its final state. The exceptions are the ones
   * whose element only makes sense while it is moving: a heat rail that does not
   * sweep is a progress bar frozen at a third, which says something false.
   */
  reduced?: Build,
) {
  useGSAP(
    () => {
      if (!scope.current) return
      if (prefersReducedMotion()) {
        reduced?.({ scope: scope.current })
        return
      }
      build({ scope: scope.current })
    },
    { scope, dependencies: deps, revertOnUpdate: true },
  )
}

/* --- route push / back: 12px slide + fade, 260ms (§10) -------------------- */

export function useRouteTransition(direction: 'forward' | 'back', key: string) {
  const scope = useRef<HTMLDivElement>(null)

  useMotion(
    ({ scope: el }) => {
      gsap.fromTo(
        el,
        { opacity: 0, x: direction === 'forward' ? 12 : -12 },
        { opacity: 1, x: 0, duration: DUR.route, ease: EASE.out, clearProps: 'transform' },
      )
    },
    scope,
    [key, direction],
  )

  return scope
}

/* --- bottom sheet: y 100% → 0 plus a backdrop fade, 240ms (§10) ----------- */

export function useSheetIn(open: boolean) {
  const scope = useRef<HTMLDivElement>(null)

  useMotion(
    ({ scope: el }) => {
      if (!open) return
      const panel = el.querySelector('[data-sheet-panel]')
      const backdrop = el.querySelector('[data-sheet-backdrop]')
      const tl = gsap.timeline()
      if (backdrop) tl.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: DUR.state, ease: EASE.out }, 0)
      if (panel) {
        tl.fromTo(
          panel,
          { yPercent: 100 },
          { yPercent: 0, duration: DUR.sheet, ease: EASE.out, clearProps: 'transform' },
          0,
        )
      }
    },
    scope,
    [open],
  )

  return scope
}

/* --- tab underline: x + width tween to the active tab, 200ms (§10) -------- */

export function useTabRail(active: string) {
  const scope = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const el = scope.current
      const rail = el?.querySelector<HTMLElement>('[data-tab-rail]')
      const current = el?.querySelector<HTMLElement>(`[data-tab="${active}"]`)
      if (!el || !rail || !current) return

      const to = { left: current.offsetLeft, width: current.offsetWidth }
      // Measured from the live DOM rather than assumed equal widths, so a long
      // label cannot desync the rail.
      gsap.to(rail, {
        ...to,
        duration: prefersReducedMotion() ? 0 : 0.2,
        ease: EASE.out,
      })
    },
    { scope, dependencies: [active] },
  )

  return scope
}

/* --- figures: digit count-up on mount and on change, 480ms (§10) ---------- */

/**
 * Counts a number up to `value` and hands each frame back as text through
 * `render`. The element keeps its final text when motion is reduced, so a
 * screen reader and a reduced-motion user see the real figure immediately.
 */
export function useCountUp(
  value: number,
  render: (n: number) => string,
  options: { enabled?: boolean; deps?: unknown[] } = {},
) {
  const ref = useRef<HTMLSpanElement>(null)
  const enabled = options.enabled ?? true
  // Anything the *formatting* depends on has to re-run this too. Switching
  // display currency leaves the underlying USD value untouched, and without
  // this the element would keep showing the old currency's text forever.
  const deps = options.deps ?? []

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return
      if (!enabled || prefersReducedMotion() || value === 0) {
        el.textContent = render(value)
        return
      }
      const counter = { n: 0 }
      gsap.to(counter, {
        n: value,
        duration: DUR.figure,
        ease: EASE.out,
        onUpdate: () => {
          el.textContent = render(counter.n)
        },
        onComplete: () => {
          el.textContent = render(value)
        },
      })
    },
    { dependencies: [value, enabled, ...deps], revertOnUpdate: true },
  )

  return ref
}

/* --- errors: 4px horizontal shake, 3 cycles, 180ms (§10) ------------------ */

/**
 * `trigger` is a counter — bumping it replays the shake for a repeat failure.
 * Without `selector` the scope itself shakes; with it, whichever element inside
 * currently carries the attribute does, which is how one wrong cell out of
 * twelve can shake without the grid moving.
 */
export function useShake(trigger: number, selector?: string) {
  const scope = useRef<HTMLDivElement>(null)

  useMotion(
    ({ scope: el }) => {
      if (trigger === 0) return
      const target = selector ? el.querySelector(selector) : el
      if (!target) return
      gsap.fromTo(
        target,
        { x: 0 },
        {
          keyframes: { x: [-4, 4, -4, 4, -4, 0] },
          duration: DUR.state,
          ease: EASE.inOut,
          clearProps: 'transform',
        },
      )
    },
    scope,
    [trigger],
  )

  return scope
}

/* --- copy confirmation: toast slide, 180ms (§10) -------------------------- */

/** `key` is the message: a new one replays the slide instead of swapping text. */
export function useToastIn(key: string) {
  const scope = useRef<HTMLDivElement>(null)

  useMotion(
    ({ scope: el }) => {
      gsap.fromTo(
        el,
        { y: 8, opacity: 0 },
        { y: 0, opacity: 1, duration: DUR.state, ease: EASE.out, clearProps: 'transform' },
      )
    },
    scope,
    [key],
  )

  return scope
}

/* --- list mount: 12ms stagger, first 8 rows only, 180ms (§10) ------------- */

export function useListStagger(deps: unknown[] = []) {
  const scope = useRef<HTMLDivElement>(null)

  useMotion(
    ({ scope: el }) => {
      const rows = gsap.utils.toArray<HTMLElement>('[data-stagger]', el).slice(0, STAGGER.max)
      if (!rows.length) return
      gsap.fromTo(
        rows,
        { opacity: 0, y: 6 },
        {
          opacity: 1,
          y: 0,
          duration: DUR.state,
          ease: EASE.out,
          stagger: STAGGER.each,
          clearProps: 'transform,opacity',
        },
      )
    },
    scope,
    deps,
  )

  return scope
}

/* --- the ignite: mark draw + header sweep, 520ms (§5.5, §10) -------------- */

/**
 * Unlock and Ready only. The mark grows out of its own centre while a heat rail
 * sweeps the top edge; the balance count-up on Home is the third part and rides
 * `useCountUp`. Everything else in the app stays at 120–180 ms.
 */
export function useIgnite(run = true) {
  const scope = useRef<HTMLDivElement>(null)

  useMotion(
    ({ scope: el }) => {
      if (!run) return
      const mark = el.querySelector('[data-ignite-mark]')
      const rail = el.querySelector('[data-ignite-rail]')
      const tl = gsap.timeline()
      if (mark) {
        tl.fromTo(
          mark,
          { opacity: 0, scale: 0.25, transformOrigin: '50% 50%' },
          { opacity: 1, scale: 1, duration: DUR.ignite, ease: EASE.out, clearProps: 'transform' },
          0,
        )
      }
      if (rail) {
        // Off the left edge to off the right edge. The rail is half the header
        // wide, so it has to travel two of its own widths to leave the frame —
        // stopping at one parks a lit bar over the right half of the screen.
        tl.fromTo(
          rail,
          { xPercent: -100 },
          { xPercent: 200, duration: DUR.ignite, ease: EASE.out },
          0,
        )
      }
    },
    scope,
    [run],
    // Nothing to sweep, so the rail should not be sitting there lit.
    ({ scope: el }) => gsap.set(el.querySelectorAll('[data-ignite-rail]'), { autoAlpha: 0 }),
  )

  return scope
}

/* --- tx pending: heat rail looping across the top edge, 1.4s (§10) -------- */

export function useHeatRail(running: boolean) {
  const scope = useRef<HTMLDivElement>(null)

  useMotion(
    ({ scope: el }) => {
      const rail = el.querySelector('[data-heat-rail]')
      if (!rail || !running) return
      gsap.fromTo(
        rail,
        { xPercent: -100 },
        { xPercent: 300, duration: DUR.rail, ease: EASE.inOut, repeat: -1 },
      )
    },
    scope,
    [running],
    // A rail that cannot sweep reads as a progress bar stuck at a third. The
    // screen already says "Sending…" in words, so the bar just goes.
    ({ scope: el }) => gsap.set(el.querySelectorAll('[data-heat-rail]'), { autoAlpha: 0 }),
  )

  return scope
}

/* --- hold to confirm: gradient fill sweep, 600ms (§10) -------------------- */

/**
 * Drives the fill directly instead of through React state, so releasing early
 * rewinds from wherever the sweep got to rather than snapping. Returns the
 * controls the button needs; the timing of the confirm is the tween's, so the
 * bar and the action can never disagree about when 600 ms has passed.
 *
 * The one animation here that ignores the reduced-motion guard, deliberately.
 * The sweep is not decoration: it is the only thing telling you how much longer
 * to hold, and the hold itself is a safety measure on the action that moves
 * money (§9.4). Dropping the bar would leave a button that appears to do
 * nothing for 600 ms; dropping the wait would quietly remove the safeguard for
 * the users least likely to want surprises. It fills linearly, which is what
 * reduced motion actually asks for — no oscillation, no parallax, no bounce.
 */
export function useHoldSweep(onConfirm: () => void) {
  const fill = useRef<HTMLSpanElement>(null)
  const tween = useRef<gsap.core.Tween | null>(null)

  // The tween is created in a pointer handler, outside any GSAP context, so it
  // has to be killed by hand when the screen goes away mid-hold.
  useEffect(
    () => () => {
      tween.current?.kill()
    },
    [],
  )

  const start = () => {
    const el = fill.current
    if (!el || tween.current) return
    tween.current = gsap.fromTo(
      el,
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: DUR.hold,
        ease: 'none',
        onComplete: () => {
          tween.current = null
          onConfirm()
        },
      },
    )
  }

  const cancel = () => {
    const active = tween.current
    if (!active) return
    tween.current = null
    active.kill()
    gsap.to(fill.current, { scaleX: 0, duration: DUR.state, ease: EASE.out })
  }

  return { fill, start, cancel }
}
