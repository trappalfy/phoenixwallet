// Molten-filament fragment shader (brief §6). GLSL ES 3.00 for WebGL2.
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

// ember ramp, straight from the tokens
const vec3 CORE  = vec3(1.0,   0.914, 0.769); // #FFE9C4
const vec3 EMBER = vec3(1.0,   0.353, 0.122); // #FF5A1F
const vec3 COAL  = vec3(0.478, 0.118, 0.0);   // #7A1E00

void main(){
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;

  float t = uTime * 0.08;

  // domain-warped centreline
  float warp  = fbm(vec2(p.x * 1.6 + t, t * 0.7)) - 0.5;
  float thick = 0.02 + 0.05 * fbm(vec2(p.x * 2.5 - t * 1.3, 4.0));
  float d = abs(p.y - warp * 0.28 - uMouse.y * 0.02);

  float core = smoothstep(thick * 0.35, 0.0, d);
  float glow = smoothstep(thick * 6.0,  0.0, d);
  float halo = smoothstep(thick * 18.0, 0.0, d);

  // heat varies along the length so the core breaks into hot / cooled stretches
  float heat = fbm(vec2(p.x * 4.0 - t * 1.8, 3.0));
  vec3 coreCol = mix(EMBER, CORE, smoothstep(0.40, 0.85, heat));

  vec3 col = coreCol * core
           + EMBER * pow(glow, 1.6) * 0.9
           + COAL  * pow(halo, 2.2) * 0.55;

  // molten, not neon: strong bright/dim stretches + fine shimmer
  col *= 0.40 + 1.0 * heat;
  col *= 0.85 + 0.25 * valueNoise(vec2(p.x * 9.0 + t * 2.4, 7.0));

  col *= uIntro;
  col *= 1.0 - uScroll * 0.65;
  col += (hash21(gl_FragCoord.xy + vec2(uTime)) - 0.5) * 0.015; // dither, kills banding

  fragColor = vec4(max(col, 0.0), 1.0);
}
`
}
