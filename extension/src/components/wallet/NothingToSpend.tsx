import BackBar from '../shell/BackBar'
import Button from '../primitives/Button'
import EmptyState from './EmptyState'
import { useNav } from '../../router/useNav'

/**
 * Stands in for Send and Swap when the account holds nothing on this network.
 * An account added during the session starts empty, so these screens can be
 * opened with no assets behind them — and every one of them used to read
 * `tokens[0]` and would have rendered blanks.
 */
export default function NothingToSpend({
  title,
  chainName,
}: {
  title: string
  chainName: string
}) {
  const nav = useNav()

  return (
    <div className="flex h-full flex-col">
      <BackBar title={title} />
      <EmptyState
        title={`Nothing to spend on ${chainName}`}
        body="This account holds no assets on this network yet. Receive something here, or switch to a network where it does."
        action={<Button onClick={() => nav.replace({ name: 'receive' })}>Receive</Button>}
      />
    </div>
  )
}
