import { useEffect, useState } from 'react'

// Local time in a given IANA zone (FOOTER-SPEC §9). Minutes only, so it refreshes
// every 15s, not every second. Starts null (`--:--`) — real time is set in effect,
// never computed during render.
export function useLocalClock(timeZone: string): string | null {
  const [time, setTime] = useState<string | null>(null)
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
    const update = () => setTime(fmt.format(new Date()))
    update()
    const id = window.setInterval(update, 15000)
    return () => window.clearInterval(id)
  }, [timeZone])
  return time
}
