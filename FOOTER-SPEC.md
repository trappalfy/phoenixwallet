# Phoenix Wallet — Footer. Полная спецификация реализации

> Задание для Claude Code. Собрать футер, идентичный референсу (desktop + mobile) по композиции,
> метрике и поведению, но на бренде **Phoenix Wallet**.
> Стек: **Vite + React 18 + TypeScript + Tailwind + GSAP 3.13 + Lenis + OGL**.
> Все числа выведены из скриншотов и приведены к **1440×934** (desktop) и **390×844** (mobile).

---

## 0. Как работать с документом

1. Порядок сборки строго такой: **токены → фон (§7) → сетка (§5–6) → текстовые блоки (§9–12) → wordmark (§13) → звук (§14) → анимации (§15)**.
2. После §7 и после §13 — стоп, скриншот 1440×934, сверка с референсом. Не идти дальше без сверки.
3. Все размеры — только через CSS-переменные из §3. Магических чисел в компонентах быть не должно.
4. Композиция зафиксирована референсом. Не добавлять: иконки соцсетей, карточки, рамки, скругления,
   «Back to top», формы подписки, градиентные кнопки. Единственный «дорогой» элемент страницы —
   линейный wordmark. Всё вокруг него молчит.
5. Оранжевый **ember — акцент, а не заливка**. Он появляется ровно в трёх местах: в горячих ядрах
   дыма, в hover-волне wordmark'а и в hover-состояниях ссылок. Больше нигде.

---

## 1. Данные бренда

```ts
// src/components/footer/footer.config.ts
export const FOOTER = {
  brandName:  'PHOENIX',                  // то, что рисуется линиями внизу
  brandMark:  '/brand/phoenix-wordmark.svg', // ← ПРИОРИТЕТ. null → рисуем шрифтом (см. §13.2)
  legal:      '©Phoenix Wallet® 2026',

  eyebrow:    "YOUR KEYS. YOUR CHAIN. YOUR CALL.",
  headline:   ['Ready to hold', 'something real?'],

  cta:        { label: 'START A CONVERSATION', href: '/contact' },

  email:      'hello@phoenixwallet.com',
  phone:      null,                        // null → строка «P.» не рендерится

  socials: [                               // порядок = колонка 1 сверху вниз, затем колонка 2
    { label: 'X',        href: '' },
    { label: 'Discord',  href: '' },
    { label: 'Github',   href: '' },
    { label: 'Telegram', href: '' },
  ],

  timezone:      'Europe/Warsaw',
  timezoneLabel: 'CET',
} as const;
```

**Копирайтинг — под замену.** Я поставил заглушки, исходя из того, что Phoenix Wallet — некастодиальный
кошелёк. Альтернативы для заголовка, если позиционирование другое:
`['Ready to own', 'your keys?']` · `['Ready to leave', 'the exchange?']` · `['Ready to rise', 'from the ashes?']`
(последний — прямая отсылка к имени, но легко скатывается в пафос; брать, только если тон бренда его держит).
Eyebrow остаётся одной строкой капсом с точкой в конце — это часть формы, а не текста.

---

## 2. Анатомия

Футер — секция высотой `100svh` (минимум 820px на десктопе), с живым дымным фоном. Пять блоков:

```
DESKTOP (1440×934)
┌──────────────────────────────────────────────────────────────────────────────┐
│ ┌34px                                                                   34px┐ │
│  YOUR KEYS. YOUR CHAIN. YOUR CALL.                       CET → 20:03  [A]    │  ← 52px от верха
│                                                                              │
│  Ready to hold                                                               │
│  something real?                       ┌──────────────────────────┐          │
│         [B] Cabinet Bold 74/74         │ START A CONVERSATION   → │ [C]      │
│                                        └──────────────────────────┘          │
│                                          ↑ низ линии = базовая линия         │
│                                            2-й строки заголовка              │
│                                                                              │
│  ©Phoenix Wallet® 2026   BUSINESS ENQUIRY      SOCIAL                        │
│                          E. hello@phoenix…     X            Github           │
│  SOUND ON ♪ HOVER…                             Discord      Telegram    [D]  │
│                          ↑ col 9/12            ↑ col 11/12  ↑ 92%            │
│                                                                              │
│                        ← гибкий пружинящий отступ →                          │
│                                                                              │
│  ▬▬▬▬▬▬  ▬▬  ▬▬  ▬▬▬▬▬▬  ▬▬▬▬  ▬▬▬  ▬▬  ▬▬  ▬▬▬  ▬▬▬  ▬▬▬▬                    │
│  ▬▬  ▬▬  ▬▬  ▬▬  ▬▬      ▬▬ ▬  ▬▬▬  ▬▬  ▬▬  ▬▬     ▬▬▬  ▬▬              [E]  │
│  ▬▬▬▬▬▬  ▬▬▬▬▬▬  ▬▬▬▬    ▬▬ ▬  ▬▬▬  ▬▬  ▬▬   ▬▬▬   ▬▬  ▬▬▬                    │
│  ▬▬      ▬▬  ▬▬  ▬▬▬▬▬▬  ▬▬▬▬  ▬▬▬  ▬▬▬▬▬▬  ▬▬  ▬▬  ▬▬  ▬▬▬▬                  │
│                                                                        30px  │
└──────────────────────────────────────────────────────────────────────────────┘
```

```
MOBILE (390×844)
┌──────────────────────┐
│ ┌16px          16px┐ │
│  YOUR KEYS. YOUR…    │  ← 33px
│                      │
│  Ready to hold       │  30/34
│  something real?     │
│                      │
│  START A CONVERSA… → │
│  ──────────────────  │  194px
│                      │
│                      │
│  BUSINESS ENQUIRY    │
│  E. hello@phoenix…   │
│                      │
│  SOCIAL              │
│  X          Github   │  ← 2-я колонка с 50%
│  Discord    Telegram │
│                      │
│  ©Phoenix Wallet…    │
│                      │
│   ← пружина →        │
│                      │
│ ▬▬▬▬ ▬▬▬ ▬ ▬▬ ▬▬ ▬▬  │  ← full-bleed, обрезан низом вьюпорта
└──────────────────────┘
```

Отличия mobile: часов нет; строки «SOUND ON…» нет; копирайт переезжает **вниз**, под соцсети;
wordmark идёт **в край экрана** и **обрезается** нижней границей на ~15% высоты.

---

## 3. Токены

### 3.1 Палитра

```css
:root{
  /* база — «чёрный глянец»: не плоский #000, а чуть тёплый уголь */
  --bg:            #050506;
  --bg-elev:       #0C0C0E;

  /* дым */
  --smoke-cool:    #8A8F9C;   /* основная масса дымки, десатурированная */
  --smoke-ember:   #FF6A2C;   /* горячие ядра, подмешиваются только на пике плотности */

  /* ember — акцент */
  --ember:         #FF5A1F;
  --ember-hot:     #FFB27A;   /* пик волны на wordmark'е */
  --ember-deep:    #A8330F;   /* тлеющий низ, hover-подчёркивания */

  /* текст */
  --fg:            #F2F0EE;   /* тёплый белый, не #FFF — иначе спорит с ember */
  --fg-muted:      rgba(242,240,238,.55);
  --fg-dim:        rgba(242,240,238,.38);
  --rule:          rgba(242,240,238,.20);
  --rule-hover:    var(--ember);
  --wm-line:       rgba(242,240,238,.52);
}
```

Почему `--fg` не чистый белый: рядом с ember-оранжевым холодный `#FFFFFF` выглядит синеватым и
разваливает температуру кадра. `#F2F0EE` держит всё в одной тёплой гамме — это и есть «глянцевый
чёрный», а не «матовый чёрный + белый текст».

### 3.2 Сетка, типографика, motion

```css
:root{
  --gutter:        clamp(16px, 2.4vw, 34px);
  --pad-top:       clamp(28px, 5.6vh, 52px);
  --pad-bottom:    clamp(0px, 3.2vh, 30px);

  --f-display:     'Cabinet Grotesk', 'Helvetica Neue', Arial, sans-serif;
  --f-body:        'Switzer', 'Helvetica Neue', Arial, sans-serif;

  --t-eyebrow:     11px;
  --t-label:       11px;
  --t-cta:         12px;
  --t-legal:       12px;
  --t-link:        clamp(14px, 1.05vw, 15px);
  --t-headline:    clamp(30px, 5.15vw, 74px);

  --ls-util:       .10em;   /* eyebrow, лейблы, часы */
  --ls-cta:        .12em;
  --ls-headline:   -.035em;
  --lh-headline:   1.0;

  --wm-rows:       24;
  --wm-tracking:   -.04;    /* em, компенсирует ширину Cabinet Grotesk */

  --e-out:         cubic-bezier(.16,1,.3,1);
  --e-inout:       cubic-bezier(.65,.05,.36,1);
  --d-fast:        .28s;
  --d-mid:         .55s;
}

@media (max-width: 760px){
  :root{ --lh-headline: 1.13; --ls-headline: -.025em; --t-link: 15px; }
}
```

### 3.3 Проброс в Tailwind

Tailwind v4 (`src/styles/globals.css`):

```css
@import "tailwindcss";

@theme {
  --color-bg:       #050506;
  --color-ember:    #FF5A1F;
  --color-ember-hot:#FFB27A;
  --color-fg:       #F2F0EE;
  --font-display:   'Cabinet Grotesk', sans-serif;
  --font-body:      'Switzer', sans-serif;
}
```

Tailwind v3 (`tailwind.config.ts`) — то же самое через `theme.extend.colors` / `fontFamily`,
значения ссылаются на переменные: `ember: 'var(--ember)'`.

Правило разделения: **сетка и текстовые блоки — Tailwind-утилиты, wordmark и фон — обычный CSS-файл.**
Пытаться описать 24 ряда с динамическими `--sx` утилитами Tailwind бессмысленно.

---

## 4. Шрифты

У нас два начертания: **CabinetGrotesk-Bold** (display) и **Switzer-Regular** (body).

```css
@font-face{
  font-family:'Cabinet Grotesk'; src:url('/fonts/CabinetGrotesk-Bold.woff2') format('woff2');
  font-weight:700; font-style:normal; font-display:swap;
}
@font-face{
  font-family:'Switzer'; src:url('/fonts/Switzer-Regular.woff2') format('woff2');
  font-weight:400; font-style:normal; font-display:swap;
}
```

В `index.html` — `<link rel="preload" as="font" type="font/woff2" crossorigin>` на оба файла.
Без preload wordmark просканируется по fallback-шрифту и перестроится с прыжком.

### 4.1 Роли и два компромисса

| Роль | Шрифт |
|---|---|
| Заголовок | Cabinet Grotesk Bold |
| Wordmark (если нет SVG) | Cabinet Grotesk Bold |
| Eyebrow, часы, лейблы, CTA, копирайт | Switzer Regular, uppercase + широкий трекинг |
| Email, соцсети, значения | Switzer Regular |

**Компромисс 1 — нет моно.** На референсе служебные подписи набраны моноширинным. У нас его нет,
и тащить третий файл ради футера не стоит. Switzer Regular в капсе с трекингом `.10em` на 11px даёт
тот же технический характер. Единственное место, где это ломается — часы: пропорциональные цифры
дёргают строку каждую минуту. Лечится так:

```css
.clock time{ font-variant-numeric: tabular-nums; font-feature-settings:'tnum' 1; }
```
Если в Switzer-Regular нет `tnum` — оберни время в `<span class="w-[4.6ch] text-right tabular-nums">`,
фиксированная ширина решает проблему независимо от фичи шрифта.

**Компромисс 2 — Bold вместо Medium.** На референсе заголовок примерно Medium (500). Cabinet Bold
тяжелее, поэтому размер уже уменьшен с `5.45vw` до `5.15vw`, а трекинг ужат до `-.035em` — так
оптическая плотность строки совпадает с референсом. Если в проекте найдётся
`CabinetGrotesk-Medium.woff2`, поставь его на заголовок и верни `5.45vw` / `-.03em` — будет точнее.

---

## 5. Layout — desktop (≥1024px)

```css
.footer{
  position:relative; isolation:isolate;
  display:flex; flex-direction:column;
  min-height:max(100svh, 820px);
  padding:var(--pad-top) var(--gutter) var(--pad-bottom);
  background:var(--bg); color:var(--fg);
  overflow:hidden;                 /* обрезает wordmark и дым */
}
.footer__spacer{ flex:1 1 auto; min-height:48px; }
.footer__grid{ display:grid; grid-template-columns:repeat(12,1fr); column-gap:var(--gutter); }
```

| Блок | Колонки | Вертикаль |
|---|---|---|
| Eyebrow | 1–6 | row 1 |
| Часы | 11–12, `justify-self:end` | row 1 |
| Headline | 1–7 | row 2, `margin-top:24px` |
| CTA | 9–10 | row 2, `align-self:end` |
| Копирайт + строка звука | 1–4 | row 3, `margin-top:clamp(64px,9vh,130px)` |
| Business enquiry | 9–10 | row 3 |
| Social col 1 | 11 | row 3 |
| Social col 2 | 12 | row 3 |

Опорные X при 1440 для самопроверки: `gutter 34` · `CTA/enquiry ≈ 977px (67.8%)` ·
`social-1 ≈ 1218px (84.6%)` · `social-2 ≈ 1325px (92%)`.
Внутри row 3: лейбл → первый элемент **20px**, между строками **22px**; копирайт → «SOUND ON» **44px**.

**CTA не просто «справа».** Нижняя линия подчёркивания ложится на базовую линию второй строки
заголовка. Реализация: CTA в той же grid-row, `align-self:end`, плюс микроподгонка `translateY`
(2–4px) под Cabinet Grotesk.

---

## 6. Layout — mobile (<760px)

Линейная колонка. Интервалы при 390px:

| От → До | px |
|---|---|
| верх секции → eyebrow | 33 |
| eyebrow → headline (cap top) | 28 |
| headline (последняя базовая) → CTA | 60 |
| CTA → его линия | 12 |
| линия CTA → «BUSINESS ENQUIRY» | 87 |
| лейбл → первая строка | 34 |
| строка → строка | 24 |
| последняя строка блока → следующий лейбл | 48 |
| «Discord» → копирайт | 48 |
| копирайт → верх wordmark | пружина, минимум 72 |

- Соцсети: `grid-cols-2`, вторая колонка ровно с 50%.
- Ширина линии CTA: **194px** (не 100%). На десктопе — **225px**.
- Wordmark: `margin-inline:calc(var(--gutter)*-1); width:100vw;` и обязательный уход под нижнюю
  кромку: `margin-bottom:calc(var(--wm-height)*-.15)`.

Промежуточный 760–1023px: сетка десктопная, но правый кластер (enquiry + social) уезжает под
заголовок в две колонки.

---

## 7. ФОН — живой дым с тлеющими углями ⭐

Главное требование: дым должен **непрерывно испаряться и нарождаться заново**, как от костра, а не
ползти по экрану. Разница принципиальная:

- ❌ смещение шума (`uv + time`) — картинка едет, но не живёт, читается как паралакс;
- ✅ **эволюция 3D-шума по третьей оси** (`noise(vec3(uv, time))`) — плотность перерождается *на месте*:
  клубы истончаются, рвутся, собираются заново. Это и есть искомое ощущение.

Правильный рецепт — три движения одновременно:
1. **эволюция по Z** — испарение на месте (главное);
2. **очень медленный подъём вверх** — дым тянет вверх;
3. **domain warping** (искажение координат самим же шумом) — рваные закрученные языки вместо ватных шаров.

Плюс бренд-слой: в самых плотных ядрах дым **подсвечивается ember-оранжевым**, как угли внутри дыма.
Подмешивается по `pow(d, 4)`, то есть только верхние ~10% плотности. Это единственное место, где
оранжевый живёт постоянно — и оно же оправдывает имя Phoenix.

### 7.1 Слои (снизу вверх)

| z | Слой | Роль |
|---|---|---|
| 0 | сплошной `--bg` | база, страхует до инициализации WebGL |
| 1 | `<canvas>` (OGL) | дым |
| 2 | вертикальная маска | гасит дым у верхней и нижней кромки |
| 3 | зерно | 3.5%, убивает бандинг, даёт плёночность |
| 4 | виньетка + глянцевый блик | «чёрный глянец» |
| 10 | контент | |

```css
.footer__bg{ position:absolute; inset:0; z-index:0; pointer-events:none; }
.footer__bg canvas{ width:100%; height:100%; display:block; }
.footer > *:not(.footer__bg){ position:relative; z-index:1; }
```

### 7.2 Шейдер

OGL по умолчанию поднимает WebGL2-контекст, но GLSL ES 1.00 в нём компилируется — поэтому пишем
шейдеры в синтаксисе `attribute/varying/gl_FragColor`, как во всех примерах OGL. Не добавляй
`#version 300 es`.

`src/components/footer/smoke/smoke.vert.glsl`

```glsl
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
```

`src/components/footer/smoke/smoke.frag.glsl`

```glsl
precision highp float;
varying vec2 vUv;

uniform vec2  uResolution;
uniform float uTime;
uniform vec3  uBg;
uniform vec3  uSmoke;      // холодная масса дыма
uniform vec3  uEmber;      // горячие ядра
uniform float uScale;      // крупность клубов       0.9 – 2.2
uniform float uEvolve;     // скорость испарения     0.03 – 0.09
uniform float uRise;       // подъём вверх           0.01 – 0.05
uniform float uWarp;       // сила искажения         0.4 – 1.6
uniform float uIntensity;  // яркость дымки          0.06 – 0.16
uniform float uHeat;       // сколько угля видно     0.0 – 0.6
uniform float uLo;
uniform float uHi;
uniform vec2  uPointer;

/* ---------- simplex noise 3D — Ashima Arts / Stefan Gustavson, MIT ---------- */
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
/* --------------------------------------------------------------------------- */

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
  vec3 q = vec3(p * uScale, t * uEvolve);   // ← Z = время: испарение на месте
  q.y -= t * uRise;                          // ← подъём
  q.x += sin(t * 0.06) * 0.12;               // ← покачивание, ломает периодичность

  vec3 w = vec3(fbm(q), fbm(q + vec3(5.2, 1.3, 2.8)), 0.0);
  return fbm(q + uWarp * w);                 // ← domain warping
}

float hash21(vec2 p){
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main(){
  vec2 frag = gl_FragCoord.xy;
  vec2 p = (frag - 0.5 * uResolution) / uResolution.y;   // аспект-корректно, центр в 0
  p += uPointer * 0.035;

  float d = smokeField(p, uTime);
  d = d * 0.5 + 0.5;
  d = smoothstep(uLo, uHi, d);

  // крупная маска: дым живёт в середине, углы остаются чёрными
  float mask = smoothstep(1.20, 0.10, length((p - vec2(0.06, -0.04)) * vec2(0.70, 1.0)));
  d *= mask;

  // холодная масса
  vec3 col = mix(uBg, uSmoke, d * uIntensity);

  // тлеющие угли: только верхушка плотности, ниже — ничего
  float heat = pow(d, 4.0) * uHeat;
  col = mix(col, uEmber, heat * 0.55);

  // «глянец»: мягкий блик сверху-по-центру, даёт объём чёрному
  float gloss = smoothstep(0.9, -0.1, length((p - vec2(0.0, 0.45)) * vec2(0.55, 1.0)));
  col += vec3(0.016, 0.015, 0.017) * gloss;

  // дизеринг — обязателен, иначе на почти-чёрном будут полосы
  col += (hash21(frag + fract(uTime)) - 0.5) / 255.0;

  gl_FragColor = vec4(col, 1.0);
}
```

### 7.3 Раннер на OGL

`src/components/footer/smoke/createSmoke.ts`

```ts
import { Renderer, Program, Mesh, Triangle, Color, Vec2 } from 'ogl';
import vertex from './smoke.vert.glsl?raw';
import fragment from './smoke.frag.glsl?raw';

export type SmokeOptions = Partial<{
  renderScale: number; scale: number; evolve: number; rise: number;
  warp: number; intensity: number; heat: number; lo: number; hi: number;
}>;

export function createSmoke(canvas: HTMLCanvasElement, opts: SmokeOptions = {}) {
  const coarse = matchMedia('(pointer: coarse)').matches;
  const cfg = {
    renderScale: coarse ? 0.32 : 0.42,   // рендерим мелко — дым размытый, никто не заметит
    scale: 1.45, evolve: 0.055, rise: 0.024, warp: 0.95,
    intensity: 0.11, heat: 0.32, lo: 0.38, hi: 0.86,
    ...opts,
  };

  let renderer: Renderer;
  try { renderer = new Renderer({ canvas, alpha: false, antialias: false, depth: false,
                                  dpr: cfg.renderScale, powerPreference: 'low-power' }); }
  catch { return null; }                 // → вызывающий код включает CSS-фолбэк (§7.6)

  const gl = renderer.gl;
  const program = new Program(gl, {
    vertex, fragment,
    uniforms: {
      uResolution: { value: new Vec2(1, 1) },
      uTime:       { value: 0 },
      uBg:         { value: new Color('#050506') },
      uSmoke:      { value: new Color('#8A8F9C') },
      uEmber:      { value: new Color('#FF6A2C') },
      uScale:      { value: cfg.scale },
      uEvolve:     { value: cfg.evolve },
      uRise:       { value: cfg.rise },
      uWarp:       { value: cfg.warp },
      uIntensity:  { value: cfg.intensity },
      uHeat:       { value: cfg.heat },
      uLo:         { value: cfg.lo },
      uHi:         { value: cfg.hi },
      uPointer:    { value: new Vec2(0, 0) },
    },
  });
  const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

  const resize = () => {
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return;
    renderer.setSize(r.width, r.height);
    program.uniforms.uResolution.value.set(gl.canvas.width, gl.canvas.height);
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  const target = { x: 0, y: 0 };
  const onMove = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    target.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    target.y = 1 - ((e.clientY - r.top) / r.height) * 2;
  };
  if (!coarse) window.addEventListener('pointermove', onMove, { passive: true });

  const draw = (t: number) => {
    program.uniforms.uTime.value = t;
    renderer.render({ scene: mesh });
  };

  const FRAME = 1 / (coarse ? 24 : 30);
  let acc = 0, elapsed = 0, running = false, inView = false;

  const tick = (_t: number, delta: number) => {
    const dt = delta / 1000;
    acc += dt;
    if (acc < FRAME) return;
    acc = 0;
    elapsed += dt;
    const u = program.uniforms.uPointer.value;
    u.x += (target.x - u.x) * 0.045;              // инерция
    u.y += (target.y - u.y) * 0.045;
    draw(elapsed);
  };

  draw(12.0);                                      // один кадр сразу — фон не должен быть пустым

  return { tick, resize,
    setActive(v: boolean) { inView = v; running = v; },
    get running() { return running && inView; },
    destroy() {
      ro.disconnect();
      window.removeEventListener('pointermove', onMove);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}
```

### 7.4 Единый тикер: GSAP + Lenis + смок

**Критично:** не заводить свой `requestAnimationFrame`. В проекте уже есть Lenis и GSAP — всё должно
крутиться в одном тикере, иначе получишь два конкурирующих rAF и рваный скролл.

`src/lib/scroll.ts`

```ts
import Lenis from 'lenis';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const lenis = new Lenis({ duration: 1.1, smoothWheel: true });

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
```

В `SmokeBackground.tsx` подписка выглядит так:

```tsx
useEffect(() => {
  const smoke = createSmoke(canvasRef.current!);
  if (!smoke) { setFallback(true); return; }

  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const st = ScrollTrigger.create({
    trigger: sectionRef.current!,
    start: 'top bottom+=300',
    end: 'bottom top-=300',
    onToggle: (self) => smoke.setActive(self.isActive && !reduce.matches),
  });

  const tick = (t: number, d: number) => { if (smoke.running) smoke.tick(t, d); };
  gsap.ticker.add(tick);

  const onVis = () => smoke.setActive(!document.hidden && st.isActive && !reduce.matches);
  document.addEventListener('visibilitychange', onVis);

  return () => {
    gsap.ticker.remove(tick);
    document.removeEventListener('visibilitychange', onVis);
    st.kill();
    smoke.destroy();
  };
}, []);
```

### 7.5 Настройка характера дыма

Крутить только эти ручки:

| Хочу | Что менять |
|---|---|
| Клубы крупнее, реже | `scale` ↓ (1.45 → 0.95) |
| Испаряется быстрее | `evolve` ↑ (0.055 → 0.085). Выше 0.1 — «кипение», а не дым |
| Языки рванее, «сигаретнее» | `warp` ↑ (0.95 → 1.4) + сузить `lo/hi` до .44 / .80 |
| Гуще | `intensity` ↑, **потолок 0.16** — на референсе дымка едва различима |
| Больше углей | `heat` ↑, **потолок 0.5**. Выше — футер становится оранжевым, это провал |
| Сильнее тянет вверх | `rise` ↑ (0.024 → 0.04) |

Пресеты для проверки:
`костёр` = `{scale:1.1, evolve:.045, rise:.016, warp:.8, lo:.34, hi:.90, intensity:.13, heat:.42}`
`сигарета` = `{scale:1.9, evolve:.07, rise:.04, warp:1.35, lo:.44, hi:.82, intensity:.09, heat:.18}`

### 7.6 Фолбэк (нет WebGL / reduce-motion)

```css
.footer__fallback{
  position:absolute; inset:-25%;
  background:
    radial-gradient(38% 44% at 62% 38%, rgba(255,106,44,.10), transparent 70%),
    radial-gradient(30% 38% at 28% 62%, rgba(138,143,156,.10), transparent 72%),
    radial-gradient(46% 30% at 78% 74%, rgba(138,143,156,.07), transparent 75%);
  filter:blur(60px);
  animation:drift 44s var(--e-inout) infinite alternate;
}
@keyframes drift{
  0%   { transform:translate3d(-2%, 1%,0) scale(1.00) rotate(0deg); }
  50%  { transform:translate3d( 3%,-3%,0) scale(1.12) rotate(4deg); }
  100% { transform:translate3d(-1%,-1%,0) scale(1.04) rotate(-3deg); }
}
@media (prefers-reduced-motion: reduce){ .footer__fallback{ animation:none; } }
```

При `prefers-reduced-motion` шейдер рисует **один статичный кадр** и останавливается — фон не пустеет.

### 7.7 Зерно, маска, виньетка

```css
.footer__grain{
  position:absolute; inset:0; pointer-events:none; opacity:.035; mix-blend-mode:overlay;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
.footer__vignette{
  position:absolute; inset:0; pointer-events:none;
  background:radial-gradient(120% 90% at 50% 45%, transparent 40%, rgba(0,0,0,.55) 100%);
  -webkit-mask-image:linear-gradient(to bottom, rgba(0,0,0,.55) 0%, #000 22%, #000 78%, rgba(0,0,0,.7) 100%);
          mask-image:linear-gradient(to bottom, rgba(0,0,0,.55) 0%, #000 22%, #000 78%, rgba(0,0,0,.7) 100%);
}
```

Зерно не анимировать покадрово. Либо статика, либо сдвиг `background-position` шагами по 8fps.

---

## 8. Производительность фона

Пять fbm-вызовов на пиксель — дорого. Обязательные меры (уже в коде):

- **`dpr: 0.42`** — главная оптимизация. На 1440×934 считается 605×392 ≈ 237k пикселей. Апскейл
  браузером даёт бесплатное размытие, которое дыму только на пользу. Это не компромисс, а решение.
- **30 fps** (24 на тач) через аккумулятор в тикере.
- Пауза вне вьюпорта (ScrollTrigger) и в фоновой вкладке.
- `OCTAVES 4`. На такой низкой контрастности разница с 6 не видна.
- Тач-устройства: `dpr 0.32`, 24fps. Определять по `(pointer: coarse)`, **не по ширине**.
- Бюджет: **≤4ms GPU на кадр**. Проверить в Performance на среднем ноуте.

---

## 9. Блок A — eyebrow + часы

```tsx
<p className="eyebrow">{FOOTER.eyebrow}</p>
<p className="clock" aria-live="off">
  <span>{FOOTER.timezoneLabel}</span>
  <span aria-hidden="true"> → </span>
  <time>{time ?? '--:--'}</time>
</p>
```

- Точка в конце eyebrow — часть формы, оставить.
- `Intl.DateTimeFormat('en-GB', { timeZone, hour:'2-digit', minute:'2-digit', hour12:false })`.
- Обновление — **раз в 15 секунд**, не раз в секунду (секунды не показываются).
- Начальное значение — `null` → `--:--`, реальное время ставим в `useEffect`. Vite-сборка без SSR,
  но правило то же: не считать время во время рендера.
- `aria-live="off"` — диктор не должен зачитывать смену времени.
- Ширина фиксируется (§4.1), иначе строка дёргается.

---

## 10. Блок B — заголовок

```tsx
<h2 className="headline">
  {FOOTER.headline.map((line) => (
    <span className="headline__line" key={line}><span>{line}</span></span>
  ))}
</h2>
```

Двойная обёртка обязательна для reveal: внешний `span` — `block overflow-hidden`,
внутренний едет `y: 100% → 0`.

```css
.headline{
  font-family:var(--f-display); font-weight:700;
  font-size:var(--t-headline); line-height:var(--lh-headline);
  letter-spacing:var(--ls-headline);
  margin-left:-.045em;        /* оптическая компенсация левого сайдбера «R» */
  max-width:58%;
}
@media (max-width:760px){ .headline{ max-width:none; } }
```

Перенос строки — **ручной**, из массива. Никакого `text-wrap:balance` и переноса по ширине контейнера.

---

## 11. Блок C — CTA

```tsx
<a className="cta" href={FOOTER.cta.href}>
  <span className="cta__label">{FOOTER.cta.label}</span>
  <span className="cta__arrow" aria-hidden="true">→</span>
  <span className="cta__rule" />
</a>
```

```css
.cta{
  position:relative; display:flex; align-items:center; justify-content:space-between;
  width:225px; padding-bottom:12px;
  font-family:var(--f-body); font-size:var(--t-cta); letter-spacing:var(--ls-cta);
  text-transform:uppercase; color:var(--fg); text-decoration:none;
}
@media (max-width:760px){ .cta{ width:194px; } }

.cta__rule{ position:absolute; left:0; right:0; bottom:0; height:1px; background:var(--rule); }
.cta__rule::after{
  content:''; position:absolute; inset:0; background:var(--ember);
  transform:scaleX(0); transform-origin:right center;
  transition:transform var(--d-mid) var(--e-out);
}
.cta:hover .cta__rule::after,
.cta:focus-visible .cta__rule::after{ transform:scaleX(1); transform-origin:left center; }

.cta__arrow{ transition:transform var(--d-fast) var(--e-out), color var(--d-fast) linear; }
.cta:hover .cta__arrow{ transform:translateX(5px); color:var(--ember); }
```

Приём с `transform-origin`: при наведении ember-линия въезжает слева направо, при уходе — уезжает
вправо, а не отматывается назад. Именно это делает микровзаимодействие дорогим.

Опционально: при hover лейбл на 0.4s прогоняет скрэмбл по `ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789`,
по букве за 25мс слева направо. Выключать при `prefers-reduced-motion`.

---

## 12. Блок D — мета-строка

```tsx
<div className="meta">
  <div className="meta__col">
    <p className="legal">©Phoenix Wallet<sup>®</sup> 2026</p>
    <button className="sound" type="button" aria-pressed={soundOn}>
      {soundOn ? 'Sound off' : 'Sound on'} <span aria-hidden="true">♪</span> hover the lines.
    </button>
  </div>

  <div className="meta__col">
    <p className="label">Business enquiry</p>
    <p><span className="pfx">E.</span> <a href={`mailto:${FOOTER.email}`}>{FOOTER.email}</a></p>
    {FOOTER.phone && <p><span className="pfx">P.</span> <a href="tel:…">{FOOTER.phone}</a></p>}
  </div>

  <div className="meta__col meta__col--social">
    <p className="label">Social</p>
    <ul>…X, Discord…</ul>
    <ul>…Github, Telegram…</ul>
  </div>
</div>
```

- Лейблы пишем нормальным регистром, капс — через `text-transform:uppercase`. Так их правильно
  прочитает скринридер.
- `®` надстрочный: `font-size:.62em; vertical-align:.42em;`
- «SOUND ON…» — **настоящая кнопка-тумблер**, а не декоративная надпись. `aria-pressed`, текст
  переключается, ♪ гаснет до `--fg-dim` в выключенном состоянии.
- Hover ссылок: не `text-decoration`, а псевдоэлемент-линия снизу в `--ember`, та же механика
  origin-swap, `--d-fast`. Цвет текста не меняем — меняется только линия.
- Внешние ссылки: `target="_blank" rel="noopener noreferrer"`.
- Тач-таргет ≥44×44px: вертикальный padding + компенсирующий отрицательный margin, чтобы не поехала сетка.

---

## 13. Блок E — LINE WORDMARK ⭐

Главный элемент. «PHOENIX» нарисован не буквами, а **горизонтальными штрихами**: логотип
просканирован построчно, каждая строка — независимый набор отрезков.

Почему на референсе часть линий вылезает далеко за контур букв: **ряды масштабируются по X**. Рядом
с курсором `scaleX > 1`, отрезки выходят за границы глифов — эффект эквалайзера. Это и есть основа
взаимодействия, а заодно точка, где ember загорается второй раз: горячие ряды нагреваются к
`--ember-hot`, будто на угли подули.

### 13.1 Источник формы — сначала SVG

`brandMark` в конфиге стоит первым не случайно. У Phoenix наверняка есть готовый логотип — используй
его: буквы будут точно фирменные, а не «Cabinet Grotesk, набранный капсом». Требования к файлу:
контуры развёрнуты (никакого `<text>`), заливка чёрная, фон прозрачный, `viewBox` плотно по инку.

Если SVG нет — рисуем шрифтом, см. ниже.

### 13.2 Про пропорции: PHOENIX ≠ TRIONN

На референсе шесть узких букв, wordmark выходит ~320px высотой при 1440. У нас **семь букв в
Cabinet Grotesk Bold**, который заметно шире. При подгонке по ширине контента (1372px) кегль
получится ≈290px, а высота прописных — **≈205–215px**. Это нормально: wordmark будет ниже и
«длиннее» референсного. Что с этим делать:

1. `--wm-tracking: -0.04` (уже в токенах) — забирает ~4% ширины, кегль растёт.
2. `--wm-rows: 24` вместо 28 — при высоте ~210px даёт шаг ≈8.8px и штрих 2px, то есть плотность
   штриховки как на референсе. Формула на будущее: `rows ≈ round(height / 9)`, зажать в 18…34.
3. Если нужно больше присутствия — `WM_STRETCH_Y = 1.12` **в канвасе** (растянуть перед сканированием),
   не через CSS. Буквы всё равно превращаются в абстрактные штрихи, искажение незаметно. Не больше 1.15.
4. Лучший вариант — фирменный SVG-логотип с его собственными пропорциями.

### 13.3 Сканирование

`src/components/footer/wordmark/scanWordmark.ts`

```ts
const DPR = 2;
const WM_STRETCH_Y = 1.0;   // см. §13.2, поднимать до 1.12 при необходимости

function measureTracked(ctx: CanvasRenderingContext2D, text: string, trackPx: number) {
  let w = 0;
  for (const ch of [...text]) w += ctx.measureText(ch).width + trackPx;
  return w - trackPx;
}
function drawTracked(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, trackPx: number) {
  let cx = x;
  for (const ch of [...text]) { ctx.fillText(ch, cx, y); cx += ctx.measureText(ch).width + trackPx; }
}
// per-char отрисовка вместо ctx.letterSpacing — работает во всех браузерах

export type ScanResult = { rows: [number, number][][]; width: number; height: number };

export async function scanWordmark(opts: {
  text: string; svgUrl?: string | null;
  family?: string; weight?: number; tracking?: number;
  width: number; rows: number;
}): Promise<ScanResult> {
  const { text, svgUrl, family = 'Cabinet Grotesk', weight = 700,
          tracking = -0.04, width, rows } = opts;

  // 1. дождаться именно нашего начертания, а не просто fonts.ready
  await document.fonts.load(`${weight} 100px "${family}"`);
  await document.fonts.ready;

  let height: number;
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d', { willReadFrequently: true })!;

  if (svgUrl) {
    const img = new Image();
    img.src = svgUrl;
    await img.decode();
    height = Math.round(width * (img.naturalHeight / img.naturalWidth) * WM_STRETCH_Y);
    c.width = Math.ceil(width * DPR); c.height = Math.ceil(height * DPR);
    ctx.scale(DPR, DPR);
    ctx.drawImage(img, 0, 0, width, height);
  } else {
    const probe = document.createElement('canvas').getContext('2d')!;
    const BASE = 200;
    probe.font = `${weight} ${BASE}px "${family}"`;
    const baseW = measureTracked(probe, text, BASE * tracking);
    const fontSize = BASE * (width / baseW);

    probe.font = `${weight} ${fontSize}px "${family}"`;
    const m = probe.measureText(text);
    const ascent = m.actualBoundingBoxAscent;
    const descent = m.actualBoundingBoxDescent;   // для капса ≈ 0
    height = Math.ceil((ascent + descent) * WM_STRETCH_Y);

    c.width = Math.ceil(width * DPR); c.height = Math.ceil(height * DPR);
    ctx.scale(DPR, DPR);
    ctx.scale(1, WM_STRETCH_Y);
    ctx.fillStyle = '#fff';
    ctx.textBaseline = 'alphabetic';
    ctx.font = `${weight} ${fontSize}px "${family}"`;
    drawTracked(ctx, text, 0, ascent, fontSize * tracking);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  // 2. построчное сканирование
  const img = ctx.getImageData(0, 0, c.width, c.height).data;
  const pitch = c.height / rows;
  const out: [number, number][][] = [];

  for (let r = 0; r < rows; r++) {
    const y = Math.min(c.height - 1, Math.floor((r + 0.5) * pitch));
    const off = y * c.width * 4;
    const segs: [number, number][] = [];
    let start = -1;

    for (let x = 0; x < c.width; x++) {
      const on = img[off + x * 4 + 3] > 128;
      if (on && start === -1) start = x;
      else if (!on && start !== -1) { segs.push([start / DPR, x / DPR]); start = -1; }
    }
    if (start !== -1) segs.push([start / DPR, c.width / DPR]);

    // отрезки тоньше 1.5px — мусор от антиалиасинга на диагоналях X и N
    out.push(segs.filter(([a, b]) => b - a >= 1.5));
  }

  return { rows: out, width, height };
}
```

### 13.4 Рендер

```tsx
const pitch  = data.height / data.rows.length;
const stroke = Math.max(1, Math.min(3, pitch * 0.22));

<div className="wm" style={{ height: data.height }} aria-hidden="true">
  {data.rows.map((segs, i) => (
    <div className="wm__row" key={i} ref={setRowRef(i)}
         style={{ top: i * pitch, height: stroke }}>
      {segs.map(([x0, x1], j) => (
        <i key={j} style={{ left: x0, width: x1 - x0 }} />
      ))}
    </div>
  ))}
</div>
<p className="sr-only">Phoenix Wallet</p>
```

```css
.wm{ position:relative; width:100%; }
.wm__row{
  position:absolute; left:0; right:0;
  transform:scaleX(var(--sx,1));
  transform-origin:50% 50%;
  will-change:transform;
}
.wm__row > i{
  position:absolute; top:0; bottom:0; display:block;
  background:color-mix(in oklab, var(--wm-line) calc(100% - var(--heat,0)*100%), var(--ember-hot));
  opacity:var(--o,1);
}
@media (prefers-reduced-motion: reduce){
  .wm__row{ transform:none !important; }
  .wm__row > i{ background:var(--wm-line); }
}
```

Ориентиры: 1440px → высота ≈210px, шаг ≈8.8px, штрих 2px. 390px → высота ≈57px, шаг ≈2.4px, штрих 1px.
Число рядов (24) **одинаково** на всех брейкпоинтах, меняется только шаг.

### 13.5 Reveal

При входе секции в вьюпорт: ряды из `scaleX(0.08)` + `opacity 0` → `scaleX(1)` + `opacity 1`,
GSAP `stagger: 0.018` сверху вниз, `duration: 1.1`, `ease: 'expo.out'`, играть один раз
(`ScrollTrigger` с `once: true`). Ощущение — изображение прорисовывается строчной развёрткой.

### 13.6 Hover-волна

Ядро взаимодействия. Один общий объект состояния + один `quickTo` — не 24 твина на каждое движение мыши.

`src/components/footer/wordmark/useWordmarkWave.ts`

```ts
const MAX_STRETCH = 0.42;   // до scaleX(1.42)
const FALLOFF     = 4.5;    // сколько рядов захватывает волна

const wave = { row: -99, power: 0 };
const toRow = gsap.quickTo(wave, 'row', { duration: 0.35, ease: 'power3' });

const onMove = (e: PointerEvent) => {
  const r = el.getBoundingClientRect();
  toRow(((e.clientY - r.top) / r.height) * rowCount);
  gsap.to(wave, { power: 1, duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
};
const onLeave = () => gsap.to(wave, { power: 0, duration: 0.6, ease: 'power3.out', overwrite: 'auto' });

// один проход по рядам за кадр, внутри общего gsap.ticker
const tick = () => {
  if (wave.power < 0.001 && settled) return;
  for (let i = 0; i < rowCount; i++) {
    const d = Math.abs(i + 0.5 - wave.row) / FALLOFF;
    const k = Math.max(0, 1 - d * d) * wave.power;      // гладкое затухание
    const s = rowEls[i].style;
    s.setProperty('--sx',   String(1 + k * MAX_STRETCH));
    s.setProperty('--o',    String(0.55 + k * 0.45));
    s.setProperty('--heat', String(k * 0.85));           // ← ember загорается здесь
  }
  settled = wave.power < 0.001;
};
```

- Слушатели на самом блоке, `{ passive: true }`.
- Только `matchMedia('(pointer: fine)')`. На тач-устройствах взаимодействия нет вообще.
- В анимации — **только `transform` и CSS-переменные**. Никаких `width`, `left`, `filter`,
  `box-shadow`: на 24 рядах это мгновенный layout thrash.
- `--heat` управляет `color-mix` из §13.4. Максимум 0.85, чтобы даже пик волны не стал чисто оранжевым.

### 13.7 Упрощённый вариант (запасной путь)

CSS-маска полосами: в покое выглядит так же, но ряды нельзя двигать по отдельности — значит,
не будет ни волны, ни звука.

```css
.wm--simple{
  background:var(--wm-line);
  -webkit-mask-image:url('/brand/phoenix-wordmark.svg'),
    repeating-linear-gradient(to bottom, #000 0 2px, transparent 2px 8.8px);
          mask-image:url('/brand/phoenix-wordmark.svg'),
    repeating-linear-gradient(to bottom, #000 0 2px, transparent 2px 8.8px);
  -webkit-mask-composite:source-in; mask-composite:intersect;
  -webkit-mask-size:100% 100%; mask-size:100% 100%;
}
```

Брать только если сканлайны совсем не пошли. Основной путь — §13.3.

### 13.8 Доступность

Контейнер `aria-hidden="true"`, рядом визуально скрытый `<p className="sr-only">Phoenix Wallet</p>`.
Диктор не должен зачитывать 24 пустых div-а.

---

## 14. Звук

Web Audio, ноль ассетов — тон генерируется на лету.

- `AudioContext` создаётся **лениво, по клику на тумблер**. По hover браузер его не запустит,
  поэтому до первого клика кнопка честно показывает «Sound on» (то есть «включить»).
- При пересечении курсором нового ряда — короткая нота: `sine`, ADSR `attack 8ms / decay 180ms`,
  пиковый gain **0.04**. Тихо.
- Маппинг: `freq = 220 * 2 ** (scale[i % 5] / 12 + Math.floor(i / 5))`, `scale = [0, 3, 5, 7, 10]`
  (минорная пентатоника). Верхние ряды — выше по тону.
- Лимитер: не больше **6 нот одновременно**, самую старую глушить.
- Мастер-gain за тумблером, дефолт — **выключено**. Автозапуск звука недопустим.
- `audioCtx.close()` при размонтировании.

---

## 15. Тайминги

| Что | Длительность | Stagger | Ease |
|---|---|---|---|
| Reveal заголовка (строки) | 0.9s | 0.09 | `expo.out` |
| Reveal мета-блоков | 0.6s | 0.06 | `expo.out` |
| Reveal wordmark | 1.1s | 0.018 | `expo.out` |
| Линия CTA (in / out) | 0.55s / 0.35s | — | `--e-out` |
| Стрелка CTA | 0.28s | — | `--e-out` |
| Подчёркивание ссылок | 0.28s | — | `--e-out` |
| Волна wordmark (следование) | 0.35s | — | `power3` |
| Волна wordmark (возврат) | 0.6s | — | `power3.out` |

Все reveal — один `gsap.timeline()` с `ScrollTrigger` (`start: 'top 75%'`, `once: true`).
Обязательно обернуть в `gsap.context()` и вызывать `ctx.revert()` в cleanup — иначе React 18
StrictMode в dev смонтирует компонент дважды и ты получишь два набора твинов.

---

## 16. Респонсив

| Брейкпоинт | Что меняется |
|---|---|
| ≥1440 | эталон, числа из §5 |
| 1024–1439 | всё по vw, `--gutter` сжимается по clamp |
| 760–1023 | правый кластер уходит под заголовок в две колонки, CTA остаётся справа |
| <760 | линейная колонка §6, часы и строка звука скрыты, wordmark full-bleed и обрезан снизу |
| <360 | `--t-headline` фиксируется на 26px, соцсети в одну колонку |

Только `100svh`, не `100vh` — иначе адресная строка Safari будет дёргать высоту при скролле.

---

## 17. Доступность

- `--fg-dim` на `--bg` даёт ≈4.1:1 — годится для декоративных префиксов `E.` / `P.`, но не для
  единственного носителя смысла. Email рисуем `--fg`.
- Ember `#FF5A1F` на `#050506` — ≈6.4:1, для линий и hover-состояний достаточно. Но **не набирать
  им текст мельче 14px** как единственный цвет.
- `:focus-visible` — `outline: 1px solid var(--ember); outline-offset: 4px`. Никаких `outline:none`.
- Порядок табуляции = визуальный: eyebrow → CTA → email → 4 соцсети → тумблер звука.
- `prefers-reduced-motion: reduce` глушит: reveal (элементы сразу видимы), волну wordmark'а,
  анимацию фона (один статичный кадр), скрэмбл. Hover-подчёркивания можно оставить.
- Тумблер звука достижим с клавиатуры, состояние через `aria-pressed`.
- Wordmark скрыт от скринридера, текстовый дубль рядом.

---

## 18. Бюджет производительности

| Метрика | Потолок |
|---|---|
| GPU на кадр (фон) | 4ms |
| JS на кадр (волна) | 2ms |
| CLS от футера | 0 |
| Доп. вес без шрифтов | < 14 КБ gzip |
| DOM-узлов в wordmark | ≤ 350 (24 ряда × ~14 отрезков) |

- Пересчёт сканлайнов — только при изменении **ширины** (`entry.contentRect.width`), debounce 150ms.
  Изменение высоты на мобиле = адресная строка, пересчёт не нужен.
- Ничего не считать до `document.fonts.load(...)` — иначе просканируешь fallback-шрифт.
- Монтировать фон и wordmark по ScrollTrigger с `start: 'top bottom+=300'`.
- Один `gsap.ticker` на всё: Lenis, дым, волна. Своих `requestAnimationFrame` быть не должно.

---

## 19. Структура файлов

```
src/
  components/footer/
    Footer.tsx
    footer.config.ts          # ← §1
    footer.css                # сетка, текстовые блоки, wordmark
    SmokeBackground.tsx
    smoke/
      createSmoke.ts
      smoke.vert.glsl
      smoke.frag.glsl
    LineWordmark.tsx
    wordmark/
      scanWordmark.ts
      useWordmarkWave.ts
    useLocalClock.ts
    useHoverTone.ts
  lib/
    scroll.ts                 # Lenis + gsap.ticker + ScrollTrigger
  styles/globals.css          # @font-face, токены, @theme
public/
  fonts/CabinetGrotesk-Bold.woff2
  fonts/Switzer-Regular.woff2
  brand/phoenix-wordmark.svg
```

Для `?raw`-импорта GLSL добавь в `src/vite-env.d.ts`:
```ts
declare module '*.glsl?raw' { const src: string; export default src; }
```

---

## 20. Acceptance checklist

Пройти по пунктам, приложить скриншоты 1440×934 и 390×844 рядом с референсами.

**Композиция**
- [ ] Футер занимает ровно один экран, wordmark прижат к низу, зазор 30px (desktop)
- [ ] CTA начинается на 67.8% ширины; соцсети — на 84.6% и 92%
- [ ] Нижняя линия CTA на уровне базовой линии второй строки заголовка
- [ ] Заголовок не шире 7 колонок, перенос ручной
- [ ] Mobile: копирайт **под** соцсетями, wordmark в край и обрезан снизу

**Фон**
- [ ] Дым **перерождается на месте**, а не едет по экрану — смотреть 30 секунд подряд
- [ ] Нет видимой петли и повторяющегося паттерна
- [ ] Нет полос (banding) — проверять на OLED при максимальной яркости
- [ ] Дымка едва различима; если бросается в глаза — `intensity` завышен
- [ ] Ember виден только в редких плотных ядрах, футер не «оранжевеет»
- [ ] Углы кадра остаются почти чёрными
- [ ] Вкладка в фоне / секция вне экрана → тикер остановлен (проверить в Performance)

**Wordmark**
- [ ] Слово ровно вписано по ширине контента, без обрезки по бокам (desktop)
- [ ] Буквы читаются, штрихи не сливаются в заливку; диагонали X и N чистые, без мусорных точек
- [ ] При наведении ряды у курсора растягиваются за пределы букв, светлеют и **теплеют** к ember
- [ ] Уход курсора → плавный возврат за 0.6s без рывка
- [ ] Ресайз окна пересобирает сканлайны без миганий
- [ ] Скринридер читает «Phoenix Wallet» один раз, а не 24 пустышки

**Взаимодействия и рантайм**
- [ ] Часы показывают Europe/Warsaw, цифры не дёргают строку
- [ ] Линия под CTA приходит слева, уходит вправо
- [ ] Звук выключен по умолчанию, тумблер работает с клавиатуры, громкость деликатная
- [ ] `prefers-reduced-motion` глушит reveal, волну и анимацию фона
- [ ] StrictMode в dev не удваивает твины и не плодит второй WebGL-контекст
- [ ] В консоли ноль варнингов про потерянный контекст при hot reload

---

## 21. Чего не делать

- Не заводить свой `requestAnimationFrame`. Всё — через `gsap.ticker`, туда же Lenis.
- Не анимировать `width`, `left`, `filter`, `box-shadow` в волне. Только `transform` и CSS-переменные.
- Не считать шейдер в полном DPR. `dpr ≤ 0.5` — осознанное решение, а не экономия.
- Не поднимать `heat` выше 0.5 и `intensity` выше 0.16.
- Не добавлять летящие частицы-искры «раз уж бренд Phoenix». Дым с углями + ember-волна на
  wordmark'е — это уже вся смелость, которую держит эта композиция. Третий огненный эффект её сломает.
- Не подменять сканлайны фоновой картинкой в полоску — уйдёт вся интерактивность.
- Не добавлять того, чего нет на референсе: иконки соцсетей, рамки, карточки, скругления,
  «Back to top», формы подписки.
- Не менять `100svh` на `100vh` и не фиксировать высоту в px.
- Не набирать текст чистым `#FFFFFF` — только `--fg` (#F2F0EE).

---

## 22. Стартовый промт

> Прочитай `FOOTER-SPEC.md` целиком. Проверь, что в проекте есть `/public/fonts/CabinetGrotesk-Bold.woff2`,
> `/public/fonts/Switzer-Regular.woff2` и SVG-логотип; чего нет — спроси, не выдумывай.
> Собирай строго по порядку: токены (§3–4) → фон (§7–8) → сетка (§5–6) → текстовые блоки (§9–12) →
> wordmark (§13) → звук (§14) → анимации (§15).
> После §7 и после §13 остановись и покажи скриншот 1440×934 для сверки с референсом.
> В конце пройди §20 по пунктам и отчитайся по каждому.
