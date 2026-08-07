import { useEffect, useRef } from 'react'

interface OceanBackdropProps {
  accent: string
  gradient: string
  active: boolean
}

export function OceanBackdrop({ accent, gradient, active }: OceanBackdropProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return
    }

    let raf = 0
    let disposed = false
    const particles = Array.from({ length: 28 }, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      r: 1.5 + Math.random() * 3.5,
      s: 0.15 + Math.random() * 0.45,
      a: 0.08 + Math.random() * 0.22,
      p: Math.random() * Math.PI * 2,
      i,
    }))

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) {
        return
      }
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

    const draw = (now: number) => {
      if (disposed) {
        return
      }
      const parent = canvas.parentElement
      if (!parent) {
        return
      }
      const { width, height } = parent.getBoundingClientRect()
      ctx.clearRect(0, 0, width, height)

      for (const p of particles) {
        const x = (p.x + Math.sin(now * 0.00025 + p.p) * 0.04) * width
        const y = ((p.y + ((now * 0.00004 * p.s) % 1)) % 1) * height
        const glow = ctx.createRadialGradient(x, y, 0, x, y, p.r * 14)
        glow.addColorStop(0, hexToRgba(accent, p.a))
        glow.addColorStop(1, hexToRgba(accent, 0))
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(x, y, p.r * 14, 0, Math.PI * 2)
        ctx.fill()
      }

      raf = window.requestAnimationFrame(draw)
    }

    raf = window.requestAnimationFrame(draw)

    return () => {
      disposed = true
      window.cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [accent])

  return (
    <div
      className={`ocean-layer ${active ? 'is-active' : ''}`}
      style={{ backgroundImage: gradient }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="ocean-particles" />
      <div className="ocean-mask" />
    </div>
  )
}

function hexToRgba(hex: string, alpha: number) {
  const raw = hex.replace('#', '')
  const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw
  const n = Number.parseInt(full, 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
