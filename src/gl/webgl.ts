// Minimal raw-WebGL2 renderer for a single fullscreen triangle (no OGL, no three.js).
// The triangle is generated from gl_VertexID, so there are no vertex buffers.

const VERT = `#version 300 es
const vec2 verts[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
void main(){ gl_Position = vec4(verts[gl_VertexID], 0.0, 1.0); }`

export type Uniforms = {
  time: number
  mouse: [number, number]
  scroll: number
  intro: number
}

export type GLScene = {
  render: (u: Uniforms) => void
  resize: (dprCap: number) => void
  dispose: () => void
}

function compile(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader {
  const sh = gl.createShader(type)!
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh)
    gl.deleteShader(sh)
    throw new Error(`shader compile failed: ${log}`)
  }
  return sh
}

function link(gl: WebGL2RenderingContext, vertSrc: string, fragSrc: string): WebGLProgram {
  const vs = compile(gl, gl.VERTEX_SHADER, vertSrc)
  const fs = compile(gl, gl.FRAGMENT_SHADER, fragSrc)
  const prog = gl.createProgram()!
  gl.attachShader(prog, vs)
  gl.attachShader(prog, fs)
  gl.linkProgram(prog)
  gl.deleteShader(vs)
  gl.deleteShader(fs)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(prog)
    gl.deleteProgram(prog)
    throw new Error(`program link failed: ${log}`)
  }
  return prog
}

// Returns null if WebGL2 is unavailable or the program fails to build —
// the caller then shows the CSS fallback.
export function createGLScene(canvas: HTMLCanvasElement, fragSrc: string): GLScene | null {
  const gl = canvas.getContext('webgl2', {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'high-performance',
  })
  if (!gl) return null

  let prog: WebGLProgram
  try {
    prog = link(gl, VERT, fragSrc)
  } catch (err) {
    console.warn('[shader]', err)
    return null
  }

  gl.useProgram(prog)
  const vao = gl.createVertexArray() // WebGL2 requires a bound VAO to draw
  gl.bindVertexArray(vao)

  const uTime = gl.getUniformLocation(prog, 'uTime')
  const uRes = gl.getUniformLocation(prog, 'uRes')
  const uMouse = gl.getUniformLocation(prog, 'uMouse')
  const uScroll = gl.getUniformLocation(prog, 'uScroll')
  const uIntro = gl.getUniformLocation(prog, 'uIntro')

  function resize(dprCap: number) {
    const dpr = Math.min(window.devicePixelRatio || 1, dprCap)
    const w = Math.max(1, Math.floor(canvas.clientWidth * dpr))
    const h = Math.max(1, Math.floor(canvas.clientHeight * dpr))
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
    }
    gl!.viewport(0, 0, canvas.width, canvas.height)
  }

  function render(u: Uniforms) {
    gl!.uniform1f(uTime, u.time)
    gl!.uniform2f(uRes, canvas.width, canvas.height)
    gl!.uniform2f(uMouse, u.mouse[0], u.mouse[1])
    gl!.uniform1f(uScroll, u.scroll)
    gl!.uniform1f(uIntro, u.intro)
    gl!.drawArrays(gl!.TRIANGLES, 0, 3)
  }

  function dispose() {
    gl!.deleteProgram(prog)
    gl!.deleteVertexArray(vao)
    gl!.getExtension('WEBGL_lose_context')?.loseContext()
  }

  return { render, resize, dispose }
}
