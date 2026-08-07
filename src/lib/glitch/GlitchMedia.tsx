import { useEffect, useRef, useState } from 'react'
import {
  COMBINED_FRAG_SHADER,
  VERTEX_SHADER,
  createProgram,
} from './shaders'

interface GlitchMediaProps {
  gradient: string
  title: string
  subtitle?: string
  className?: string
}

function canUseWebGL() {
  if (typeof window === 'undefined') {
    return false
  }
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
  } catch {
    return false
  }
}

function shouldDowngradeGlitch() {
  if (typeof window === 'undefined') {
    return true
  }
  return (
    !canUseWebGL() || window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export function GlitchMedia({
  gradient,
  title,
  subtitle,
  className = '',
}: GlitchMediaProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sourceRef = useRef<HTMLCanvasElement>(null)
  const readyRef = useRef(false)
  const [ready, setReady] = useState(false)
  const [downgrade] = useState(shouldDowngradeGlitch)

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    const source = sourceRef.current
    if (downgrade || !wrap || !canvas || !source) {
      return
    }

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
    })

    if (!gl) {
      return
    }

    let disposed = false
    let raf = 0
    let program: WebGLProgram | null = null
    let texture: WebGLTexture | null = null
    const startedAt = performance.now()

    const drawSourceFrame = (width: number, height: number, t: number) => {
      const ctx = source.getContext('2d')
      if (!ctx) {
        return
      }
      source.width = width
      source.height = height

      const fill = ctx.createLinearGradient(0, 0, width, height)
      fill.addColorStop(0, '#0ea5e9')
      fill.addColorStop(0.4, '#0369a1')
      fill.addColorStop(1, '#020617')
      ctx.fillStyle = fill
      ctx.fillRect(0, 0, width, height)

      for (let i = 0; i < 6; i += 1) {
        const x = width * (0.12 + 0.15 * i) + Math.sin(t * 0.0011 + i) * 34
        const y = height * (0.32 + 0.1 * Math.sin(t * 0.0008 + i * 1.4))
        const r = 36 + i * 16
        const blob = ctx.createRadialGradient(x, y, 2, x, y, r)
        blob.addColorStop(0, `rgba(165, 243, 252, ${0.38 - i * 0.04})`)
        blob.addColorStop(1, 'rgba(165, 243, 252, 0)')
        ctx.fillStyle = blob
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.fillStyle = 'rgba(255,255,255,0.9)'
      ctx.font = `600 ${Math.max(18, width * 0.048)}px "Syne", "PingFang SC", sans-serif`
      ctx.fillText(title, width * 0.08, height * 0.76)
      if (subtitle) {
        ctx.fillStyle = 'rgba(186, 230, 253, 0.86)'
        ctx.font = `400 ${Math.max(12, width * 0.028)}px "PingFang SC", sans-serif`
        ctx.fillText(subtitle, width * 0.08, height * 0.86)
      }
    }

    try {
      const created = createProgram(gl, VERTEX_SHADER, COMBINED_FRAG_SHADER)
      program = created.program

      const buffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
          -1, -1, 0, 0,
          1, -1, 1, 0,
          -1, 1, 0, 1,
          1, 1, 1, 1,
        ]),
        gl.STATIC_DRAW,
      )

      texture = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

      const render = (now: number) => {
        if (disposed || !program) {
          return
        }

        const rect = wrap.getBoundingClientRect()
        const cssW = Math.max(1, Math.floor(rect.width))
        const cssH = Math.max(1, Math.floor(rect.height))
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        const width = Math.floor(cssW * dpr * 2)
        const height = Math.floor(cssH * dpr * 2)

        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width
          canvas.height = height
          canvas.style.width = `${cssW * 2}px`
          canvas.style.height = `${cssH * 2}px`
          canvas.style.transform = 'translateX(-25%) translateY(-25%)'
        }

        drawSourceFrame(width, height, now - startedAt)

        gl.viewport(0, 0, width, height)
        gl.clearColor(0, 0, 0, 0)
        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source)

        gl.useProgram(program)
        const stride = 4 * Float32Array.BYTES_PER_ELEMENT
        const aPos = gl.getAttribLocation(program, 'a_position')
        const aUv = gl.getAttribLocation(program, 'a_texCoord')
        gl.enableVertexAttribArray(aPos)
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, stride, 0)
        gl.enableVertexAttribArray(aUv)
        gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, stride, 8)
        gl.uniform1i(gl.getUniformLocation(program, 'uTexture'), 0)
        gl.uniform2f(gl.getUniformLocation(program, 'uCompWh'), width, height)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

        if (!readyRef.current) {
          readyRef.current = true
          setReady(true)
        }

        raf = window.requestAnimationFrame(render)
      }

      raf = window.requestAnimationFrame(render)
    } catch {
      // Keep CSS fallback visible when WebGL init fails.
    }

    return () => {
      disposed = true
      window.cancelAnimationFrame(raf)
      if (texture) {
        gl.deleteTexture(texture)
      }
      if (program) {
        gl.deleteProgram(program)
      }
    }
  }, [downgrade, subtitle, title])

  return (
    <div className={`glitch-media ${className}`} ref={wrapRef}>
      <div className="glitch-fallback" style={{ backgroundImage: gradient }} aria-hidden="true">
        <strong>{title}</strong>
        {subtitle ? <span>{subtitle}</span> : null}
      </div>
      {!downgrade ? (
        <>
          <canvas className="glitch-source" hidden ref={sourceRef} />
          <canvas
            aria-hidden="true"
            className={`glitch-canvas ${ready ? 'is-ready' : ''}`}
            ref={canvasRef}
          />
        </>
      ) : null}
    </div>
  )
}
