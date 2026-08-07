import { useEffect, useRef, useState } from 'react'
import { COMBINED_FRAG_SHADER, VERTEX_SHADER, createProgram } from './shaders'

interface GlitchVideoProps {
  src: string
  poster?: string
  className?: string
  alt?: string
}

function preferDowngrade() {
  if (typeof window === 'undefined') return true
  const cores = navigator.hardwareConcurrency || 4
  if (cores <= 2) return true
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true
  try {
    const c = document.createElement('canvas')
    return !(c.getContext('webgl') || c.getContext('experimental-webgl'))
  } catch {
    return true
  }
}

/**
 * Jimeng-style Glitch media:
 * video (opacity 0 when ready) + supersampled WebGL canvas
 * (rounded SDF + edge chromatic aberration), IO play/pause, FPS downgrade.
 */
export function GlitchVideo({ src, poster, className = '', alt = '' }: GlitchVideoProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)
  const [downgrade] = useState(preferDowngrade)
  const readyRef = useRef(false)

  useEffect(() => {
    const wrap = wrapRef.current
    const video = videoRef.current
    if (!wrap || !video) return

    let io: IntersectionObserver | null = null
    const onIntersect: IntersectionObserverCallback = ([entry]) => {
      if (!entry) return
      if (entry.isIntersecting) {
        void video.play().catch(() => undefined)
      } else {
        video.pause()
      }
    }
    io = new IntersectionObserver(onIntersect, { threshold: 0.15 })
    io.observe(wrap)

    return () => io?.disconnect()
  }, [])

  useEffect(() => {
    if (downgrade) return
    const wrap = wrapRef.current
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!wrap || !video || !canvas) return

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      premultipliedAlpha: false,
    })
    if (!gl) return

    let disposed = false
    let raf = 0
    let program: WebGLProgram | null = null
    let texture: WebGLTexture | null = null
    let frames = 0
    let lastFpsCheck = performance.now()
    let aborted = false

    try {
      program = createProgram(gl, VERTEX_SHADER, COMBINED_FRAG_SHADER)
      const buffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1, 1, 1, 1, 1]),
        gl.STATIC_DRAW,
      )
      texture = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

      const render = () => {
        if (disposed || aborted || !program) return

        if (video.readyState >= 2) {
          const rect = wrap.getBoundingClientRect()
          const cssW = Math.max(1, Math.floor(rect.width))
          const cssH = Math.max(1, Math.floor(rect.height))
          const dpr = Math.min(window.devicePixelRatio || 1, 2)
          // 2× supersample like Jimeng (translate -25%)
          const width = Math.floor(cssW * dpr * 2)
          const height = Math.floor(cssH * dpr * 2)

          if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width
            canvas.height = height
            canvas.style.width = `${cssW * 2}px`
            canvas.style.height = `${cssH * 2}px`
            canvas.style.transform = 'translateX(-25%) translateY(-25%)'
          }

          gl.viewport(0, 0, width, height)
          gl.clearColor(0, 0, 0, 0)
          gl.clear(gl.COLOR_BUFFER_BIT)
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
          gl.bindTexture(gl.TEXTURE_2D, texture)
          try {
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video)
          } catch {
            aborted = true
            return
          }

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

          frames += 1
          const now = performance.now()
          if (now - lastFpsCheck > 1500) {
            const fps = (frames * 1000) / (now - lastFpsCheck)
            frames = 0
            lastFpsCheck = now
            // Static FPS downgrade threshold ~ similar to Jimeng
            if (fps > 0 && fps < 20) {
              aborted = true
              setReady(false)
              return
            }
          }
        }

        raf = requestAnimationFrame(render)
      }

      raf = requestAnimationFrame(render)
    } catch {
      aborted = true
    }

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      if (texture) gl.deleteTexture(texture)
      if (program) gl.deleteProgram(program)
    }
  }, [downgrade, src])

  return (
    <div className={`glitch-wrap ${className}`} ref={wrapRef}>
      <video
        ref={videoRef}
        className={`glitch-video ${ready && !downgrade ? 'is-hidden' : 'is-visible'}`}
        src={src}
        poster={poster}
        muted
        playsInline
        loop
        autoPlay
        preload="metadata"
        disablePictureInPicture
        aria-label={alt}
      />
      {!downgrade ? (
        <canvas
          ref={canvasRef}
          className={`glitch-canvas ${ready ? 'is-ready' : ''}`}
          aria-hidden="true"
        />
      ) : null}
    </div>
  )
}
