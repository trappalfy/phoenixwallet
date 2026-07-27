/** A 1px hairline rule. Elevation is drawn with these, not with lighter fills (§5.4). */
export default function Divider({ className = '' }: { className?: string }) {
  return <hr className={`border-0 border-t border-hairline ${className}`.trim()} />
}
