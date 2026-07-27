/**
 * Copy helper. The popup is focused whenever a user can click, so the async
 * clipboard API is available — but it still rejects (permissions policy, a
 * blurred window), and a copy button that silently does nothing is worse than
 * one that says it failed. Callers get a boolean and show a toast either way.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

/**
 * Overwrites the clipboard after a delay so a recovery phrase does not sit there
 * indefinitely. Returns a canceller — call it if the component unmounts, or the
 * timer fires against a clipboard the user has since filled with something else.
 *
 * TODO(backend): a real build should also clear on popup close and on lock.
 */
export function clearClipboardAfter(ms: number): () => void {
  const id = window.setTimeout(() => {
    void navigator.clipboard.writeText('').catch(() => {})
  }, ms)
  return () => window.clearTimeout(id)
}

export const CLIPBOARD_CLEAR_MS = 20_000
