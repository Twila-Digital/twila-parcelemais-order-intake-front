import { useCallback, useEffect, useState } from 'react'
import { ONE_SECOND_IN_MILLISECONDS } from '@/constants/times'

export function useCountdown() {
  const [endsAt, setEndsAt] = useState<number | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(0)

  useEffect(() => {
    if (endsAt === null) return

    const tick = () => {
      const remaining = Math.max(
        0,
        Math.ceil((endsAt - Date.now()) / ONE_SECOND_IN_MILLISECONDS),
      )
      setSecondsLeft(remaining)
      if (remaining === 0) setEndsAt(null)
    }

    tick()
    const interval = setInterval(tick, ONE_SECOND_IN_MILLISECONDS)
    return () => clearInterval(interval)
  }, [endsAt])

  const start = useCallback((seconds: number) => {
    setEndsAt(Date.now() + seconds * ONE_SECOND_IN_MILLISECONDS)
  }, [])

  return { secondsLeft, isRunning: secondsLeft > 0, start }
}
