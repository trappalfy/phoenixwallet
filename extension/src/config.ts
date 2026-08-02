// Single place for build-level switches (spec §2.3, §8).

/**
 * Drives the DEMO chip in the header. A UI that looks like a funded wallet but
 * isn't must say so. Set to false in exactly this one place to remove it.
 */
export const IS_DEMO = false

/**
 * Shown on Settings → About. Kept in step with package.json and manifest.json by
 * hand — three files, one number, and a mismatch is the kind of thing a store
 * reviewer notices.
 */
export const VERSION = '0.1.0'

/** Chrome caps popups at 800 × 600; 600 is the ceiling, and the shell never scrolls. */
export const POPUP_W = 360
export const POPUP_H = 600

/**
 * Dev shortcut (§8). There is no persistence, so the app would otherwise always
 * open on Welcome. Point this at any param-less route to open a flow directly
 * during review — `home` is the useful one.
 */
export type StartRoute = 'welcome' | 'unlock' | 'home' | 'swap' | 'settings'

export const START_AT: StartRoute = 'welcome'
