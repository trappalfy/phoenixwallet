// Zips dist/ for Chrome Web Store submission. Run after `npm run build`.
//
//   npm run build
//   npm run package
//
// Uses the system `zip` binary rather than adding a dependency (§3 keeps the
// dependency list to exactly what the UI needs).
import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, rmSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const DIST = `${ROOT}dist`
const OUT_DIR = `${ROOT}store/build`

if (!existsSync(DIST)) {
  console.error('dist/ not found — run `npm run build` first.')
  process.exit(1)
}

const pkg = JSON.parse(readFileSync(`${ROOT}package.json`, 'utf8'))
const outFile = `${OUT_DIR}/phoenix-wallet-${pkg.version}.zip`

mkdirSync(OUT_DIR, { recursive: true })
if (existsSync(outFile)) rmSync(outFile)

// Zipped from *inside* dist/ so manifest.json sits at the archive root, which
// is what the Chrome Web Store upload expects — not nested under a dist/ folder.
execSync(`cd "${DIST}" && zip -rq "${outFile}" .`, { stdio: 'inherit' })

console.log(`Packaged ${outFile}`)
