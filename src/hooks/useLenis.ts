import { useEffect } from 'react'
import Lenis from 'lenis'

export function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.1,
      smoothWheel: true,
    })

    document.documentElement.classList.add('lenis')

    return () => {
      document.documentElement.classList.remove('lenis')
      lenis.destroy()
    }
  }, [])
}
