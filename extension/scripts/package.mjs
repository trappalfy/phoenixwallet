// Zips dist/ for Chrome Web Store submission. Run after `npm run build`.
//
//   npm run build
//   npm run package
//
// Uses the system `zip` binary rather than adding a dependency (§3 keeps the
// dependency list to exactly what the UI needs).
import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, rmSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const DIST = `${ROOT}dist`
const OUT_DIR = `${ROOT}store/build`

if (!existsSync(DIST)) {
  console.error('dist/ not found — run `npm run build` first.')
  process.exit(1)
}

const pkg = JSON.parse(readFileSync(`${ROOT}package.json`, 'utf8'))
const outFile = `${OUT_DIR}/perigee-wallet-${pkg.version}.zip`

mkdirSync(OUT_DIR, { recursive: true })
if (existsSync(outFile)) rmSync(outFile)

// Zipped from *inside* dist/ so manifest.json sits at the archive root, which
// is what the Chrome Web Store upload expects — not nested under a dist/ folder.
function hasZip() {
  try {
    execSync('zip -v', { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

if (hasZip()) {
  execSync(`cd "${DIST}" && zip -rq "${outFile}" .`, { stdio: 'inherit' })
} else {
  // Stock Windows has no `zip`. Compress-Archive is built in but PowerShell 5.1
  // writes entry paths with backslashes, which unzip on macOS/Linux turns into
  // flat files literally named "assets\index.js" — a broken extension. So build
  // the archive entry by entry with forward slashes. Runs from a temp .ps1:
  // `-Command -` executes stdin line by line and mangles multi-line blocks.
  const ps = [
    `$ErrorActionPreference = 'Stop'`,
    `Add-Type -AssemblyName System.IO.Compression.FileSystem`,
    `$src = (Resolve-Path '${DIST}').Path`,
    `$zip = [System.IO.Compression.ZipFile]::Open('${outFile.replace(/\//g, '\\')}', 'Create')`,
    `try {`,
    `  Get-ChildItem -LiteralPath $src -Recurse -File | ForEach-Object {`,
    `    $rel = $_.FullName.Substring($src.Length + 1).Replace('\\', '/')`,
    `    [void][System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, $rel, 'Optimal')`,
    `  }`,
    `} finally {`,
    `  $zip.Dispose()`,
    `}`,
  ].join('\n')

  const psFile = join(tmpdir(), `perigee-pack-${process.pid}.ps1`)
  writeFileSync(psFile, ps, 'utf8')
  try {
    execSync(
      `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File "${psFile}"`,
      { stdio: 'inherit' },
    )
  } finally {
    rmSync(psFile, { force: true })
  }
}

console.log(`Packaged ${outFile}`)
