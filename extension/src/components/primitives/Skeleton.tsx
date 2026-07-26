/**
 * Loading placeholder. The mock layer is synchronous so nothing in the prototype
 * uses this yet — it exists because a backend will make some of these rows async,
 * and reserving the shape now is what stops the layout shifting later (§11).
 */
export default function Skeleton({
  className = '',
  rounded = 'control',
}: {
  className?: string
  rounded?: 'control' | 'card' | 'pill'
}) {
  const radius = { control: 'rounded-control', card: 'rounded-card', pill: 'rounded-pill' }[rounded]
  return (
    <div
      aria-hidden
      className={`animate-pulse bg-surface-2 ${radius} ${className}`.trim()}
    />
  )
}
