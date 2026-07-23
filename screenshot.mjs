// Dev-only screenshot helper (not shipped; removed before final).
// Usage: node screenshot.mjs <url> <out.png> <w> <h> <waitMs> [reduce] [full]
import { chromium } from 'playwright'

const url = process.argv[2] || 'http://localhost:5175'
const out = process.argv[3] || 'shot.png'
const w = parseInt(process.argv[4] || '1280', 10)
const h = parseInt(process.argv[5] || '800', 10)
const wait = parseInt(process.argv[6] || '2600', 10)
const reduce = process.argv[7] === 'reduce'
const full = process.argv[8] === 'full'

const browser = await chromium.launch()
const ctx = await browser.newContext({
  viewport: { width: w, height: h },
  deviceScaleFactor: 1,
  reducedMotion: reduce ? 'reduce' : 'no-preference',
})
const page = await ctx.newPage()
const errs = []
page.on('console', (m) => m.type() === 'error' && errs.push(m.text()))
page.on('pageerror', (e) => errs.push('pageerror: ' + e.message))
await page.goto(url, { waitUntil: 'networkidle' })
await page.waitForTimeout(wait)
const clickName = process.argv[9]
if (clickName) {
  await page.getByRole('button', { name: new RegExp(clickName, 'i') }).first().click()
  await page.waitForTimeout(500)
}
if (process.argv[10] === 'bottom') {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(700)
}
await page.screenshot({ path: out, fullPage: full })
console.log(`shot ${out} ${w}x${h}${reduce ? ' reduce' : ''}${full ? ' full' : ''} | errors: ${errs.length ? '\n  ' + errs.join('\n  ') : 'none'}`)
await browser.close()
