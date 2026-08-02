// Footer background — evaporating 3D-noise dust field with a sparse starfield.
// Ported to GLSL ES 3.00 so it runs through the project's existing raw-WebGL2
// runner (src/gl/webgl.ts, uniforms uTime/uRes/uMouse) — no OGL dependency.
//
// Character knobs are baked as consts; to retune, edit the const block. Keep
// heat ≤ 0.5 and intensity ≤ 0.16 — this is background texture, not a light
// source, and both guardrails came from a real overshoot during tuning.
export const SMOKE_FRAG = `#version 300 es
precision highp float;
out vec4 fragColor;

uniform float uTime;
uniform vec2  uRes;
uniform vec2  uMouse;   // -1..1, lerped by the driver

const vec3  BG        = vec3(0.01961, 0.01961, 0.02353); // #050506
const vec3  DUST      = vec3(0.482353, 0.521569, 0.650980); // #7B85A6 — cool dust
const vec3  KNOT      = vec3(0.654902, 0.545098, 0.980392); // #A78BFA — ionised knots
const float SCALE     = 1.45;
const float EVOLVE    = 0.055;
const float RISE      = 0.024;
const float WARP      = 0.95;
const float INTENSITY = 0.11;
const float HEAT      = 0.32;
const float LO        = 0.38;
const float HI        = 0.86;

/* simplex noise 3D — Ashima Arts / Stefan Gustavson, MIT */
vec3 mod289(vec3 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 mod289(vec4 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 permute(vec4 x){ return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g  = step(x0.yzx, x0.xyz);
  vec3 l  = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j  = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

#define OCTAVES 4
float fbm(vec3 p){
  float a = 0.5, sum = 0.0;
  for(int i = 0; i < OCTAVES; i++){
    sum += a * snoise(p);
    p = p * 2.03 + vec3(11.3, 7.7, 3.1);
    a *= 0.5;
  }
  return sum;
}

float smokeField(vec2 p, float t){
  vec3 q = vec3(p * SCALE, t * EVOLVE);   // Z = time: evaporate in place
  q.y -= t * RISE;                         // slow rise
  q.x += sin(t * 0.06) * 0.12;             // sway, breaks periodicity
  vec3 w = vec3(fbm(q), fbm(q + vec3(5.2, 1.3, 2.8)), 0.0);
  return fbm(q + WARP * w);                // domain warping
}

float hash21(vec2 p){
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main(){
  vec2 frag = gl_FragCoord.xy;
  vec2 p = (frag - 0.5 * uRes) / uRes.y;   // aspect-correct, centre at 0
  p += uMouse * 0.035;

  float d = smokeField(p, uTime);
  d = d * 0.5 + 0.5;
  d = smoothstep(LO, HI, d);

  // big mask: dust lives in the middle, corners stay black
  float mask = smoothstep(1.20, 0.10, length((p - vec2(0.06, -0.04)) * vec2(0.70, 1.0)));
  d *= mask;

  vec3 col = mix(BG, DUST, d * INTENSITY);

  // ionised knots: only the top of the density, nothing below
  float heat = pow(d, 4.0) * HEAT;
  col = mix(col, KNOT, heat * 0.55);

  // gloss: soft top-centre highlight, gives the black volume
  float gloss = smoothstep(0.9, -0.1, length((p - vec2(0.0, 0.45)) * vec2(0.55, 1.0)));
  col += vec3(0.016, 0.015, 0.017) * gloss;

  // background starfield — sparse, gently twinkling, dimmed inside the dust
  // itself so it reads as a layer behind it rather than scattered over it
  vec2 starCell = floor(frag / 2.6);
  float starHash = hash21(starCell + 91.7);
  float star = step(0.9982, starHash) * (0.5 + 0.5 * sin(uTime * 0.9 + starHash * 62.83));
  col += vec3(0.75, 0.8, 1.0) * star * (1.0 - d) * 0.85;

  // dithering — mandatory, else near-black bands
  col += (hash21(frag + fract(uTime)) - 0.5) / 255.0;

  fragColor = vec4(col, 1.0);
}`
