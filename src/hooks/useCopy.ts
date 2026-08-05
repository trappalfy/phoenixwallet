import { useEffect, useRef, useState } from 'react'

/**
 * Clipboard write with a self-clearing "copied" flag.
 *
 * Always hand this the full value, never the string that is on screen. The token
 * bar shortens the address on narrow viewports, and copying the shortened form
 * would put something that is not an address into someone's clipboard right
 * before they paste it into a swap.
 */
export function useCopy(resetMs = 1800) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  // A copy right before unmount would otherwise set state on a dead component.
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Insecure origin, or a browser that withholds clipboard permission.
      // Nothing useful to tell the user here, and the address is selectable
      // either way — but claiming "Copied" when nothing was would be worse than
      // staying quiet.
      return
    }
    setCopied(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(false), resetMs)
  }

  return { copied, copy }
}
