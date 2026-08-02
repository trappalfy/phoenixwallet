// Chrome Web Store screenshots (1280×800, the store's required size). The
// product itself is a 360×600 popup, so each shot is the real popup rendered
// at native size and composited, centered, onto an --ink canvas — an honest
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
const INK = { r: 10, g: 5, b: 6, alpha: 1 }

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

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 360, height: 600 }, deviceScaleFactor: 2 })
const page = await ctx.newPage()
await page.goto(url, { waitUntil: 'networkidle' })
await page.waitForTimeout(800)

// 1 — Welcome
await frame(await page.screenshot(), '1-welcome.png')

// Reach the funded wallet (see scripts/review.mjs's reachHome for why the
// restore path, not creation, is what has anything to show).
await page.getByRole('button', { name: 'I already have a wallet' }).click()
await page.waitForTimeout(320)
await page.getByRole('button', { name: 'Fill the sample phrase' }).click()
await page.waitForTimeout(260)
await page.getByRole('button', { name: 'Import', exact: true }).click()
await page.waitForTimeout(320)
await page.getByLabel('Password', { exact: true }).fill('phoenix1')
await page.getByLabel('Confirm password').fill('phoenix1')
await page.getByRole('checkbox').check()
await page.waitForTimeout(200)
await page.getByRole('button', { name: 'Continue' }).click()
await page.waitForTimeout(360)
await page.getByRole('button', { name: 'Open wallet' }).click()
await page.waitForTimeout(500)

// 2 — Home
await frame(await page.screenshot(), '2-home.png')

// 3 — Buy
await page.getByRole('button', { name: 'Buy', exact: true }).click()
await page.waitForTimeout(400)
await page.getByRole('button', { name: '$250' }).click()
await page.waitForTimeout(300)
await frame(await page.screenshot(), '3-buy.png')
await page.getByRole('button', { name: 'Back' }).click()
await page.waitForTimeout(300)

// 4 — Swap
await page.getByRole('button', { name: 'Swap', exact: true }).last().click()
await page.waitForTimeout(320)
await page.getByLabel('Amount').fill('0.5')
await page.waitForTimeout(300)
await frame(await page.screenshot(), '4-swap.png')

// 5 — Settings
await page.getByRole('button', { name: 'Settings', exact: true }).click()
await page.waitForTimeout(320)
await frame(await page.screenshot(), '5-settings.png')

await browser.close()
console.log(`\n${OUT}`)
