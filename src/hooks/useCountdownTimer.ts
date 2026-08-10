import { useCallback, useEffect, useMemo, useState } from 'react'
import { formatClockTime } from '../shared/time'

type UseCountdownTimerOptions = {
  durationSeconds: number
  isRunning: boolean
  onTimeout: () => void
}

export function useCountdownTimer({
  durationSeconds,
  isRunning,
  onTimeout,
}: UseCountdownTimerOptions) {
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds)

  useEffect(() => {
    if (!isRunning) return

    const interval = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(interval)
          onTimeout()
          return 0
        }

        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(interval)
  }, [isRunning, onTimeout])

  const reset = useCallback(() => {
    setSecondsLeft(durationSeconds)
  }, [durationSeconds])

  const formattedTime = useMemo(() => formatClockTime(secondsLeft), [secondsLeft])

  return {
    formattedTime,
    reset,
    secondsLeft,
  }
}
