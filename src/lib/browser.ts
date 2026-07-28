// Can this browser install a Chrome extension at all? Desktop Chromium only —
// mobile Chrome has no extensions, and Firefox/Safari use different stores.
// Evaluated once: it cannot change during a session.

type UAData = { mobile?: boolean; brands?: { brand: string }[] }

function detect(): boolean {
  if (typeof navigator === 'undefined') return false
  const uaData = (navigator as Navigator & { userAgentData?: UAData }).userAgentData
  const ua = navigator.userAgent

  // Mobile first: Chrome on Android/iOS cannot load extensions either way.
  if (uaData?.mobile) return false
  if (/Android|iPhone|iPad|iPod/.test(ua)) return false

  // userAgentData only exists in Chromium, so its presence is the answer.
  if (uaData) return true

  // Fallback for older Chromium and for non-Chromium engines. Safari's UA has
  // no "Chrome", and Firefox must be excluded explicitly (Firefox on iOS
  // reports FxiOS while still carrying Safari-ish tokens).
  if (/Firefox|FxiOS/.test(ua)) return false
  return /Chrome|Chromium|Edg|OPR/.test(ua)
}

export const canInstallExtension = detect()
