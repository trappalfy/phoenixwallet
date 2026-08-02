import BackBar from '../../components/shell/BackBar'
import { useNav } from '../../router/useNav'
import { Plus, Download, ChevronRight } from '../../components/icons'
import type { Route } from '../../router/routes'

const OPTIONS: readonly {
  route: Route
  Icon: typeof Plus
  title: string
  body: string
}[] = [
  {
    route: { name: 'setPassword' },
    Icon: Plus,
    title: 'Create a new wallet',
    // Plain language, no implementation words (§6): "recovery phrase", never "mnemonic seed".
    body: 'Perigee generates a new recovery phrase of twelve words. Write it down — it is the only way back into this wallet.',
  },
  {
    route: { name: 'importSeed' },
    Icon: Download,
    title: 'Use an existing wallet',
    body: 'Already have a recovery phrase or a private key from another wallet? Bring it here and your accounts come with it.',
  },
]

export default function CreateOrImport() {
  const nav = useNav()

  return (
    <div className="flex h-full flex-col">
      <BackBar title="Get started" />
      <div className="scroll-region flex-1 px-gutter pb-5">
        <div className="space-y-2.5 pt-2">
          {OPTIONS.map(({ route, Icon, title, body }) => (
            <button
              key={title}
              type="button"
              onClick={() => nav.push(route)}
              className="flex w-full gap-3 rounded-card border border-hairline bg-surface-1 p-4 text-left transition-colors duration-state ease-out hover:bg-surface-2"
            >
              <span className="mt-0.5 shrink-0 text-accent">
                <Icon size={20} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1">
                  <span className="flex-1 text-15 text-text">{title}</span>
                  <ChevronRight size={16} className="shrink-0 text-text-mute" />
                </span>
                <span className="mt-1 block text-13 text-text-dim">{body}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
