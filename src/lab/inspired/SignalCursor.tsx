import { useEffect, useRef } from 'react'

function canUseCustomCursor() {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/**
 * Dot + ring cursor with lagged ring follow.
 * Inspired by contemporary AI brand homepage craft.
 */
export function SignalCursor() {
  const rootRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!canUseCustomCursor()) return

    const root = rootRef.current
    if (root) root.hidden = false

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const ring = { x: pos.x, y: pos.y }
    let hovering = false
    let visible = false
    let raf = 0

    const onMove = (event: PointerEvent) => {
      pos.x = event.clientX
      pos.y = event.clientY
      visible = true
    }

    const onLeave = () => {
      visible = false
    }

    const isInteractive = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return false
      return Boolean(
        target.closest('a, button, textarea, input, label, [role="button"], .signal-pill'),
      )
    }

    const onOver = (event: PointerEvent) => {
      hovering = isInteractive(event.target)
    }

    const tick = () => {
      ring.x += (pos.x - ring.x) * 0.18
      ring.y += (pos.y - ring.y) * 0.18

      const dot = dotRef.current
      const ringEl = ringRef.current
      if (dot && ringEl) {
        const opacity = visible ? '1' : '0'
        dot.style.opacity = opacity
        ringEl.style.opacity = opacity
        dot.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%) scale(${hovering ? 0.55 : 1})`
        ringEl.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0) translate(-50%, -50%) scale(${hovering ? 1.55 : 1})`
        ringEl.classList.toggle('is-hover', hovering)
        dot.classList.toggle('is-hover', hovering)
      }
      raf = requestAnimationFrame(tick)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerover', onOver, { passive: true })
    document.documentElement.addEventListener('mouseleave', onLeave)
    raf = requestAnimationFrame(tick)
    document.documentElement.classList.add('has-signal-cursor')

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerover', onOver)
      document.documentElement.removeEventListener('mouseleave', onLeave)
      document.documentElement.classList.remove('has-signal-cursor')
    }
  }, [])

  return (
    <div className="signal-cursor" ref={rootRef} hidden aria-hidden="true">
      <div className="signal-cursor-ring" ref={ringRef} />
      <div className="signal-cursor-dot" ref={dotRef} />
    </div>
  )
}
