// Chrome Web Store screenshots (1280×800, the store's required size). The
// product itself is a 360×600 popup, so each shot is the real popup rendered
// at native size and composited, centered, onto a --bg-base canvas — an honest
// picture of the actual UI rather than a mocked-up browser chrome.
//
//   npm run build && npx vite preview --port 4180 &
//   node scripts/store-screenshots.mjs http://localhost:4180
import { chromium } from 'playwright'
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const url = process.argv[2] || 'http://localhost:4180'
const OUT = fileURLToPath(new URL('../store/screenshots/', import.meta.url))
mkdirSync(OUT, { recursive: true })

const CANVAS = { width: 1280, height: 800 }
/** --ink from src/styles/index.css. Keep in step with it. */
const INK = { r: 10, g: 8, b: 24, alpha: 1 }

async function frame(buffer, file) {
  // Native popup pixels (360×600 at deviceScaleFactor 2 = 720×1200) scaled to
  // fit the canvas with room to breathe, then centered.
  const targetH = Math.round(CANVAS.height * 0.92)
  const resized = await sharp(buffer).resize({ height: targetH }).toBuffer()
  const meta = await sharp(resized).metadata()
  await sharp({ create: { ...CANVAS, channels: 4, background: INK } })
    .composite([{ input: resized, left: Math.round((CANVAS.width - meta.width) / 2), top: Math.round((CANVAS.height - targetH) / 2) }])
    .png()
    .toFile(`${OUT}${file}`)
  console.log('wrote', file)
}

// System Chrome: Playwright's own browsers are not installed in this repo, and
// downloading ~150MB to take five screenshots is not worth it.
const browser = await chromium.launch({ channel: 'chrome' })
const ctx = await browser.newContext({ viewport: { width: 360, height: 600 }, deviceScaleFactor: 2 })
const page = await ctx.newPage()
await page.goto(url, { waitUntil: 'networkidle' })
await page.waitForTimeout(800)

// 1 — Welcome
await frame(await page.screenshot(), '1-welcome.png')

/**
 * Create a wallet. There is no import path any more, and creation is the only
 * way in — which is the point: the shots have to show the empty wallet a real
 * installer gets, not a funded one the product never hands out.
 */
await page.getByRole('button', { name: 'Create a new wallet' }).click()
await page.waitForTimeout(360)
await page.getByLabel('Password', { exact: true }).fill('perigee1')
await page.getByLabel('Confirm password').fill('perigee1')
await page.getByRole('checkbox').check()
await page.waitForTimeout(200)
await page.getByRole('button', { name: 'Continue' }).click()
await page.waitForTimeout(400)

// 2 — the recovery phrase, revealed
await page.getByRole('button', { name: /Reveal phrase/ }).click()
await page.waitForTimeout(320)
await frame(await page.screenshot(), '2-recovery-phrase.png')

await page.getByRole('button', { name: 'I wrote it down' }).click()
await page.waitForTimeout(450)

// Confirm step: place the three blanked words. Wrong picks only shake, so
// walking every chip until Confirm enables is safe and needs no phrase scraping.
// `.font-mono` keeps this off BackBar's back arrow, which is also a pill button.
const confirm = page.getByRole('button', { name: 'Confirm', exact: true })
for (let pass = 0; pass < 8 && !(await confirm.isEnabled()); pass++) {
  for (const chip of await page.locator('button.rounded-pill.font-mono:not([disabled])').all()) {
    if (await confirm.isEnabled()) break
    await chip.click().catch(() => {})
    await page.waitForTimeout(60)
  }
}
await confirm.click()
await page.waitForTimeout(450)
await page.getByRole('button', { name: 'Open wallet' }).click()
await page.waitForTimeout(600)

// 3 — Home, as an installed user actually finds it: empty
await frame(await page.screenshot(), '3-home.png')

// 4 — Receive
await page.getByRole('button', { name: 'Receive', exact: true }).click()
await page.waitForTimeout(500)
await frame(await page.screenshot(), '4-receive.png')
await page.getByRole('button', { name: 'Back' }).click()
await page.waitForTimeout(360)

// 5 — Settings
await page.getByRole('button', { name: 'Settings', exact: true }).click()
await page.waitForTimeout(360)
await frame(await page.screenshot(), '5-settings.png')

await browser.close()
console.log(`\n${OUT}`)
