// Nebula-filament fragment shader. GLSL ES 3.00 for WebGL2.
// OCTAVES is injected per device (4 desktop / 3 mobile) — see Shader.tsx.
export function buildFrag(octaves: number): string {
  return `#version 300 es
precision highp float;
out vec4 fragColor;

uniform float uTime;   // seconds
uniform vec2  uRes;    // drawing-buffer size in px
uniform vec2  uMouse;  // -1..1, lerped
uniform float uScroll; // 0..1 hero scroll progress
uniform float uIntro;  // 0..1, ramped on load

#define OCTAVES ${Math.max(1, Math.floor(octaves))}

float hash21(vec2 p){
  p = fract(p * vec2(123.34, 345.45));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}

float valueNoise(vec2 p){
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p){
  float v = 0.0;
  float a = 0.5;
  for(int i = 0; i < OCTAVES; i++){
    v += a * valueNoise(p);
    p *= 2.02;
    a *= 0.5;
  }
  return v;
}

// nebula ramp, straight from the tokens
const vec3 CORE = vec3(0.768627, 0.709804, 0.992157); // #C4B5FD
const vec3 HOT  = vec3(0.133333, 0.827451, 0.933333); // #22D3EE — ionised peaks, used sparingly
const vec3 BODY = vec3(0.545098, 0.360784, 0.964706); // #8B5CF6
const vec3 HALO = vec3(0.166274, 0.192941, 0.606274); // accent-800 → blue-600, the cool outer fringe

void main(){
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;

  float t = uTime * 0.08;

  // domain-warped centreline — the nebula's spine
  float warp  = fbm(vec2(p.x * 1.6 + t, t * 0.7)) - 0.5;
  float thick = 0.02 + 0.05 * fbm(vec2(p.x * 2.5 - t * 1.3, 4.0));
  float d = abs(p.y - warp * 0.28 - uMouse.y * 0.02);

  float core = smoothstep(thick * 0.35, 0.0, d);
  float glow = smoothstep(thick * 6.0,  0.0, d);
  float halo = smoothstep(thick * 18.0, 0.0, d);

  // emission density varies along the length: the strand breaks into bright
  // ionised knots and dim stretches, same shape it always had — only the two
  // ends of the ramp moved, from ember/white-hot to violet/cyan.
  float heat = fbm(vec2(p.x * 4.0 - t * 1.8, 3.0));
  vec3 coreCol = mix(CORE, HOT, smoothstep(0.55, 0.92, heat));

  vec3 col = coreCol * core
           + BODY * pow(glow, 1.6) * 0.9
           + HALO * pow(halo, 2.2) * 0.55;

  // dust lanes: a second, coarser warp cutting across the strand, darkening
  // it in streaks so it reads as a nebula interrupted by dust, not a neon
  // tube with an even glow.
  float dust = fbm(vec2(p.x * 3.2 + t * 0.4, p.y * 5.5 - t * 0.5));
  col *= 1.0 - 0.5 * smoothstep(0.52, 0.75, dust) * (glow * 0.6 + halo * 0.4);

  // density still drives brightness — strong bright/dim stretches + fine shimmer
  col *= 0.40 + 1.0 * heat;
  col *= 0.85 + 0.25 * valueNoise(vec2(p.x * 9.0 + t * 2.4, 7.0));

  // sparse background stars: a screen-space hash grid, gently twinkling,
  // dimmed inside the strand's own glow so they read as a field behind it
  // rather than static laid over it.
  vec2 starCell = floor(gl_FragCoord.xy / 3.0);
  float starHash = hash21(starCell);
  float star = step(0.9975, starHash) * (0.5 + 0.5 * sin(uTime * 1.3 + starHash * 62.83));
  col += vec3(0.8, 0.85, 1.0) * star * (1.0 - clamp(glow + halo, 0.0, 1.0)) * 0.9;

  col *= uIntro;
  col *= 1.0 - uScroll * 0.65;
  col += (hash21(gl_FragCoord.xy + vec2(uTime)) - 0.5) * 0.015; // dither, kills banding

  fragColor = vec4(max(col, 0.0), 1.0);
}
`
}
