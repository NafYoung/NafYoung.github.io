import { useEffect, useRef, useState } from 'react'

interface UseInViewOptions {
  threshold?: number | number[]
  once?: boolean
  rootMargin?: string
}

export function useInView<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.35,
  once = true,
  rootMargin = '0px',
}: UseInViewOptions = {}) {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true)
          if (once) {
            observer.disconnect()
          }
        } else if (!once) {
          setInView(false)
        }
      },
      { threshold, rootMargin },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [once, rootMargin, threshold])

  return { ref, inView }
}
