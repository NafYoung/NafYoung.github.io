import { useEffect, useRef } from 'react'

/** Soft underwater bokeh / caustic overlay — cool tones only */
export function HeroAtmosphere({ accent = '#5eead4' }: { accent?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let disposed = false
    const start = performance.now()
    const particles = Array.from({ length: 36 }, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      r: 12 + Math.random() * 70,
      s: 0.08 + Math.random() * 0.25,
      a: 0.04 + Math.random() * 0.12,
      p: Math.random() * Math.PI * 2,
      drift: (Math.random() - 0.5) * 0.08,
      i,
    }))

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      const { width, height } = parent.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const rgb = hexToRgb(accent)

    const draw = (now: number) => {
      if (disposed) return
      const parent = canvas.parentElement
      if (!parent) return
      const { width, height } = parent.getBoundingClientRect()
      const t = (now - start) / 1000
      ctx.clearRect(0, 0, width, height)

      for (const p of particles) {
        const x = (p.x + Math.sin(t * p.s + p.p) * 0.05 + p.drift * t * 0.02) * width
        const y = ((p.y + t * p.s * 0.04) % 1.2) * height - height * 0.1
        const pulse = 0.75 + 0.25 * Math.sin(t * 0.8 + p.p)
        const r = p.r * pulse
        const g = ctx.createRadialGradient(x, y, 0, x, y, r)
        g.addColorStop(0, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${p.a})`)
        g.addColorStop(0.45, `rgba(${rgb[0]}, ${Math.min(255, rgb[1] + 30)}, 255, ${p.a * 0.45})`)
        g.addColorStop(1, 'rgba(0, 40, 80, 0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
      }

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [accent])

  return <canvas ref={ref} className="hero-atmosphere" aria-hidden="true" />
}

function hexToRgb(hex: string): [number, number, number] {
  const raw = hex.replace('#', '')
  const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw
  const n = Number.parseInt(full, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
