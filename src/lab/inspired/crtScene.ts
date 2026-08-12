/**
 * CRT / interference hero scene.
 * Inspired by contemporary AI brand homepage craft (WebGL text distortion + halo).
 * Original implementation — no third-party brand assets.
 */

const VERT = `attribute vec2 a_pos;
varying vec2 v_uv;
void main(){
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`

const FRAG = `precision highp float;
varying vec2 v_uv;
uniform sampler2D u_tex;
uniform vec2 u_res;
uniform float u_time;
uniform float u_glitch;

float hash(vec2 p){
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main(){
  vec2 uv = v_uv;
  float t = u_time;

  // gentle wave
  uv.x += sin(uv.y * 28.0 + t * 1.6) * 0.0018 * u_glitch;
  uv.y += cos(uv.x * 22.0 + t * 1.2) * 0.0012 * u_glitch;

  // intermittent horizontal tear
  float tearBand = step(0.985, hash(vec2(floor(t * 4.0), floor(uv.y * 40.0))));
  uv.x += tearBand * (hash(vec2(t, uv.y)) - 0.5) * 0.04 * u_glitch;

  // RGB split
  float split = (0.0015 + 0.0025 * sin(t * 2.0)) * u_glitch;
  float r = texture2D(u_tex, uv + vec2(split, 0.0)).r;
  float g = texture2D(u_tex, uv).g;
  float b = texture2D(u_tex, uv - vec2(split, 0.0)).b;
  float a = texture2D(u_tex, uv).a;
  vec3 col = vec3(r, g, b);

  // scanlines
  float scan = 0.88 + 0.12 * sin(uv.y * u_res.y * 3.14159);
  col *= mix(1.0, scan, 0.55 * u_glitch);

  // soft vignette
  float vig = smoothstep(1.15, 0.25, length(uv - 0.5));
  col *= mix(0.75, 1.0, vig);

  // film grain
  float n = hash(uv * u_res + t) * 0.06 * u_glitch;
  col += n;

  // bloom hint aligned with title/halo (visual center ~28% from top → uv.y 0.72)
  float ringDist = abs(length((uv - vec2(0.5, 0.72)) * vec2(u_res.x / u_res.y, 1.0)) - 0.18);
  float ring = smoothstep(0.04, 0.0, ringDist);
  col += vec3(0.55) * ring * 0.35;

  gl_FragColor = vec4(col, a);
}`

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)
  if (!s) throw new Error('shader')
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(s)
    gl.deleteShader(s)
    throw new Error(info || 'compile')
  }
  return s
}

function createProgram(gl: WebGLRenderingContext) {
  const p = gl.createProgram()
  if (!p) throw new Error('program')
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, VERT))
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, FRAG))
  gl.linkProgram(p)
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(p) || 'link')
  }
  return p
}

export function drawTitleTexture(
  text: string,
  width: number,
  height: number,
): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = width
  c.height = height
  const ctx = c.getContext('2d')!
  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, width, height)

  const fontSize = Math.min(width * 0.16, height * 0.26)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `800 ${fontSize}px "Syne", "IBM Plex Sans", "PingFang SC", sans-serif`

  // Align with .signal-halo (top: 28%) so tagline below stays clear
  const titleY = height * 0.28

  // outer glow
  ctx.shadowColor = 'rgba(255,255,255,0.45)'
  ctx.shadowBlur = fontSize * 0.22
  ctx.fillStyle = 'rgba(255,255,255,0.98)'
  ctx.fillText(text, width / 2, titleY)

  // crisp core
  ctx.shadowBlur = 0
  ctx.fillStyle = '#ffffff'
  ctx.fillText(text, width / 2, titleY)
  return c
}

export type CrtHandle = { destroy: () => void }

export function mountCrtScene(
  canvas: HTMLCanvasElement,
  options: { text?: string; glitch?: number } = {},
): CrtHandle {
  const text = options.text ?? 'NafYoung'
  const glitch = options.glitch ?? 1
  const gl = canvas.getContext('webgl', {
    alpha: false,
    antialias: false,
    premultipliedAlpha: false,
  })
  if (!gl) {
    return { destroy: () => undefined }
  }

  const program = createProgram(gl)
  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW,
  )

  const tex = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

  const aPos = gl.getAttribLocation(program, 'a_pos')
  const uTex = gl.getUniformLocation(program, 'u_tex')
  const uRes = gl.getUniformLocation(program, 'u_res')
  const uTime = gl.getUniformLocation(program, 'u_time')
  const uGlitch = gl.getUniformLocation(program, 'u_glitch')

  let raf = 0
  let disposed = false
  const start = performance.now()

  const uploadTitle = () => {
    const title = drawTitleTexture(text, canvas.width, canvas.height)
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, title)
  }

  const resize = () => {
    const parent = canvas.parentElement
    if (!parent) return
    const { width, height } = parent.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = Math.max(1, Math.floor(width * dpr))
    const h = Math.max(1, Math.floor(height * dpr))
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      uploadTitle()
    }
    gl.viewport(0, 0, canvas.width, canvas.height)
  }

  resize()
  // Re-bake title once fonts settle (Syne may load after first paint)
  void document.fonts.ready.then(() => {
    if (!disposed) uploadTitle()
  })
  window.addEventListener('resize', resize)

  const render = (now: number) => {
    if (disposed) return
    gl.useProgram(program)
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.uniform1i(uTex, 0)
    gl.uniform2f(uRes, canvas.width, canvas.height)
    gl.uniform1f(uTime, (now - start) / 1000)
    gl.uniform1f(uGlitch, glitch)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    raf = requestAnimationFrame(render)
  }
  raf = requestAnimationFrame(render)

  return {
    destroy: () => {
      disposed = true
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      gl.deleteTexture(tex)
      gl.deleteProgram(program)
    },
  }
}
