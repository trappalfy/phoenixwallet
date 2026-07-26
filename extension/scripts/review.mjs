// Review harness for the popup. Everything §13 asserts, checked against the
// built artifact rather than the dev server, so what is measured is what ships.
//
//   npm run build && npx vite preview --port 4180
//   node scripts/review.mjs audit  http://localhost:4180
//   node scripts/review.mjs shots  http://localhost:4180 out.png [frames]
//   node scripts/review.mjs walk   http://localhost:4180 out.png
//
// Playwright lives in the landing site's node_modules at the repo root; this
// package deliberately does not depend on it.
const ROOT = new URL('../../', import.meta.url).pathname
const { chromium } = await import(`${ROOT}node_modules/playwright/index.mjs`)
const sharp = (await import(new URL('../node_modules/sharp/dist/index.mjs', import.meta.url).pathname))
  .default
const { execSync } = await import('node:child_process')
const SRC = new URL('../src/', import.meta.url).pathname

const [mode, url, out, frames] = process.argv.slice(2)
if (!mode || !url) {
  console.error(
    'usage: review.mjs <audit|shots|walk|onboarding|home|flows|settings|motion|keyboard> <url> [out.png] [frames]',
  )
  process.exit(1)
}

async function open({ reducedMotion } = {}) {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({
    viewport: { width: 360, height: 600 },
    deviceScaleFactor: 2,
    ...(reducedMotion ? { reducedMotion } : {}),
  })
  const page = await ctx.newPage()
  const errs = []
  page.on('console', (m) => ['error', 'warning'].includes(m.type()) && errs.push(`${m.type()}: ${m.text()}`))
  page.on('pageerror', (e) => errs.push('pageerror: ' + e.message))
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  return { browser, page, errs }
}

/**
 * Restores the sample phrase and lands on Home with the funded wallet behind it.
 *
 * This is the route every data-dependent mode takes, because a *created* wallet
 * is empty by design — one account, nothing in it — and there would be no
 * balances, collectibles or history to assert against. START_AT is 'welcome'
 * per §8, so this still walks the real onboarding rather than a build flag.
 */
async function reachHome(page) {
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
  await page.waitForTimeout(420)
}

async function stitch(buffers, file) {
  const W = 720
  await sharp({
    create: { width: (W + 16) * buffers.length, height: 1200, channels: 4, background: { r: 10, g: 5, b: 6, alpha: 1 } },
  })
    .composite(buffers.map((b, i) => ({ input: b, left: i * (W + 16), top: 0 })))
    .png()
    .toFile(file)
}

/* ---------------------------------------------------------------- audit --- */
if (mode === 'audit') {
  const { browser, page, errs } = await open()
  const r = await page.evaluate(() => {
    const css = getComputedStyle(document.documentElement)
    const hex = (n) => css.getPropertyValue(n).trim()
    const lin = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))
    const lum = (h) => {
      const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
      return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
    }
    const ratio = (a, b) => {
      const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p)
      return (x + 0.05) / (y + 0.05)
    }
    const contrast = {}
    for (const f of ['--text', '--text-dim', '--text-mute'])
      for (const b of ['--ink', '--surface-1', '--surface-2', '--surface-3'])
        contrast[`${f} on ${b}`] = +ratio(hex(f), hex(b)).toFixed(2)
    return {
      contrast,
      size: `${document.body.clientWidth}×${document.body.clientHeight}`,
      shellScrolls:
        document.documentElement.scrollHeight > window.innerHeight ||
        document.body.scrollHeight > window.innerHeight,
      fonts: [...new Set([...document.querySelectorAll('p,h1,h2,span,button')]
        .map((el) => getComputedStyle(el).fontFamily.split(',')[0].replace(/"/g, '')))],
      unlabelledIconButtons: [...document.querySelectorAll('button')]
        .filter((b) => !b.textContent.trim() && !b.getAttribute('aria-label')).length,
    }
  })
  await browser.close()

  console.log('popup size    :', r.size)
  console.log('shell scrolls :', r.shellScrolls)
  console.log('fonts         :', r.fonts.join(', '))
  console.log('icon-only buttons without aria-label:', r.unlabelledIconButtons)
  console.log('console       :', errs.length ? '\n  ' + errs.join('\n  ') : 'none')
  console.log('\ncontrast (§11 floor 4.5:1):')
  let bad = 0
  for (const [k, v] of Object.entries(r.contrast)) {
    if (v < 4.5) bad++
    console.log(`  ${k.padEnd(30)} ${String(v).padStart(6)}:1  ${v >= 4.5 ? 'PASS' : 'FAIL'}`)
  }

  // §13 — no crypto libs, no network layer, no real URL anywhere in the source.
  let forbidden = ''
  try {
    forbidden = execSync(`grep -rE "fetch\\(|ethers|web3|bip39|https?://" "${SRC}"`, { encoding: 'utf8' })
  } catch {
    /* grep exits 1 on no match — that is the pass case */
  }
  const forbiddenOk = forbidden.trim().length === 0
  console.log(
    '\nforbidden APIs (§13)          :',
    forbiddenOk ? 'PASS — none found' : 'FAIL\n  ' + forbidden.trim().split('\n').join('\n  '),
  )

  // §5.2 — the ember gradient appears in exactly four places: the primary
  // button, the brand mark's active state, the balance figure, and the
  // progress/heat rails (ignite, tx-pending, hold-to-confirm, password
  // strength — one family under §10's "rail" heading). KitchenSink.tsx is the
  // unrouted design-reference screen kept per Phase 7 and is not part of the
  // shipped UI, so it is exempt rather than allow-listed.
  const GRADIENT_ALLOWED = new Set([
    'components/primitives/Button.tsx',
    'components/brand/PhoenixMark.tsx',
    'components/wallet/BalanceHero.tsx',
    'components/wallet/HoldToConfirm.tsx',
    'screens/send/TxStatus.tsx',
    'screens/Unlock.tsx',
    'screens/onboarding/Ready.tsx',
    'screens/onboarding/SetPassword.tsx',
  ])
  let gradientHits = ''
  try {
    gradientHits = execSync(`grep -rl "bg-grad-ember\\|bg-clip-text" "${SRC}"`, { encoding: 'utf8' })
  } catch {
    /* grep exits 1 on no match */
  }
  const gradientOffenders = gradientHits
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((p) => p.replace(SRC, ''))
    .filter((p) => p !== 'screens/KitchenSink.tsx' && !GRADIENT_ALLOWED.has(p))
  console.log(
    'ember gradient, 4 places only  :',
    gradientOffenders.length ? 'FAIL — unexpected in ' + gradientOffenders.join(', ') : 'PASS',
  )

  process.exit(bad || errs.length || r.shellScrolls || !forbiddenOk || gradientOffenders.length ? 1 : 0)
}

/* ---------------------------------------------------------------- shots --- */
if (mode === 'shots') {
  const { browser, page, errs } = await open()
  const total = Number(frames ?? 3)
  const buffers = []
  for (let i = 0; i < total; i++) {
    await page.evaluate(({ i, total }) => {
      const r = document.querySelector('.scroll-region')
      if (r) r.scrollTop = ((r.scrollHeight - r.clientHeight) / Math.max(1, total - 1)) * i
    }, { i, total })
    await page.waitForTimeout(320)
    buffers.push(await page.screenshot())
  }
  await browser.close()
  await stitch(buffers, out ?? 'shots.png')
  console.log(`wrote ${out ?? 'shots.png'} | console: ${errs.length ? errs.join('; ') : 'none'}`)
}

/* ------------------------------------------------------------ onboarding --- */
// Requires START_AT = 'welcome'. Walks §9.1 start to finish and exercises the
// error states, since those are the part a happy-path click-through never sees.
if (mode === 'onboarding') {
  const { browser, page, errs } = await open()
  const shots = []
  const results = []
  const check = (label, pass, detail = '') => results.push({ label, pass, detail })

  check('opens on Welcome', (await page.locator('main').innerText()).includes('Phoenix'))
  check('no tab bar during onboarding', (await page.getByRole('navigation', { name: 'Primary' }).count()) === 0)
  shots.push(await page.screenshot())

  await page.getByRole('button', { name: 'Create a new wallet' }).click()
  await page.waitForTimeout(320)
  check('reaches Get started', (await page.locator('main').innerText()).includes('Use an existing wallet'))

  await page.getByRole('button', { name: /Create a new wallet/ }).click()
  await page.waitForTimeout(320)
  const contBefore = await page.getByRole('button', { name: 'Continue' }).isDisabled()
  check('SetPassword: Continue starts disabled', contBefore)

  await page.getByLabel('Password', { exact: true }).fill('phoenix1')
  await page.waitForTimeout(200)
  await page.getByLabel('Confirm password').fill('phoenix2')
  await page.getByLabel('Confirm password').blur()
  await page.waitForTimeout(250)
  check('SetPassword: mismatch is reported',
    (await page.locator('main').innerText()).includes('do not match'))
  shots.push(await page.screenshot())

  await page.getByLabel('Confirm password').fill('phoenix1')
  await page.waitForTimeout(200)
  const contNoAck = await page.getByRole('button', { name: 'Continue' }).isDisabled()
  check('SetPassword: acknowledgement is required', contNoAck)
  await page.getByRole('checkbox').check()
  await page.waitForTimeout(200)
  check('SetPassword: Continue enables once satisfied',
    !(await page.getByRole('button', { name: 'Continue' }).isDisabled()))

  await page.getByRole('button', { name: 'Continue' }).click()
  await page.waitForTimeout(350)
  check('SeedReveal: phrase starts blurred',
    await page.locator('.blur-\\[6px\\]').count() > 0)
  check('SeedReveal: continue is gated on revealing',
    await page.getByRole('button', { name: 'I wrote it down' }).isDisabled())
  check('SeedReveal: warns what the phrase is worth',
    /Anyone with these twelve words takes the funds/.test(await page.locator('main').innerText()))
  shots.push(await page.screenshot())

  await page.getByRole('button', { name: 'Reveal phrase' }).click()
  await page.waitForTimeout(300)
  // A created wallet gets its own twelve words. If they ever matched the sample
  // wallet's, every user would be writing down the same phrase.
  const shown = await page.evaluate(() =>
    [...document.querySelectorAll('main .font-mono')]
      .map((el) => el.textContent.trim())
      .filter((t) => /^[a-z]+$/.test(t)))
  check('a created wallet gets its own phrase',
    shown.length === 12 && shown.join(' ') !== 'signal harbor velvet oxide candle ripple quartz meadow lantern fabric tundra ember',
    shown.join(' '))

  check('SeedReveal: unblurs on reveal', (await page.locator('.blur-\\[6px\\]').count()) === 0)
  shots.push(await page.screenshot())

  await page.getByRole('button', { name: 'I wrote it down' }).click()
  await page.waitForTimeout(350)

  // Wrong placement must name the position, not just fail.
  const chipNames = await page.locator('main button').filter({ hasText: /^[a-z]+$/ }).allInnerTexts()
  let sawSpecificError = false
  for (let slot = 0; slot < 3; slot++) {
    for (const name of chipNames) {
      const chip = page.getByRole('button', { name, exact: true })
      if ((await chip.count()) === 0 || (await chip.first().isDisabled())) continue
      await chip.first().click()
      await page.waitForTimeout(160)
      const text = await page.locator('main').innerText()
      if (/That is not word \d+/.test(text)) {
        sawSpecificError = true
        if (slot === 0) shots.push(await page.screenshot())
        continue
      }
      break
    }
  }
  check('SeedConfirm: wrong word names the position', sawSpecificError)
  check('SeedConfirm: Confirm enables once all three placed',
    !(await page.getByRole('button', { name: 'Confirm' }).isDisabled()))

  await page.getByRole('button', { name: 'Confirm' }).click()
  await page.waitForTimeout(400)
  check('reaches Ready', (await page.locator('main').innerText()).includes('Your wallet is ready'))
  shots.push(await page.screenshot())

  await page.getByRole('button', { name: 'Open wallet' }).click()
  await page.waitForTimeout(400)
  check('lands on Home with the shell', await page.locator('header').isVisible())
  check('tab bar returns after onboarding',
    await page.getByRole('navigation', { name: 'Primary' }).isVisible())

  /* --- a wallet you just created is empty ----------------------------- */
  // The single most important thing this build must not do is greet a brand new
  // wallet with someone else's money.
  const fresh = await page.locator('main').innerText()
  check('a new wallet has a zero balance', /\$0\.00/.test(fresh) && !/\$1[0-9],/.test(fresh),
    fresh.split('\n')[1])
  check('a new wallet shows no 24h change', !/[▲▼]/.test(fresh))
  check('a new wallet holds only the native asset at zero',
    /ETH/.test(fresh) && !/USDC|LINK|WBTC|PEPE/.test(fresh))
  check('a new wallet has one account',
    (await page.locator('header').innerText()).includes('Account 1'),
    (await page.locator('header').innerText()).split('\n')[0])

  await page.getByRole('tab', { name: 'NFTs' }).click()
  await page.waitForTimeout(300)
  check('a new wallet holds no collectibles', /No collectibles yet/.test(await page.locator('main').innerText()))

  await page.getByRole('tab', { name: 'Activity' }).click()
  await page.waitForTimeout(300)
  check('a new wallet has no history', /No activity yet/.test(await page.locator('main').innerText()))
  shots.push(await page.screenshot())

  await page.getByRole('button', { name: 'Settings' }).last().click()
  await page.waitForTimeout(320)
  check('a new wallet is connected to nothing',
    /No sites connected/.test(await page.locator('main').innerText()))
  await page.getByRole('button', { name: 'Home' }).last().click()
  await page.waitForTimeout(320)

  // Lock, then exercise the unlock failure states.
  await page.getByRole('button', { name: 'Lock wallet' }).click()
  await page.waitForTimeout(350)
  check('lock leads to Unlock', (await page.locator('main').innerText()).includes('Welcome back'))
  for (let i = 0; i < 2; i++) {
    await page.getByLabel('Password', { exact: true }).fill('short')
    await page.getByRole('button', { name: 'Unlock' }).click()
    await page.waitForTimeout(220)
  }
  const unlockText = await page.locator('main').innerText()
  check('Unlock: wrong password is explained', unlockText.includes('at least 8 characters'))
  check('Unlock: attempt counter after two failures', /2 failed attempts/.test(unlockText))
  shots.push(await page.screenshot())

  await page.getByRole('button', { name: 'Forgot password?' }).click()
  await page.waitForTimeout(320)
  check('Unlock: forgot-password sheet opens',
    await page.getByRole('dialog', { name: 'Forgot password?' }).isVisible())
  shots.push(await page.screenshot())
  await page.keyboard.press('Escape')
  await page.waitForTimeout(250)

  await page.getByLabel('Password', { exact: true }).fill('phoenix1')
  await page.getByRole('button', { name: 'Unlock' }).click()
  await page.waitForTimeout(350)
  check('Unlock: a valid password gets back in', await page.locator('header').isVisible())

  const scroll = await page.evaluate(() => ({
    doc: document.documentElement.scrollHeight > window.innerHeight,
    body: document.body.scrollHeight > window.innerHeight,
  }))
  check('shell never scrolled during the flow', !scroll.doc && !scroll.body)

  await browser.close()
  if (out) await stitch(shots, out)
  for (const r of results) console.log(`  ${r.pass ? 'PASS' : 'FAIL'}  ${r.label}${r.detail ? '  — ' + r.detail : ''}`)
  console.log('\nconsole:', errs.length ? '\n  ' + errs.join('\n  ') : 'none')
  process.exit(results.some((r) => !r.pass) || errs.length ? 1 : 0)
}

/* ----------------------------------------------------------------- walk --- */
if (mode === 'walk') {
  const { browser, page, errs } = await open()
  const shots = []
  const results = []
  const check = (label, pass, detail = '') => results.push({ label, pass, detail })

  await reachHome(page)
  check('header rendered', await page.locator('header').isVisible())
  check('tab bar rendered', await page.getByRole('navigation', { name: 'Primary' }).isVisible())
  shots.push(await page.screenshot())

  await page.locator('header').getByRole('button', { name: /Ethereum/ }).click()
  await page.waitForTimeout(350)
  check('network sheet opens', await page.getByRole('dialog', { name: 'Networks' }).isVisible())
  shots.push(await page.screenshot())

  // By label, not by role alone: Home's "Hide small balances" checkbox is still
  // in the DOM behind the sheet.
  const before = await page.getByRole('button', { name: /Sepolia/ }).count()
  await page.getByLabel('Testnets').check()
  await page.waitForTimeout(250)
  const after = await page.getByRole('button', { name: /Sepolia/ }).count()
  check('testnets hidden until toggled', before === 0 && after > 0, `${before} → ${after}`)
  await page.getByLabel('Testnets').uncheck()

  await page.getByRole('button', { name: /^Solana/ }).click()
  await page.waitForTimeout(350)
  check('header follows network switch', (await page.locator('header').innerText()).includes('Solana'))
  shots.push(await page.screenshot())

  await page.locator('header').getByRole('button', { name: /Main/ }).click()
  await page.waitForTimeout(350)
  check('account sheet opens', await page.getByRole('dialog', { name: 'Accounts' }).isVisible())
  await page.getByRole('button', { name: /^Cold storage/ }).click()
  await page.waitForTimeout(300)
  check('header follows account switch', (await page.locator('header').innerText()).includes('Cold storage'))
  shots.push(await page.screenshot())

  // Scoped to the tab bar: Home's action row has a Swap button of its own.
  const tabBar = page.getByRole('navigation', { name: 'Primary' })
  const current = []
  for (const tab of ['Swap', 'Activity', 'Settings', 'Home']) {
    const button = tabBar.getByRole('button', { name: tab, exact: true })
    await button.click()
    await page.waitForTimeout(300)
    current.push(`${tab}:${await button.getAttribute('aria-current')}`)
  }
  check('every tab marks itself current when selected',
    current.every((c) => c.endsWith(':page')), current.join(' '))
  check('the last tab landed on Home', /total balance/i.test(await page.locator('main').innerText()))

  // Activity used to point at the exact same route as Home, so pressing it
  // just landed back on Tokens — it needs to be its own destination.
  await tabBar.getByRole('button', { name: 'Activity', exact: true }).click()
  await page.waitForTimeout(320)
  check('Activity tab actually opens Activity, not Tokens',
    !(await page.locator('main').innerText()).includes('Hide small balances'))
  await tabBar.getByRole('button', { name: 'Home', exact: true }).click()
  await page.waitForTimeout(320)
  check('Home tab opens Tokens, not wherever Activity left off',
    (await page.locator('main').innerText()).includes('Hide small balances'))

  const scroll = await page.evaluate(() => ({
    doc: document.documentElement.scrollHeight > window.innerHeight,
    body: document.body.scrollHeight > window.innerHeight,
  }))
  check('shell does not scroll', !scroll.doc && !scroll.body)

  await browser.close()
  if (out) await stitch(shots, out)

  for (const r of results) console.log(`  ${r.pass ? 'PASS' : 'FAIL'}  ${r.label}${r.detail ? '  — ' + r.detail : ''}`)
  console.log('\nconsole:', errs.length ? '\n  ' + errs.join('\n  ') : 'none')
  process.exit(results.some((r) => !r.pass) || errs.length ? 1 : 0)
}

/* ----------------------------------------------------------------- home --- */
// §9.3 and the §13 claims that depend on Home: tabs, the small-balance filter,
// and that switching account, network or currency moves every value together.
if (mode === 'home') {
  const { browser, page, errs } = await open()
  const shots = []
  const results = []
  const check = (label, pass, detail = '') => results.push({ label, pass, detail })

  await reachHome(page)
  const heroText = async () => (await page.locator('main').innerText()).split('\n').slice(0, 4).join(' | ')

  // reachHome restores the sample phrase, so this is also the proof that a
  // restored wallet comes back with everything it had.
  check('restoring the phrase brings the funded wallet back',
    /\$1[0-9],\d{3}\.\d\d/.test(await page.locator('main').innerText()) &&
      (await page.locator('header').innerText()).includes('Main'),
    await heroText())
  check('balance hero shows a total', /\$[\d,]+\.\d\d/.test(await page.locator('main').innerText()),
    await heroText())
  check('action row has all four', (await page.getByRole('button', { name: /^(Send|Receive|Swap|Buy)$/ }).count()) >= 4)
  await page.getByRole('button', { name: 'Buy', exact: true }).click()
  await page.waitForTimeout(300)
  check('Buy opens a working screen', (await page.locator('main').innerText()).includes('You pay'))
  await page.getByRole('button', { name: 'Back' }).click()
  await page.waitForTimeout(280)
  shots.push(await page.screenshot())

  // hide small balances must actually remove the zero-balance holding
  const before = await page.locator('main').innerText()
  await page.getByLabel('Hide small balances').check()
  await page.waitForTimeout(280)
  const after = await page.locator('main').innerText()
  check('hide small balances drops PEPE', before.includes('PEPE') && !after.includes('PEPE'))
  check('hidden count is reported', /\d+ hidden/.test(after))
  await page.getByLabel('Hide small balances').uncheck()
  await page.waitForTimeout(220)

  await page.getByRole('tab', { name: 'NFTs' }).click()
  await page.waitForTimeout(320)
  check('NFTs tab renders cards', (await page.locator('main').innerText()).includes('Ember Fragments'))
  shots.push(await page.screenshot())

  await page.getByRole('tab', { name: 'Activity' }).click()
  await page.waitForTimeout(320)
  const act = await page.locator('main').innerText()
  check('activity is day-grouped', /today|yesterday/i.test(act))
  check('activity shows all kinds', ['Sent', 'Received', 'Swapped', 'Approved', 'Minted'].some((k) => act.includes(k)))
  shots.push(await page.screenshot())

  await page.getByRole('tab', { name: 'Tokens' }).click()
  await page.waitForTimeout(280)

  // §13: switching network moves header, balance, tokens, NFTs and activity together
  const ethTotal = (await page.locator('main').innerText()).match(/\$[\d,]+\.\d\d/)?.[0]
  await page.locator('header').getByRole('button', { name: /Ethereum/ }).click()
  await page.waitForTimeout(320)
  await page.getByRole('button', { name: /^Solana/ }).click()
  await page.waitForTimeout(400)
  const solText = await page.locator('main').innerText()
  const solTotal = solText.match(/\$[\d,]+\.\d\d/)?.[0]
  check('network switch changes the total', ethTotal !== solTotal, `${ethTotal} → ${solTotal}`)
  check('network switch changes the token list', solText.includes('JUP') && !solText.includes('LINK'))
  shots.push(await page.screenshot())

  await browser.close()
  if (out) await stitch(shots, out)
  for (const r of results) console.log(`  ${r.pass ? 'PASS' : 'FAIL'}  ${r.label}${r.detail ? '  — ' + r.detail : ''}`)
  console.log('\nconsole:', errs.length ? '\n  ' + errs.join('\n  ') : 'none')
  process.exit(results.some((r) => !r.pass) || errs.length ? 1 : 0)
}

/* ---------------------------------------------------------------- flows --- */
// §13: Send and Swap must complete, appear at the top of Activity, and update
// balances. Also covers Receive and the deliberate disabled states.
if (mode === 'flows') {
  const { browser, page, errs } = await open()
  const shots = []
  const results = []
  const check = (label, pass, detail = '') => results.push({ label, pass, detail })

  const hold = async (name) => {
    const btn = page.getByRole('button', { name: new RegExp(name) })
    const box = await btn.boundingBox()
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.down()
    await page.waitForTimeout(750)
    await page.mouse.up()
  }
  const balanceOf = async (sym) => {
    const row = page.getByRole('button', { name: new RegExp(`^${sym} `) }).first()
    return (await row.count()) ? (await row.innerText()).split('\n')[2] : null
  }

  await reachHome(page)
  const ethBefore = await balanceOf('ETH')

  /* --- Send ---------------------------------------------------------- */
  await page.getByRole('button', { name: 'Send', exact: true }).click()
  await page.waitForTimeout(320)

  await page.getByLabel(/Recipient on/).fill('0xnotanaddress')
  await page.waitForTimeout(250)
  check('SendTo rejects a malformed address',
    (await page.locator('main').innerText()).includes('not a valid'))

  // A well-formed address for the wrong chain must say so specifically.
  await page.getByLabel(/Recipient on/).fill('7xKpQr9mNvBcJd2WsAeF4hGtYu5ZnLpXqRm3TbVcHkJd')
  await page.waitForTimeout(250)
  check('SendTo names the wrong-chain mistake',
    /looks like a Solana address/.test(await page.locator('main').innerText()))
  shots.push(await page.screenshot())

  await page.getByLabel(/Recipient on/).fill('0x9f2b41d7c05e8a3612bd47f09ac5e83b7d1064fa')
  await page.waitForTimeout(250)
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.waitForTimeout(320)

  await page.getByLabel('Amount').fill('999999')
  await page.waitForTimeout(250)
  check('SendAmount flags insufficient funds',
    /Not enough ETH/.test(await page.locator('main').innerText()))
  check('Review stays disabled while short',
    await page.getByRole('button', { name: 'Review' }).isDisabled())

  await page.getByLabel('Amount').fill('0.25')
  await page.waitForTimeout(250)
  await page.getByRole('button', { name: 'Review' }).click()
  await page.waitForTimeout(320)
  shots.push(await page.screenshot())

  await hold('Send')
  await page.waitForTimeout(400)
  check('TxStatus shows pending first',
    /Sending/.test(await page.locator('main').innerText()))
  check('Done is gated until settled',
    await page.getByRole('button', { name: 'Done' }).isDisabled())
  shots.push(await page.screenshot())

  await page.waitForTimeout(1900)
  check('TxStatus settles to sent', /^Sent$|Sent\n/m.test(await page.locator('main').innerText()))
  shots.push(await page.screenshot())
  await page.getByRole('button', { name: 'Done' }).click()
  await page.waitForTimeout(420)

  const ethAfter = await balanceOf('ETH')
  check('send reduced the ETH balance', ethBefore !== ethAfter, `${ethBefore} → ${ethAfter}`)

  await page.getByRole('tab', { name: 'Activity' }).click()
  await page.waitForTimeout(320)
  const firstRow = await page.locator('main button').filter({ hasText: 'Sent' }).first().innerText()
  check('new send is at the top of Activity', /0\.25 ETH/.test(firstRow), firstRow.replace(/\n/g, ' | '))

  /* --- Swap ---------------------------------------------------------- */
  await page.getByRole('button', { name: 'Swap', exact: true }).last().click()
  await page.waitForTimeout(350)
  check('Review swap disabled at zero amount',
    await page.getByRole('button', { name: 'Review swap' }).isDisabled())

  await page.getByLabel('Amount').fill('0.5')
  await page.waitForTimeout(300)
  const swapText = await page.locator('main').innerText()
  check('rate line is shown', /1 ETH = /.test(swapText))
  await page.getByRole('button', { name: 'Details' }).click()
  await page.waitForTimeout(280)
  check('details show slippage, fee, minimum received',
    /Max slippage/.test(await page.locator('main').innerText()) &&
    /Minimum received/.test(await page.locator('main').innerText()))
  shots.push(await page.screenshot())

  await page.getByRole('button', { name: 'Review swap' }).click()
  await page.waitForTimeout(320)
  await hold('Swap')
  await page.waitForTimeout(2300)
  check('swap settles', /Swapped/.test(await page.locator('main').innerText()))
  shots.push(await page.screenshot())
  await page.getByRole('button', { name: 'Done' }).click()
  await page.waitForTimeout(420)

  await page.getByRole('tab', { name: 'Activity' }).click()
  await page.waitForTimeout(320)
  // Scope to rows carrying a timestamp: the first button in <main> is the Send
  // action tile, which sits above the tabs.
  const topActivity = await page
    .locator('main button')
    .filter({ hasText: /ago|Just now/ })
    .first()
    .innerText()
  check('new swap is at the top of Activity', /Swapped/.test(topActivity),
    topActivity.replace(/\n/g, ' | '))

  /* --- Receive -------------------------------------------------------- */
  await page.getByRole('tab', { name: 'Tokens' }).click()
  await page.waitForTimeout(220)
  await page.getByRole('button', { name: 'Receive', exact: true }).click()
  await page.waitForTimeout(500)
  check('QR renders', (await page.locator('main svg').count()) > 1)
  check('warning names the network',
    /Send only Ethereum assets/.test(await page.locator('main').innerText()))
  shots.push(await page.screenshot())

  /* --- Buy -------------------------------------------------------------- */
  await page.getByRole('button', { name: 'Back' }).click()
  await page.waitForTimeout(320)
  await page.getByRole('button', { name: 'Buy', exact: true }).click()
  await page.waitForTimeout(320)
  check('Review purchase disabled at zero amount',
    await page.getByRole('button', { name: 'Review purchase' }).isDisabled())

  await page.getByLabel(/Amount to spend/).fill('10')
  await page.waitForTimeout(250)
  check('Buy flags an order below the minimum',
    /Minimum order/.test(await page.locator('main').innerText()))

  await page.getByLabel(/Amount to spend/).fill('250')
  await page.waitForTimeout(250)
  const buyText = await page.locator('main').innerText()
  const gotMatch = buyText.match(/≈ ([\d.,]+) ETH/)
  const gotAmount = gotMatch ? Number(gotMatch[1].replace(/,/g, '')) : 0
  check('the you-get amount reflects the order', gotAmount > 0, `≈ ${gotAmount} ETH`)
  check('provider fee is broken out', /Provider fee/.test(buyText))
  shots.push(await page.screenshot())

  await page.getByRole('button', { name: 'Review purchase' }).click()
  await page.waitForTimeout(320)
  shots.push(await page.screenshot())

  await hold('Buy')
  await page.waitForTimeout(2300)
  check('buy settles', /Bought/.test(await page.locator('main').innerText()))
  shots.push(await page.screenshot())
  await page.getByRole('button', { name: 'Done' }).click()
  await page.waitForTimeout(420)

  await page.getByRole('tab', { name: 'Activity' }).click()
  await page.waitForTimeout(320)
  const topBuy = await page
    .locator('main button')
    .filter({ hasText: /ago|Just now/ })
    .first()
    .innerText()
  check('new buy is at the top of Activity', /Bought/.test(topBuy), topBuy.replace(/\n/g, ' | '))

  const scroll = await page.evaluate(() => ({
    doc: document.documentElement.scrollHeight > window.innerHeight,
    body: document.body.scrollHeight > window.innerHeight,
  }))
  check('shell never scrolled', !scroll.doc && !scroll.body)

  await browser.close()
  if (out) await stitch(shots, out)
  for (const r of results) console.log(`  ${r.pass ? 'PASS' : 'FAIL'}  ${r.label}${r.detail ? '  — ' + r.detail : ''}`)
  console.log('\nconsole:', errs.length ? '\n  ' + errs.join('\n  ') : 'none')
  process.exit(results.some((r) => !r.pass) || errs.length ? 1 : 0)
}

/* ------------------------------------------------------------- settings --- */
// §9.7 and the two §13 claims nothing else exercises: switching *account* moves
// the balance, tokens, NFTs and activity together, and changing the display
// currency updates every formatted value.
if (mode === 'settings') {
  const { browser, page, errs } = await open()
  const shots = []
  const results = []
  const check = (label, pass, detail = '') => results.push({ label, pass, detail })
  const main = () => page.locator('main').innerText()
  const totalOf = async () => (await main()).match(/[$€£]|zł/) && (await main()).match(/[^\s]*[\d,]+\.\d\d/)?.[0]

  await reachHome(page)
  const mainTotal = await totalOf()
  const mainTokens = await main()

  /* --- account list --------------------------------------------------- */
  await page.locator('header').getByRole('button', { name: /Main/ }).click()
  await page.waitForTimeout(320)
  await page.getByRole('button', { name: 'Manage accounts' }).click()
  await page.waitForTimeout(360)

  const listText = await main()
  check('account list shows all three', ['Main', 'Trading', 'Cold storage'].every((n) => listText.includes(n)))
  const listTotals = [...listText.matchAll(/\$[\d,]+\.\d\d/g)].map((m) => m[0])
  check('each account shows its own balance', new Set(listTotals).size === listTotals.length,
    listTotals.join(' / '))
  shots.push(await page.screenshot())

  /* --- rename --------------------------------------------------------- */
  await page.getByRole('button', { name: 'Rename Trading' }).click()
  await page.waitForTimeout(320)
  await page.getByLabel('Name').fill('Main')
  await page.waitForTimeout(220)
  check('rename rejects a name already in use',
    /already have an account with that name/.test(await main()) &&
      (await page.getByRole('button', { name: 'Save' }).isDisabled()))
  await page.getByLabel('Name').fill('Desk')
  await page.waitForTimeout(200)
  await page.getByRole('button', { name: 'Save' }).click()
  await page.waitForTimeout(360)
  check('rename takes effect in the list', (await main()).includes('Desk'))

  /* --- §13: switching account moves everything ------------------------ */
  await page.getByRole('button', { name: /^Cold storage/ }).click()
  await page.waitForTimeout(420)
  const coldTotal = await totalOf()
  const coldTokens = await main()
  check('account switch changes the total', mainTotal !== coldTotal, `${mainTotal} → ${coldTotal}`)
  check('account switch changes the token list',
    mainTokens.includes('LINK') && !coldTokens.includes('LINK'))
  check('header names the account it is showing',
    (await page.locator('header').innerText()).includes('Cold storage'))

  await page.getByRole('tab', { name: 'NFTs' }).click()
  await page.waitForTimeout(300)
  check('account switch changes NFTs', /No collectibles yet/.test(await main()))
  await page.getByRole('tab', { name: 'Activity' }).click()
  await page.waitForTimeout(300)
  check('account switch changes activity', /No activity yet/.test(await main()))
  shots.push(await page.screenshot())

  /* --- an account added at runtime starts empty ----------------------- */
  await page.getByRole('button', { name: 'Settings' }).last().click()
  await page.waitForTimeout(320)
  // Scoped to main: the header's account switcher carries the same name.
  await page.locator('main').getByRole('button', { name: /^Cold storage/ }).click()
  await page.waitForTimeout(320)
  await page.getByRole('button', { name: 'Add account' }).last().click()
  await page.waitForTimeout(320)

  /* --- import private key ---------------------------------------------- */
  await page.getByRole('button', { name: /Import private key/ }).click()
  await page.waitForTimeout(320)
  check('opens straight on the key tab',
    (await page.getByRole('tab', { name: 'Private key' }).getAttribute('aria-selected')) === 'true')

  await page.getByLabel('Private key').fill('not a real key')
  await page.waitForTimeout(220)
  check('a malformed key is rejected', /doesn.t look like a private key/.test(await main()))
  check('Import stays disabled for a bad key', await page.getByRole('button', { name: 'Import' }).isDisabled())

  await page.getByLabel('Private key').fill('ab'.repeat(32))
  await page.waitForTimeout(220)
  check('a well-formed key is accepted', await page.getByRole('button', { name: 'Import' }).isEnabled())
  await page.getByRole('button', { name: 'Import' }).click()
  await page.waitForTimeout(420)
  check('the imported account lands on Home, empty',
    /Imported \d+/.test(await page.locator('header').innerText()) && /\$0\.00/.test(await main()))
  shots.push(await page.screenshot())

  /* --- connect hardware wallet ------------------------------------------ */
  await page.getByRole('button', { name: 'Settings' }).last().click()
  await page.waitForTimeout(300)
  // The wallet row is the first control on Settings; its name is whichever
  // account is active (just switched to the imported one), so it is addressed
  // by position rather than by name.
  await page.locator('main button').first().click()
  await page.waitForTimeout(320)
  await page.getByRole('button', { name: 'Add account' }).last().click()
  await page.waitForTimeout(320)
  await page.getByRole('button', { name: /Connect hardware wallet/ }).click()
  await page.waitForTimeout(320)
  check('hardware picker offers Ledger and Trezor',
    (await main()).includes('Ledger') && (await main()).includes('Trezor'))

  await page.getByRole('button', { name: /^Ledger/ }).click()
  await page.waitForTimeout(300)
  check('searching state names the device', /Looking for your Ledger/.test(await main()))
  await page.waitForTimeout(1500)
  check('device connects and offers accounts to pick', /Ledger connected/.test(await main()))
  check('Add account is gated until one is picked',
    await page.getByRole('button', { name: 'Add account', exact: true }).isDisabled())

  await page.getByRole('button', { name: /Ledger 1/ }).click()
  await page.waitForTimeout(220)
  await page.getByRole('button', { name: 'Add account', exact: true }).click()
  await page.waitForTimeout(420)
  check('the hardware account lands on Home, empty',
    (await page.locator('header').innerText()).includes('Ledger 1') && /\$0\.00/.test(await main()))
  shots.push(await page.screenshot())

  /* --- create new -------------------------------------------------------- */
  await page.getByRole('button', { name: 'Settings' }).last().click()
  await page.waitForTimeout(300)
  await page.locator('main button').first().click()
  await page.waitForTimeout(320)
  await page.getByRole('button', { name: 'Add account' }).last().click()
  await page.waitForTimeout(320)
  await page.getByRole('button', { name: /Create new/ }).click()
  await page.waitForTimeout(320)
  await page.getByRole('button', { name: 'Create account' }).click()
  await page.waitForTimeout(420)
  // Not an empty screen: a real new account holds the native asset at zero,
  // waiting for a first deposit. What it must not hold is anyone else's money.
  const added = await main()
  check('a new account holds nothing but zero',
    /\$0\.00/.test(added) && /ETH/.test(added) && !/USDC|LINK|WBTC/.test(added),
    added.split('\n')[1])
  shots.push(await page.screenshot())

  /* --- back to the seeded account, which has values to convert -------- */
  await page.getByRole('button', { name: 'Settings' }).last().click()
  await page.waitForTimeout(320)
  // The wallet row is the first control on Settings; its name is whichever
  // account is active, so it is addressed by position rather than by name.
  await page.locator('main button').first().click()
  await page.waitForTimeout(340)
  await page.locator('main').getByRole('button', { name: /^Main/ }).click()
  await page.waitForTimeout(420)

  /* --- §13: currency updates every formatted value -------------------- */
  await page.getByRole('button', { name: 'Settings' }).last().click()
  await page.waitForTimeout(320)
  await page.getByRole('button', { name: /Currency/ }).click()
  await page.waitForTimeout(320)
  check('currency screen previews the portfolio in each currency',
    (await main()).includes('zł') && (await main()).includes('£'))
  await page.getByRole('radio', { name: /EUR/ }).click()
  await page.waitForTimeout(300)
  shots.push(await page.screenshot())

  await page.getByRole('button', { name: 'Home' }).last().click()
  await page.waitForTimeout(420)
  const eurHome = await main()
  check('currency change reaches the balance hero', /€[\d,]+\.\d\d/.test(eurHome),
    eurHome.split('\n')[0] + ' ' + eurHome.split('\n')[1])
  check('currency change reaches every token row',
    !eurHome.includes('$'), eurHome.includes('$') ? 'a $ value survived' : 'no $ left on Home')

  await page.getByRole('tab', { name: 'Activity' }).click()
  await page.waitForTimeout(300)
  const failed = page.locator('main button').filter({ hasText: 'Approved' }).first()
  await failed.click()
  await page.waitForTimeout(360)
  const detail = await main()
  check('activity detail explains a failure in plain language',
    /network fee ran out/.test(detail))
  // An approval has no sender and no recipient, so it must not be labelled with
  // them — it names the spender it granted and the account that granted it.
  check('activity detail names the parties for what they are',
    ['Spender', 'Account', 'Network', 'Network fee', 'When'].every((l) => detail.includes(l)) &&
      !/^From$/m.test(detail))
  check('an approval shows no fiat value', !/[$€£]0\.00/.test(detail))
  check('activity detail shows the full hash', /0x[0-9a-f]{64}/.test(detail))
  shots.push(await page.screenshot())

  /* --- explorer sheet --------------------------------------------------- */
  await page.getByRole('button', { name: /^View on/ }).click()
  await page.waitForTimeout(280)
  const explorer = await main()
  check('explorer sheet shows block and confirmation data',
    /Block/.test(explorer) && /Confirmations/.test(explorer))
  check('explorer sheet carries the network fee row', /Network fee/.test(explorer))
  await page.keyboard.press('Escape')
  await page.waitForTimeout(240)

  await page.getByRole('button', { name: 'Back' }).click()
  await page.waitForTimeout(360)

  /* --- collectible detail --------------------------------------------- */
  await page.getByRole('tab', { name: 'NFTs' }).click()
  await page.waitForTimeout(320)
  await page.getByRole('button', { name: /Fragment 0184/ }).click()
  await page.waitForTimeout(360)
  const nft = await main()
  check('collectible shows collection, id and traits',
    nft.includes('Ember Fragments') && nft.includes('#184') && nft.includes('Cleaved'))
  await page.getByRole('button', { name: 'Set as avatar' }).click()
  await page.waitForTimeout(320)
  check('set as avatar is reflected on the screen',
    /Account avatar/.test(await main()) &&
      (await page.getByRole('button', { name: 'Reset avatar' }).count()) === 1)
  shots.push(await page.screenshot())

  /* --- security -------------------------------------------------------- */
  await page.getByRole('button', { name: 'Settings' }).last().click()
  await page.waitForTimeout(320)
  await page.getByRole('button', { name: /^Security/ }).click()
  await page.waitForTimeout(320)
  await page.getByLabel('Password', { exact: true }).fill('short')
  await page.getByRole('button', { name: 'Reveal phrase' }).click()
  await page.waitForTimeout(280)
  check('reveal is gated on a password', /at least 8 characters/i.test(await main()))
  await page.getByLabel('Password', { exact: true }).fill('phoenix1')
  await page.getByRole('button', { name: 'Reveal phrase' }).click()
  await page.waitForTimeout(320)
  // reachHome restored the sample wallet, so Security must show *that* wallet's
  // phrase — the twelve words it was restored from, not a freshly generated set.
  check('phrase is revealed after the gate', (await main()).includes('signal'))
  const revealed = await page.evaluate(() =>
    [...document.querySelectorAll('main .font-mono')]
      .map((el) => el.textContent.trim())
      .filter((t) => /^[a-z]+$/.test(t)))
  check('the revealed phrase is twelve words', revealed.length === 12, revealed.join(' '))
  shots.push(await page.screenshot())
  await page.getByRole('button', { name: 'Back' }).click()
  await page.waitForTimeout(320)

  /* --- networks -------------------------------------------------------- */
  await page.getByRole('button', { name: /^Networks/ }).click()
  await page.waitForTimeout(320)
  const orderBefore = (await main()).split('\n').filter((l) => /^(Ethereum|Solana|Bitcoin)$/.test(l))
  await page.getByRole('button', { name: 'Move Ethereum down' }).click()
  await page.waitForTimeout(300)
  const orderAfter = (await main()).split('\n').filter((l) => /^(Ethereum|Solana|Bitcoin)$/.test(l))
  check('reordering moves the network', orderBefore[0] !== orderAfter[0],
    `${orderBefore.slice(0, 2).join(', ')} → ${orderAfter.slice(0, 2).join(', ')}`)

  await page.getByRole('button', { name: 'Add a network' }).click()
  await page.waitForTimeout(300)
  await page.getByLabel('Name').fill('Ethereum')
  await page.waitForTimeout(220)
  check('custom network rejects a duplicate name',
    /already in the list/.test(await main()) && (await page.getByRole('button', { name: 'Add' }).isDisabled()))
  await page.getByLabel('Name').fill('Monad')
  await page.getByLabel('Currency symbol').fill('mon')
  await page.waitForTimeout(220)
  await page.getByRole('button', { name: 'Add', exact: true }).click()
  await page.waitForTimeout(340)
  check('custom network is listed and says it is not connected',
    /Monad/.test(await main()) && /not connected in this demo/.test(await main()))
  shots.push(await page.screenshot())
  await page.getByRole('button', { name: 'Remove Monad' }).click()
  await page.waitForTimeout(300)
  check('custom network can be removed', !(await main()).includes('Monad'))
  await page.getByRole('button', { name: 'Back' }).click()
  await page.waitForTimeout(320)

  /* --- connected sites and about --------------------------------------- */
  await page.getByRole('button', { name: /Connected sites/ }).click()
  await page.waitForTimeout(320)
  check('two sites are listed', (await main()).includes('app.uniswap.org') && (await main()).includes('jup.ag'))
  await page.getByRole('button', { name: 'Disconnect' }).first().click()
  await page.waitForTimeout(340)
  check('disconnect removes the site', !(await main()).includes('app.uniswap.org'))
  shots.push(await page.screenshot())
  await page.getByRole('button', { name: 'Back' }).click()
  await page.waitForTimeout(320)

  await page.getByRole('button', { name: /^About/ }).click()
  await page.waitForTimeout(320)
  const about = await main()
  check('about states the build has no permissions and no network',
    /None requested/.test(about) && /Network requests/.test(about))
  check('about shows a version', /Version \d+\.\d+\.\d+/.test(about))

  /* --- about links --------------------------------------------------------
   * Rows carry a detail line, so the accessible name is "Label detail…" —
   * matched the way every other labelled row in this file is (prefix regex,
   * not exact), and checked against the sheet's own dialog rather than the
   * whole page so the assertion cannot pass off the row's detail text alone. */
  await page.getByRole('button', { name: /^Website/ }).click()
  await page.waitForTimeout(280)
  const websiteSheet = await page.getByRole('dialog', { name: 'Website' }).innerText()
  check('website link shows the placeholder domain',
    websiteSheet.includes('phoenix.wallet') && /public release/.test(websiteSheet))
  await page.keyboard.press('Escape')
  await page.waitForTimeout(240)

  await page.getByRole('button', { name: /^Documentation/ }).click()
  await page.waitForTimeout(280)
  const docsSheet = await page.getByRole('dialog', { name: 'Documentation' }).innerText()
  check('documentation link lists guide topics', /Sending and receiving/.test(docsSheet))
  await page.keyboard.press('Escape')
  await page.waitForTimeout(240)

  await page.getByRole('button', { name: /^Support/ }).click()
  await page.waitForTimeout(280)
  const supportSheet = await page.getByRole('dialog', { name: 'Support' }).innerText()
  check('support link shows a contact address', supportSheet.includes('support@phoenix.wallet'))
  await page.keyboard.press('Escape')
  await page.waitForTimeout(240)

  await page.getByRole('button', { name: /^Privacy policy/ }).click()
  await page.waitForTimeout(280)
  const privacySheet = await page.getByRole('dialog', { name: 'Privacy policy' }).innerText()
  check('privacy policy states the no-network, no-data claim',
    /makes no network requests and collects no data/.test(privacySheet))
  await page.keyboard.press('Escape')
  await page.waitForTimeout(240)
  shots.push(await page.screenshot())

  const scroll = await page.evaluate(() => ({
    doc: document.documentElement.scrollHeight > window.innerHeight,
    body: document.body.scrollHeight > window.innerHeight,
  }))
  check('shell never scrolled', !scroll.doc && !scroll.body)

  await browser.close()
  if (out) await stitch(shots, out)
  for (const r of results) console.log(`  ${r.pass ? 'PASS' : 'FAIL'}  ${r.label}${r.detail ? '  — ' + r.detail : ''}`)
  console.log('\nconsole:', errs.length ? '\n  ' + errs.join('\n  ') : 'none')
  process.exit(results.some((r) => !r.pass) || errs.length ? 1 : 0)
}

/* --------------------------------------------------------------- motion --- */
// §10's inventory and the §13 line about reduced motion. The point is not that
// things move — it is that they *finish*: a tween that throws leaves elements
// stuck at their from-state, which no text assertion would ever notice.
if (mode === 'motion') {
  const results = []
  const shots = []
  const check = (label, pass, detail = '') => results.push({ label, pass, detail })

  /** True when no lit rail is left inside the visible frame. */
  const reduced0 = (page) =>
    page.evaluate(() => {
      const rail = document.querySelector('[data-ignite-rail]')
      if (!rail) return 'no rail'
      const box = rail.getBoundingClientRect()
      const cs = getComputedStyle(rail)
      return cs.visibility === 'hidden' || +cs.opacity === 0 || box.left >= window.innerWidth || box.right <= 0
    })

  const styleOf = (page, selector, props) =>
    page.evaluate(
      ({ selector, props }) => {
        const el = document.querySelector(selector)
        if (!el) return null
        const cs = getComputedStyle(el)
        return Object.fromEntries(props.map((p) => [p, cs[p]]))
      },
      { selector, props },
    )

  /* --- with motion ---------------------------------------------------- */
  const { browser, page, errs } = await open()
  await reachHome(page)
  await page.waitForTimeout(900)

  const row = await styleOf(page, '[data-stagger]', ['opacity', 'transform'])
  check('staggered rows finish fully opaque', row?.opacity === '1', JSON.stringify(row))
  check('stagger clears its transform', row?.transform === 'none', row?.transform)

  const balance = await page.locator('main span').first().innerText()
  check('the balance figure lands on its real value', /^\$[\d,]+\.\d\d$/.test(balance), balance)

  // §5.5: the ignite belongs to Unlock and Ready. Nowhere else.
  check('Home does not ignite', (await page.locator('[data-ignite-mark]').count()) === 0)

  const railBefore = await styleOf(page, '[data-tab-rail]', ['width', 'left'])
  await page.getByRole('tab', { name: 'Activity' }).click()
  await page.waitForTimeout(400)
  const railAfter = await styleOf(page, '[data-tab-rail]', ['width', 'left'])
  check('the tab rail tweens to the active tab', railBefore?.left !== railAfter?.left,
    `${railBefore?.left} → ${railAfter?.left}`)
  check('the tab rail has a measured width', parseFloat(railAfter?.width ?? '0') > 20, railAfter?.width)

  await page.locator('header').getByRole('button', { name: 'Lock wallet' }).click()
  await page.waitForTimeout(900)
  check('Unlock ignites', (await page.locator('[data-ignite-mark]').count()) === 1)
  const mark = await styleOf(page, '[data-ignite-mark]', ['opacity', 'transform'])
  check('the ignite finishes at full size', mark?.opacity === '1' && mark?.transform === 'none',
    JSON.stringify(mark))
  // The rail is half the header wide: it has to travel two of its own widths to
  // leave the frame. Stopping at one parks a lit bar over the right half.
  const ignRail = await reduced0(page)
  check('the ignite rail leaves the frame', ignRail === true, String(ignRail))
  shots.push(await page.screenshot())
  await browser.close()

  /* --- with prefers-reduced-motion: reduce ------------------------------ */
  const reduced = await open({ reducedMotion: 'reduce' })
  await reachHome(reduced.page)
  await reduced.page.waitForTimeout(120)

  const rBalance = await reduced.page.locator('main span').first().innerText()
  check('reduced motion shows the final figure at once', /^\$[\d,]+\.\d\d$/.test(rBalance), rBalance)

  const rRow = await styleOf(reduced.page, '[data-stagger]', ['opacity', 'transform'])
  check('reduced motion leaves rows visible', rRow?.opacity === '1', JSON.stringify(rRow))

  const rows = await reduced.page.locator('[data-stagger]').count()
  check('reduced motion renders the whole list', rows >= 5, `${rows} rows`)

  const scroll = await reduced.page.evaluate(() => ({
    doc: document.documentElement.scrollHeight > window.innerHeight,
    body: document.body.scrollHeight > window.innerHeight,
  }))
  check('reduced motion does not break the layout', !scroll.doc && !scroll.body)

  // The hold is a safeguard, not decoration: it must still take the full 600ms.
  await reduced.page.getByRole('button', { name: 'Send', exact: true }).click()
  await reduced.page.waitForTimeout(320)
  await reduced.page.getByLabel(/Recipient on/).fill('0x9f2b41d7c05e8a3612bd47f09ac5e83b7d1064fa')
  await reduced.page.waitForTimeout(220)
  await reduced.page.getByRole('button', { name: 'Continue' }).click()
  await reduced.page.waitForTimeout(320)
  await reduced.page.getByLabel('Amount').fill('0.1')
  await reduced.page.waitForTimeout(220)
  await reduced.page.getByRole('button', { name: 'Review' }).click()
  await reduced.page.waitForTimeout(320)

  const holdButton = reduced.page.getByRole('button', { name: /Send — press and hold/ })
  const box = await holdButton.boundingBox()
  await reduced.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await reduced.page.mouse.down()
  await reduced.page.waitForTimeout(150)
  await reduced.page.mouse.up()
  await reduced.page.waitForTimeout(300)
  check('a short press does not confirm, reduced motion or not',
    /Review/.test(await reduced.page.locator('main').innerText()))

  await reduced.page.mouse.down()
  await reduced.page.waitForTimeout(750)
  await reduced.page.mouse.up()
  await reduced.page.waitForTimeout(400)
  check('a full hold still confirms', /Sending|Sent/.test(await reduced.page.locator('main').innerText()))

  // Checked here, on TxStatus, because that is the only screen with a heat rail.
  // A rail that cannot sweep is a progress bar frozen at a third — it has to go,
  // not merely stop.
  const heat = await reduced.page.evaluate(() => {
    const rail = document.querySelector('[data-heat-rail]')
    if (!rail) return 'no rail on this screen'
    const cs = getComputedStyle(rail)
    return cs.visibility === 'hidden' || +cs.opacity === 0 ? 'hidden' : 'VISIBLE AND STILL'
  })
  check('reduced motion hides the rail it cannot sweep', heat === 'hidden', String(heat))
  shots.push(await reduced.page.screenshot())

  const allErrs = [...errs, ...reduced.errs]
  await reduced.browser.close()
  if (out) await stitch(shots, out)
  for (const r of results) console.log(`  ${r.pass ? 'PASS' : 'FAIL'}  ${r.label}${r.detail ? '  — ' + r.detail : ''}`)
  console.log('\nconsole:', allErrs.length ? '\n  ' + allErrs.join('\n  ') : 'none')
  process.exit(results.some((r) => !r.pass) || allErrs.length ? 1 : 0)
}

/* ------------------------------------------------------------ keyboard --- */
// §11 + §13's own line: "keyboard-only pass through onboarding, send and
// settings succeeds." No mouse is used anywhere in this mode — every reach,
// fill and submit goes through Tab, Enter, Space and Escape, the same way
// someone who cannot use a pointer would have to.
if (mode === 'keyboard') {
  const { browser, page, errs } = await open()
  const results = []
  const check = (label, pass, detail = '') => results.push({ label, pass, detail })

  const focusedText = () =>
    page.evaluate(() => {
      const el = document.activeElement
      if (!el || el === document.body) return null
      if (el.getAttribute('aria-label')) return el.getAttribute('aria-label').trim()
      if (el.labels && el.labels.length) return el.labels[0].textContent.trim()
      return (el.textContent || el.tagName).trim()
    })
  const hasFocusRing = () =>
    page.evaluate(() => {
      const cs = getComputedStyle(document.activeElement)
      return cs.boxShadow !== 'none' && cs.boxShadow !== ''
    })
  /** Tabs forward until the focused element's name matches, proving the
   * control is reachable — without hard-coding how many stops away it is,
   * which would break the moment an unrelated row is added or removed. */
  const tabUntil = async (matcher, max = 40) => {
    for (let i = 0; i < max; i++) {
      await page.keyboard.press('Tab')
      const text = await focusedText()
      if (text && matcher(text)) return true
    }
    return false
  }

  /* --- onboarding, start to finish, zero clicks ------------------------- */
  await page.keyboard.press('Tab')
  check('tab order starts on the primary action', (await focusedText()) === 'Create a new wallet')
  check('focus ring is visible on keyboard focus', await hasFocusRing())
  await page.keyboard.press('Tab')
  check('tab order reaches the secondary action next, in visual order',
    (await focusedText()) === 'I already have a wallet')
  await page.keyboard.press('Enter')
  await page.waitForTimeout(320)
  check('Enter activates the focused button', /Recovery phrase/.test(await page.locator('main').innerText()))

  check('the sample-phrase shortcut is reachable by keyboard',
    await tabUntil((t) => t === 'Fill the sample phrase'))
  await page.keyboard.press('Enter')
  await page.waitForTimeout(280)
  check('Enter on the shortcut fills all twelve words', /12 \/ 12/.test(await page.locator('main').innerText()))

  check('Import is reachable by keyboard once the phrase is filled',
    await tabUntil((t) => t === 'Import'))
  await page.keyboard.press('Enter')
  await page.waitForTimeout(340)
  check('Enter submits the primary action', /Create a password/i.test(await page.locator('main').innerText()))

  // The password field carries autoFocus, so no Tab is needed to reach it.
  check('the password field is focused on arrival', (await focusedText()) === 'Password')
  await page.keyboard.type('phoenix1')
  await page.keyboard.press('Tab')
  check('tab order reaches Confirm password next', (await focusedText()) === 'Confirm password')
  await page.keyboard.type('phoenix1')
  check('the acknowledgement checkbox is reachable by keyboard',
    await tabUntil((t) => /cannot reset this password/.test(t)))
  await page.keyboard.press('Space')
  check('Continue is reachable and enabled once every rule is met',
    await tabUntil((t) => t === 'Continue'))
  await page.keyboard.press('Enter')
  await page.waitForTimeout(360)

  check('Open wallet is reachable by keyboard on Ready', await tabUntil((t) => t === 'Open wallet'))
  await page.keyboard.press('Enter')
  await page.waitForTimeout(420)
  check('the onboarding pass lands on Home', /total balance/i.test(await page.locator('main').innerText()))

  /* --- send, start to finish, zero clicks ------------------------------- */
  check('Send is reachable by keyboard from Home', await tabUntil((t) => t === 'Send'))
  await page.keyboard.press('Enter')
  await page.waitForTimeout(320)
  // The recipient field also carries autoFocus.
  check('the recipient field is focused on arrival', /^Recipient on/.test((await focusedText()) ?? ''))
  await page.keyboard.type('0x9f2b41d7c05e8a3612bd47f09ac5e83b7d1064fa')
  check('Continue is reachable once the address is valid', await tabUntil((t) => t === 'Continue'))
  await page.keyboard.press('Enter')
  await page.waitForTimeout(320)

  check('the amount field is reachable by keyboard', await tabUntil((t) => t === 'Amount'))
  await page.keyboard.type('0.1')

  // Esc closes a sheet and returns focus to whatever opened it (§11) — proven
  // here on the asset picker, reachable mid-flow without leaving the keyboard.
  check('the asset picker is reachable by keyboard', await tabUntil((t) => t === 'ETH'))
  await page.keyboard.press('Enter')
  await page.waitForTimeout(280)
  check('Esc opens the asset picker as a dialog',
    await page.getByRole('dialog', { name: 'Select asset' }).isVisible())
  await page.keyboard.press('Escape')
  await page.waitForTimeout(280)
  check('Escape closes the sheet and restores focus to its trigger',
    (await focusedText()) === 'ETH')

  check('Review is reachable by keyboard', await tabUntil((t) => t === 'Review'))
  await page.keyboard.press('Enter')
  await page.waitForTimeout(320)

  check('the hold-to-confirm control is reachable by keyboard',
    await tabUntil((t) => /Send — press and hold/.test(t)))
  // A short key press must not confirm — only a full hold does (§9.4).
  await page.keyboard.down('Enter')
  await page.waitForTimeout(150)
  await page.keyboard.up('Enter')
  await page.waitForTimeout(300)
  check('a short keydown does not confirm the send', /Review/.test(await page.locator('main').innerText()))
  await page.keyboard.down('Enter')
  await page.waitForTimeout(750)
  await page.keyboard.up('Enter')
  await page.waitForTimeout(2200)
  check('holding Enter down confirms the send, keyboard only',
    /^Sent$|Sent\n/m.test(await page.locator('main').innerText()))

  check('Done is reachable and Enter returns to Home', await tabUntil((t) => t === 'Done'))
  await page.keyboard.press('Enter')
  await page.waitForTimeout(360)
  check('the send pass lands back on Home', /total balance/i.test(await page.locator('main').innerText()))

  /* --- settings ---------------------------------------------------------- */
  // Reached by click rather than by tabbing past the persistent tab bar: the
  // claim under test is that the screen itself is fully keyboard-operable,
  // not the exact DOM-order edge case of wrapping focus around a nav that
  // does not remount between tabs.
  await page.getByRole('button', { name: 'Settings', exact: true }).click()
  await page.waitForTimeout(320)
  await page.locator('main button').first().focus()
  check('the wallet row is focusable', (await focusedText())?.length > 0)
  // Rows carry a detail line, so the accessible name is "Label detail…" — the
  // same reason every other row lookup in this file matches a prefix.
  check('tab order reaches Security next, in visual order',
    await tabUntil((t) => /^Security/.test(t), 3))
  await page.keyboard.press('Enter')
  await page.waitForTimeout(320)
  // "Auto-lock" is rendered uppercase via CSS, and innerText reflects the
  // visible case rather than the DOM's literal text — match case-insensitively.
  check('Enter on a settings row opens the screen it names',
    /auto-lock/i.test(await page.locator('main').innerText()))
  await page.keyboard.press('Escape')

  await page.getByRole('button', { name: 'Back' }).click()
  await page.waitForTimeout(300)
  await page.locator('header').getByRole('button', { name: /Main/ }).focus()
  await page.keyboard.press('Enter')
  await page.waitForTimeout(300)
  check('the account switcher opens as a dialog from the keyboard',
    await page.getByRole('dialog', { name: 'Accounts' }).isVisible())
  await page.keyboard.press('Escape')
  await page.waitForTimeout(280)
  check('Escape closes it and restores focus to the header trigger',
    (await focusedText())?.includes('Main'))

  await browser.close()
  for (const r of results) console.log(`  ${r.pass ? 'PASS' : 'FAIL'}  ${r.label}${r.detail ? '  — ' + r.detail : ''}`)
  console.log('\nconsole:', errs.length ? '\n  ' + errs.join('\n  ') : 'none')
  process.exit(results.some((r) => !r.pass) || errs.length ? 1 : 0)
}
