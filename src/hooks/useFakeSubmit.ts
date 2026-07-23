import { useRef, useState } from 'react'
import { validateEmail } from '../lib/validateEmail'

export type SubmitStatus = 'idle' | 'submitting' | 'done' | 'error'

// Fakes a waitlist submit: validate format, wait 700ms, resolve. No network.
export function useFakeSubmit() {
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const timer = useRef<number | undefined>(undefined)

  const submit = (email: string) => {
    if (!validateEmail(email)) {
      setStatus('error')
      return
    }
    setStatus('submitting')
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setStatus('done'), 700)
  }

  const reset = () => {
    window.clearTimeout(timer.current)
    setStatus('idle')
  }

  return { status, submit, reset }
}
