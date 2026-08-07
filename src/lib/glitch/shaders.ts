export const VERTEX_SHADER = `attribute vec4 a_position;
attribute vec2 a_texCoord;
varying highp vec2 v_texCoord;
void main() {
  gl_Position = a_position;
  v_texCoord = a_texCoord;
}`

/** Jimeng-style: chromatic edge distortion + rounded soft mask in one pass */
export const COMBINED_FRAG_SHADER = `precision highp float;
varying vec2 v_texCoord;
uniform sampler2D uTexture;
uniform vec2 uCompWh;
const float edgeIntensity = 0.2;

float roundedBoxSDF(vec2 p, vec2 size, float r) {
  return length(max(abs(p) - size + r, 0.0)) - r;
}

vec2 computeUV(vec2 uv, float k, float kcube) {
  if (uv.y < 0.5) {
    return uv;
  }
  vec2 t = uv - 0.5;
  float r2 = t.y * t.y;
  float f = 1.0 + r2 * (k + kcube * sqrt(r2));
  return f * t + 0.5;
}

void main() {
  float k = -1.5 * edgeIntensity;
  float kcube = 0.1 * edgeIntensity;
  float offset = 0.1 * edgeIntensity;

  vec4 red = texture2D(uTexture, computeUV(v_texCoord, k + offset, kcube));
  vec4 green = texture2D(uTexture, computeUV(v_texCoord, k, kcube));
  vec4 blue = texture2D(uTexture, computeUV(v_texCoord, k - offset, kcube));
  float alpha = (red.a + green.a + blue.a) / 3.0;
  vec4 color = vec4(red.r, green.g, blue.b, alpha);

  vec2 fragCoord = v_texCoord * uCompWh;
  float radius = 40.0;
  float distance = roundedBoxSDF(fragCoord - uCompWh * 0.5, uCompWh * 0.5, radius);
  float smoothedAlpha = smoothstep(0.0, 2.0, distance);
  gl_FragColor = mix(color, vec4(0.0), smoothedAlpha);
}`

export function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) throw new Error('shader')
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader)
    gl.deleteShader(shader)
    throw new Error(info || 'compile')
  }
  return shader
}

export function createProgram(gl: WebGLRenderingContext, vs: string, fs: string) {
  const vertex = createShader(gl, gl.VERTEX_SHADER, vs)
  const fragment = createShader(gl, gl.FRAGMENT_SHADER, fs)
  const program = gl.createProgram()
  if (!program) throw new Error('program')
  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) || 'link')
  }
  return program
}
