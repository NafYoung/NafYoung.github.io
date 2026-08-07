import { useCallback, useEffect, useRef, useState } from 'react'

interface UseRaceCarouselOptions {
  max: number
  interval?: number
  autoStart?: boolean
}

export function useRaceCarousel({
  max,
  interval = 3000,
  autoStart = true,
}: UseRaceCarouselOptions) {
  const [value, setValue] = useState(0)
  const pausedRef = useRef(false)
  const timerRef = useRef<number | null>(null)

  const clear = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const start = useCallback(() => {
    pausedRef.current = false
    clear()
    if (max <= 1) {
      return
    }
    timerRef.current = window.setInterval(() => {
      if (!pausedRef.current) {
        setValue((current) => (current + 1) % max)
      }
    }, interval)
  }, [clear, interval, max])

  const pause = useCallback(() => {
    pausedRef.current = true
  }, [])

  const race = useCallback((index: number) => {
    setValue(((index % max) + max) % max)
  }, [max])

  useEffect(() => {
    if (autoStart) {
      start()
    }
    return clear
  }, [autoStart, clear, start])

  return { value, race, start, pause }
}
