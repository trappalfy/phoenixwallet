// One trust-boundary check: format only (no wallet, no backend to hit).
export const validateEmail = (v: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())

// self-check (stripped from prod bundle)
if (import.meta.env.DEV) {
  console.assert(validateEmail('a@b.co'), 'valid email should pass')
  console.assert(validateEmail(' x@y.io '), 'trimmed email should pass')
  console.assert(!validateEmail('a@b'), 'missing TLD should fail')
  console.assert(!validateEmail('nope'), 'no @ should fail')
  console.assert(!validateEmail(''), 'empty should fail')
}
